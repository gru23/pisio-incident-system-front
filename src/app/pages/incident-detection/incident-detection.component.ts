import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MapComponent } from '../../components/map/map.component';
import { AlertService } from '../../services/alert/alert.service';
import { DetectionPositionModel } from '../../models/alert/detection-position-model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IncidentModel } from '../../models/incident-model';
import { IncidentDetectionRequestDto } from '../../models/requests/incident-detection.dto';


@Component({
  selector: 'app-incident-detection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTableModule,
    MapComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './incident-detection.component.html',
  styleUrls: ['./incident-detection.component.css']
})
export class IncidentDetectionComponent implements OnInit, AfterViewInit  {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  detectionForm: FormGroup;
  detectionPosition?: DetectionPositionModel;

  incidents: IncidentModel[] = []; // ili puni sa backend-a
  displayedColumns: string[] = ['type', 'subtype', 'description', 'address', 'city', 'country'];
  dataSource = new MatTableDataSource<IncidentModel>(this.incidents);

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.detectionForm = this.fb.group({
      radius: [1000],
      date: [new Date()]
    });
  }

  ngOnInit(): void {
    this.loadDetectionPosition();
    // this.loadIncidents();

    // Osluškuj promjene radius-a i update kruga na mapi
    this.detectionForm.get('radius')?.valueChanges.subscribe((newRadius) => {
      if (this.detectionPosition?.latitude && this.detectionPosition?.longitude) {
        this.mapComponent.showRadius(
          this.detectionPosition.latitude,
          this.detectionPosition.longitude,
          parseFloat(newRadius)
        );
      }
    });
  }

  ngAfterViewInit(): void {
    // Kada je mapa inicijalizovana, nacrtaj krug ako imamo detectionPosition
    if (this.detectionPosition) {
      this.mapComponent.showRadius(
        this.detectionPosition.latitude,
        this.detectionPosition.longitude,
        this.detectionPosition.radius
      );
    }
  }

  loadDetectionPosition(): void {
    this.alertService.getDetectionPosition().subscribe({
      next: (data: DetectionPositionModel) => {
        this.detectionPosition = data;

        this.detectionForm.patchValue({
          radius: data.radius,
          date: new Date(data.period)
        });
        this.loadIncidents();
      },
      error: (err) => {
        console.error('Error loading detection position:', err);
      }
    });
  }

  loadIncidents() {
    if (!this.detectionPosition) return; // čekamo da detectionPosition bude učitana

    const requestDto: IncidentDetectionRequestDto = {
      centerLatitude: this.detectionPosition.latitude,
      centerLongitude: this.detectionPosition.longitude,
      radius: this.detectionPosition.radius,
      date: this.detectionPosition.period
    };

    this.alertService.getDetectedIncidents(requestDto).subscribe({
      next: (data: IncidentModel[]) => {
        this.incidents = data;
        this.dataSource.data = this.incidents;
      },
      error: (err) => console.error('Error loading incidents:', err)
    });
  }

  onMapClick(coords: { lat: number; lng: number }) {
    // Ažuriramo detectionPosition sa novim koordinatama
    if (!this.detectionPosition) {
      this.detectionPosition = {
        latitude: coords.lat,
        longitude: coords.lng,
        radius: this.detectionForm.value.radius,
        period: this.detectionForm.value.date.toISOString()
      };
    } else {
      this.detectionPosition.latitude = coords.lat;
      this.detectionPosition.longitude = coords.lng;
    }

    console.log('📍 Nova lokacija:', this.detectionPosition);

    // Prikaži crveni krug prema novoj lokaciji
    if (this.mapComponent && this.detectionPosition.radius) {
      this.mapComponent.showRadius(
        coords.lat,
        coords.lng,
        this.detectionPosition.radius
      );
    }
  }

  onUpdate() {
    if (!this.detectionPosition) return;

    const formValue = this.detectionForm.value;

    // Napravimo payload koristeći vrijednosti iz forme i trenutne koordinate
    const payload: DetectionPositionModel = {
      latitude: this.detectionPosition.latitude,
      longitude: this.detectionPosition.longitude,
      radius: parseFloat(formValue.radius),
      period: formValue.date.toISOString()
    };

    console.log('📡 Sending payload:', payload);

    this.alertService.updateDetectionPosition(payload).subscribe({
      next: (updated) => {
        // Ažuriramo lokalni objekat nakon uspješnog POST-a
        this.detectionPosition = updated;
        console.log('✅ Detection position updated:', updated);

        // Prikaz crvenog kruga na mapi prema novim podacima
        if (this.mapComponent) {
          this.mapComponent.showRadius(
            updated.latitude,
            updated.longitude,
            updated.radius
          );
        }
      },
      error: (err) => {
        console.error('❌ Error updating detection position:', err);
      }
    });
  }

  onMapReady() {
  if (this.detectionPosition) {
    this.mapComponent.showRadius(
      this.detectionPosition.latitude,
      this.detectionPosition.longitude,
      this.detectionPosition.radius
    );
  }
}

}

import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MapComponent } from '../../components/map/map.component';
import { HttpClient } from '@angular/common/http';
import { IncidentSubtype, IncidentType, IncidentStatus } from '../../enums';
import { IncidentModel } from '../../models/incident-model';
import { FilterRequestDto } from '../../models/requests/filter-request.dto';
import { IncidentService } from '../../services/incident/incident.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-moderator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MapComponent,
  ],
  templateUrl: './moderator.component.html',
  styleUrl: './moderator.component.css'
})
export class ModeratorComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;


  approvedIncidents: IncidentModel[] = [];
  otherIncidents: IncidentModel[] = [];

  filterForm: FormGroup;
  selectedSubtypes: IncidentSubtype[] = [];

  selectedCoordinates: { lat: number; lng: number } | null = null;

  selectedFilterSubtypes: IncidentSubtype[] = [];

  incidentTypes = [
    {
      type: IncidentType.Accident,
      name: 'Accident',
      subtypes: [IncidentSubtype.CarAccident],
    },
    {
      type: IncidentType.Fire,
      name: 'Fire',
      subtypes: [IncidentSubtype.BuildingFire, IncidentSubtype.CarAccident],
    },
    {
      type: IncidentType.Flood,
      name: 'Flood',
    },
    {
      type: IncidentType.Crime,
      name: 'Crime',
      subtypes: [IncidentSubtype.Assault, IncidentSubtype.Robbery],
    },
  ];
  incidentSubtypes = [
    {
      type: IncidentSubtype.Assault,
      name: 'Assault',
    },
    {
      type: IncidentSubtype.Robbery,
      name: 'Robbery',
    },
    {
      type: IncidentSubtype.CarAccident,
      name: 'Car accident',
    },
    {
      type: IncidentSubtype.BuildingFire,
      name: 'Building fire',
    },
  ];

  timeRanges = [
    { label: 'Last 1h', value: '1h' },
    { label: 'Last 24h', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 31 days', value: '31d' },
    { label: 'All incidents', value: 'all' }
  ];

  incidentStatus = [
    { label: 'Pending', value: IncidentStatus.Pending },
    { label: 'Approved', value: IncidentStatus.Approved },
    { label: 'Rejected', value: IncidentStatus.Rejected },
    { label: 'Reported', value: IncidentStatus.Reported },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private incidentService: IncidentService,
  ) {
    this.filterForm = this.fb.group({
      type: [''],
      subtype: [''],
      location: [''],
      time: [''],
      status: [''],
    });
  }

  ngOnInit(): void {
    // Ovdje samo ucitavamo podatke, ne diramo mapu
    // this.loadApprovedIncidents();
    // this.loadOtherIncidents();
    this.loadAllIncidents();
  }

  onMapReady(): void {
    console.log('🗺️ Mapa spremna — dodajemo markere.');

    // Prikazi sve incidente na mapi kada je spremna
    // this.mapComponent.updateMarkers(this.approvedIncidents);
    // this.mapComponent.addMarkers(this.otherIncidents);
  }

  private loadAllIncidents(): void {
    const requests = [
      this.incidentService.getIncidents(IncidentStatus.Approved),
      this.incidentService.getIncidents(IncidentStatus.Pending),
      this.incidentService.getIncidents(IncidentStatus.Rejected),
      this.incidentService.getIncidents(IncidentStatus.Canceled),
    ];

    forkJoin(requests).subscribe({
      next: (responses) => {
        const allIncidents = responses.flatMap(r => r.content);
        console.log('Incidents ready:', allIncidents);

        if (this.mapComponent) {
          this.mapComponent.updateMarkers(allIncidents);
        }
      },
      error: (err) => console.error('Reading incidents error:', err),
    });
  }



  private loadApprovedIncidents(): void {
    this.incidentService.getIncidents(IncidentStatus.Approved).subscribe({
      next: (data) => (this.approvedIncidents = data.content),
      error: (err) => console.error('Error loading approved:', err),
    });
  }

  private loadOtherIncidents(): void {
    const requests = [
      this.incidentService.getIncidents(IncidentStatus.Pending),
      this.incidentService.getIncidents(IncidentStatus.Rejected),
      this.incidentService.getIncidents(IncidentStatus.Canceled),
    ];

    forkJoin(requests).subscribe({
      next: (responses) => {
        this.otherIncidents = responses.flatMap((r) => r.content);

        console.log('Other incidents ready (Pending/Rejected/Canceled):', this.otherIncidents);

        if (this.mapComponent) {
          this.mapComponent.addMarkers(this.otherIncidents);
        }
      },
      error: (err) => console.error('Error rading other incidnets:', err),
    });
  }


  onTypeChange(): void {
    const form = this.filterForm;
    const selectedType = form.get('type')?.value as IncidentType;
    const subtypes =
      this.incidentTypes.find((t) => t.type === selectedType)?.subtypes || [];
    this.selectedFilterSubtypes = subtypes;


    form.get('subtype')?.setValue('');
  }

  getSubtypeName(subtype: IncidentSubtype): string {
    return (
      this.incidentSubtypes.find((s) => s.type === subtype)?.name || subtype
    );
  }

  applyFilter(): void {
    const filter: FilterRequestDto = {
      incidentType: this.filterForm.value.type || null,
      incidentSubtype: this.filterForm.value.subtype || null,
      location: this.filterForm.value.location?.trim() || null,
      timeRange: this.filterForm.value.time || null,
      status: this.filterForm.value.status || null,
    }

    console.log(filter);

    this.incidentService.filterIncidents(filter, 0, 20).subscribe({
      next: (page) => {
        this.approvedIncidents = page.content;
        this.mapComponent.updateMarkers(this.approvedIncidents);
        console.log('Filtered incidents:', this.approvedIncidents);
      },
      error: (error) => {
        console.error('Error reading filtered incidents:', error);
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.selectedSubtypes = [];
    this.loadApprovedIncidents();
  }
}


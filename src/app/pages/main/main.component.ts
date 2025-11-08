import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MapComponent } from '../../components/map/map.component';
import { IncidentStatus, IncidentType } from '../../enums';
import { IncidentSubtype } from '../../enums';
import { LocationModel } from '../../models/location-model';
import { IncidentModel } from '../../models/incident-model';
import { HttpClient } from '@angular/common/http';
import { IncidentService } from '../../services/incident/incident.service';
import { FilterRequestDto } from '../../models/requests/filter-request.dto';
import { AlertService } from '../../services/alert/alert.service';
import { AnalyticsService } from '../../services/analytics/analytics.service';

@Component({
  selector: 'app-main',
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
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;


  approvedIncidents: IncidentModel[] = [];

  filterForm: FormGroup;
  submitForm: FormGroup;
  selectedSubtypes: IncidentSubtype[] = [];
  selectedImages: File[] = [];

  selectedCoordinates: { lat: number; lng: number } | null = null;

  selectedFilterSubtypes: IncidentSubtype[] = [];
  selectedSubmitSubtypes: IncidentSubtype[] = [];

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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private incidentService: IncidentService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
  ) {
    this.filterForm = this.fb.group({
      type: [''],
      subtype: [''],
      location: [''],
      time: [''],
    });

    this.submitForm = this.fb.group({
      address: ['', Validators.required],
      type: ['', Validators.required],
      subtype: [''],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadApprovedIncidents();
  }

  loadApprovedIncidents(): void {
    this.incidentService.getIncidents('APPROVED').subscribe({
      next: (data) => {
        this.approvedIncidents = data.content;
        this.mapComponent.updateMarkers(this.approvedIncidents);
        console.log('Incidents with status APPROVED:', this.approvedIncidents);
      },
      error: (err) => {
        console.error('Error loading approved incidents:', err);
      }
    });
  }

  onTypeChange(context: 'filter' | 'submit'): void {
    const form = context === 'filter' ? this.filterForm : this.submitForm;
    const selectedType = form.get('type')?.value as IncidentType;
    const subtypes =
      this.incidentTypes.find((t) => t.type === selectedType)?.subtypes || [];

    if (context === 'filter') {
      this.selectedFilterSubtypes = subtypes;
    } else {
      this.selectedSubmitSubtypes = subtypes;
    }

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
      status: IncidentStatus.Approved
    }

    console.log(filter);

    this.incidentService.filterIncidents(filter, 0, 20).subscribe({
      next: (page) => {
        this.approvedIncidents = page.content;
        this.mapComponent.updateMarkers(this.approvedIncidents);
        console.log('Filtered incidents:', this.approvedIncidents);
      },
      error: (error) => {
        console.error('Error filtering incidents:', error);
      }
    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImages = Array.from(input.files);
    }
  }

  uploadImages(): Promise<string[]> {
    if (!this.selectedImages || this.selectedImages.length === 0) {
      return Promise.resolve([]);
    }

    const formData = new FormData();
    this.selectedImages.forEach(file => formData.append('file', file));

    return this.incidentService.uploadImages(formData)
      .toPromise()
      .then((response) => {
        return response || [];
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        return [];
      });
  }



  async onSubmit(): Promise<void> {
    if (this.submitForm.invalid) {
      this.submitForm.markAllAsTouched();
      console.warn('Form not valid.');
      return;
    }

    const formValue = this.submitForm.value;
    const address = formValue.address?.trim();

    let coords: { lat: number; lng: number } | null = null;

    if (address) {
      coords = await this.geocodeAddress(address);

      if (!coords) {
        console.warn('Unsucessful geocoding of entered address.');
        return;
      }
    } else if (this.selectedCoordinates) {
      coords = this.selectedCoordinates;
    } else {
      console.warn('No address, no coordinates.');
      return;
    }

    const { lat, lng } = coords;

    const reverseGeocoded = await this.reverseGeocode(lat, lng);
    if (!reverseGeocoded) {
      console.warn('Unsucessful reverse geocoding.');
      return;
    }

    const location: LocationModel = {
      latitude: Number(lat.toPrecision(6)),
      longitude: Number(lng.toPrecision(6)),
      ...reverseGeocoded,
    };

    const uploadedPaths = await this.uploadImages();

    const incident: IncidentModel = {
      type: formValue.type,
      subtype: formValue.subtype === '' ? null : formValue.subtype,
      location,
      description: formValue.description,
      images: uploadedPaths.map(path => ({ imageUrl: path })),
      status: IncidentStatus.Pending
    };

    console.log('Sending incident:', incident);

    this.incidentService.submitIncident(incident).subscribe({
      next: (response) => {
        this.mapComponent.removeCurrentMarker();
        this.submitForm.reset();
        this.selectedCoordinates = null;
        console.log('Incident sent:', response);
      },
      error: (err) => {
        console.error('Error sending incident:', err);
      },
    });

    this.alertService.submitIncident(incident).subscribe({
      next: (response) => {
        console.log('Incident sent:', response);
      },
      error: (err) => {
        console.error('Error sending incident alert:', err);
      },
    });

    this.analyticsService.submitIncident(incident).subscribe({
      next: (response) => {
        console.log('Incident sent:', response);
      },
      error: (err) => {
        console.error('Error sending incident analytics:', err);
      },
    });
    
    this.selectedImages = [];

  }



  onMapLocationSelected(coords: { lat: number; lng: number }) {
    this.selectedCoordinates = coords;
    console.log('Selected location:', coords);

    this.reverseGeocode(coords.lat, coords.lng)
      .then((address) => {
        console.log('Reverse geocoding data:', address);
        this.reverseGeocodedAddress = address;

        const formatted = address.address;
        this.submitForm.get('address')?.setValue(formatted);
      })
      .catch((error) => {
        console.error('Reverse geocoding error:', error);
      });
  }

  reverseGeocodedAddress: Omit<LocationModel, 'latitude' | 'longitude'> | null =
    null;

  private async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<Omit<LocationModel, 'latitude' | 'longitude'>> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    const response: any = await this.http
      .get(url, {
        headers: { 'Accept-Language': 'en' },
      })
      .toPromise();

    const address = response.address;

    return {
      radius: 1000,
      address: response.display_name || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      country: address.country || '',
      zipcode: address.postcode || '',
    };
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    try {
      const response: any = await this.http.get(url, {
        headers: {
          'Accept-Language': 'en',
          // 'User-Agent': 'your-app-name'
        }
      }).toPromise();

      if (Array.isArray(response) && response.length > 0) {
        return {
          lat: parseFloat(response[0].lat),
          lng: parseFloat(response[0].lon),
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding address error:', error);
      return null;
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.selectedSubtypes = [];
    this.loadApprovedIncidents();
  }
}

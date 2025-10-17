import { Component } from '@angular/core';
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
import { IncidentType } from '../../enums';
import { IncidentSubtype } from '../../enums';
import { LocationModel } from '../../models/location-model';
import { IncidentModel } from '../../models/incident-model';
import { HttpClient } from '@angular/common/http';
import { IncidentService } from '../../services/incident/incident.service';

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
export class MainComponent {
  filterForm: FormGroup;
  submitForm: FormGroup;
  selectedSubtypes: IncidentSubtype[] = [];
  selectedImage: File | null = null;

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
      subtypes: [IncidentSubtype.BuildingFire],
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
    { label: 'Last 24h', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 31 days', value: '31d' },
    { label: 'All reports', value: 'all' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private incidentService: IncidentService
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
    console.log('Filter podaci:', {
      type: this.filterForm.value.type,
      subtype: this.filterForm.value.subtype,
      location: this.filterForm.value.location,
      time: this.filterForm.value.time,
    });

    // Poziv API-ja ili emit događaja za filtriranje
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  onSubmit(): void {
    if (
      this.submitForm.invalid ||
      !this.selectedCoordinates ||
      !this.reverseGeocodedAddress
    ) {
      this.submitForm.markAllAsTouched();
      console.warn('Forma nije validna ili lokacija/adresa nije dostupna.');
      return;
    }

    const formValue = this.submitForm.value;
    const { lat, lng } = this.selectedCoordinates;

    const location: LocationModel = {
      latitude: Number(lat.toPrecision(6)),
      longitude: Number(lng.toPrecision(6)),
      ...this.reverseGeocodedAddress,
    };

    const incident: IncidentModel = {
      type: formValue.type,
      subtype: formValue.subtype === '' ? null : formValue.subtype,
      location,
      description: formValue.description,
      images: [], // za sada prazno
    };

    console.log('✅ Incident za slanje:', incident);
    this.submitForm.reset();

    this.incidentService.submitIncident(incident).subscribe({
      next: (response) => {
        console.log('✅ Incident uspješno poslan:', response);
        // Ovdje možeš prikazati poruku ili resetovati formu
        this.submitForm.reset();
        this.selectedCoordinates = null;
      },
      error: (err) => {
        console.error('⛔ Greška prilikom slanja incidenta:', err);
      },
    });
  }

  onMapLocationSelected(coords: { lat: number; lng: number }) {
    this.selectedCoordinates = coords;
    console.log('📍 Odabrana lokacija:', coords);

    this.reverseGeocode(coords.lat, coords.lng)
      .then((address) => {
        console.log('📬 Reverse geocoding podaci:', address);
        this.reverseGeocodedAddress = address;

        // 👉 Formatiraj adresu za prikaz u formi
        const formatted = address.address;
        this.submitForm.get('address')?.setValue(formatted);
      })
      .catch((error) => {
        console.error('⛔ Reverse geocoding greška:', error);
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
      radius: 500,
      address: response.display_name || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      country: address.country || '',
      zipcode: address.postcode || '',
    };
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.selectedSubtypes = [];
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MapComponent } from '../../components/map/map.component';

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
    MapComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  form: FormGroup;
  selectedSubtypes: string[] = [];
  selectedImage: File | null = null;

  incidentTypes = [
    { name: 'Saobraćaj', subtypes: ['Udes', 'Gužva', 'Radovi'] },
    { name: 'Požar', subtypes: ['Šuma', 'Zgrada', 'Vozilo'] },
    { name: 'Poplava', subtypes: ['Reka', 'Ulica'] }
  ];

  timeRanges = [
    { label: 'Zadnjih 24h', value: '24h' },
    { label: 'Zadnjih 7 dana', value: '7d' },
    { label: 'Zadnjih 31 dan', value: '31d' },
    { label: 'Sve prijave', value: 'all' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      type: [''],
      subtype: [''],
      location: [''],
      time: [''],
      address: [''],
      description: ['']
    });
  }

  onTypeChange(): void {
    const selected = this.form.get('type')?.value;
    this.selectedSubtypes = this.incidentTypes.find(t => t.name === selected)?.subtypes || [];
    this.form.get('subtype')?.setValue('');
  }

  applyFilter(): void {
    console.log('Filter podaci:', {
      type: this.form.value.type,
      subtype: this.form.value.subtype,
      location: this.form.value.location,
      time: this.form.value.time
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
    const reportData = {
      address: this.form.value.address,
      type: this.form.value.type,
      subtype: this.form.value.subtype,
      description: this.form.value.description,
      imageName: this.selectedImage?.name || null
    };

    console.log('📩 Prijava incidenta:', reportData);

    if (this.selectedImage) {
      console.log('📷 Slika:', this.selectedImage);
      // Slanje putem FormData ako šalješ na backend
    }

    // Reset forme ako želiš
    // this.form.reset();
    // this.selectedImage = null;
  }

  clearFilters(): void {
    this.form.reset();
    this.selectedSubtypes = [];
  }
}

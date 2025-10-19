import {
  Component,
  OnInit,
  PLATFORM_ID,
  Inject,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IncidentModel } from '../../models/incident-model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() incidents: IncidentModel[] = [];
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private isBrowser: boolean;
  private map: any;
  private currentMarker: any; // tip L.Marker, ali koristimo `any` da ne importujemo Leaflet globalno

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    const L = await import('leaflet');

    // ✅ Ikona za approved incidente
    const approvedIcon = L.icon({
      iconUrl: 'assets/leaflet/approved_marker_32.png',
      iconRetinaUrl: 'assets/leaflet/approved_marker_64.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [32, 32]
    });

    // 📍 Ikona za trenutno odabrani marker (klik na mapu)
    this.currentIcon = L.icon({
      iconUrl: 'assets/leaflet/current_marker_32.png',
      iconRetinaUrl: 'assets/leaflet/current_marker_64.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [32, 32]
    });

    // Inicijalizacija mape
    this.map = L.map('map').setView([44.284536, 18.0626781], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // 🧷 Dodaj markere za incidente iz baze sa approved ikonom
    this.incidents.forEach((incident) => {
      const { latitude, longitude } = incident.location;
      L.marker([latitude, longitude], { icon: approvedIcon })
        .addTo(this.map)
        .bindPopup(
          `<b>${incident.type}</b><br />
           <b>Description: </b>${incident.description}<br />
           <b>Address: </b>${incident.location.address}`
        );
    });

    // 📍 Postavljanje markera klikom na mapu
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      if (this.currentMarker) {
        this.currentMarker.setLatLng([lat, lng]);
      } else {
        this.currentMarker = L.marker([lat, lng], { icon: this.currentIcon }).addTo(this.map);
      }

      this.locationSelected.emit({ lat, lng });
    });

    // Popravi dimenzije mape ako je u tabu itd.
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  // 🔻 Poziva se iz MainComponent nakon uspješnog submita
  public removeCurrentMarker(): void {
    if (this.currentMarker && this.map) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = null;
    }
  }

  private currentIcon: any;
}
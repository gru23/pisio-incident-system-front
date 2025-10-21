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
  private currentMarker: any;
  private currentIcon: any;
  private approvedIcon: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    const L = await import('leaflet');
    (window as any).L = L; // omogućava korištenje u drugim metodama

    // ✅ Ikona za approved incidente
    this.approvedIcon = L.icon({
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

    // ➕ Dodaj početne incidente
    this.addIncidentMarkers(this.incidents);

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

  /**
   * 🔁 Ažurira markere na osnovu novih incidenata.
   */
  public updateMarkers(incidents: IncidentModel[]): void {
    if (!this.map) return;

    const L = (window as any).L;

    // Ukloni sve prethodne markere osim currentMarkera
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer !== this.currentMarker) {
        this.map.removeLayer(layer);
      }
    });

    this.addIncidentMarkers(incidents);
  }

  /**
   * ✅ Pomoćna metoda za dodavanje markera.
   */
  private addIncidentMarkers(incidents: IncidentModel[]): void {
    const L = (window as any).L;

    incidents.forEach((incident) => {
      const { latitude, longitude } = incident.location;

      L.marker([latitude, longitude], { icon: this.approvedIcon })
        .addTo(this.map)
        .bindPopup(
          `<b>${incident.type}</b><br />
           <b>Description:</b> ${incident.description}<br />
           <b>Address:</b> ${incident.location.address}`
        );
    });
  }

  /**
   * 🔻 Uklanja trenutno selektovani marker (npr. nakon slanja forme).
   */
  public removeCurrentMarker(): void {
    if (this.currentMarker && this.map) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = null;
    }
  }
}
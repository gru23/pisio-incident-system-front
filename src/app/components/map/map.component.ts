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
import { IncidentStatus } from '../../enums';
import { ModerationService } from '../../services/moderation/moderation.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() incidents: IncidentModel[] = [];
  @Input() isModerator: boolean = false; // default false
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Output() mapReady = new EventEmitter<void>(); // 👈 novi event

  private isBrowser: boolean;
  private map: any;
  private currentMarker: any;
  private currentIcon: any;
  private approvedIcon: any;
  private reportedIcon: any;
  private rejectedIcon: any;
  private pendingIcon: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private moderationService: ModerationService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    const L = await import('leaflet');
    (window as any).L = L;

    // 🔹 Definicija ikonica
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

    this.reportedIcon = L.icon({
      iconUrl: 'assets/leaflet/reported_marker_32.png',
      iconRetinaUrl: 'assets/leaflet/reported_marker_64.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [32, 32]
    });

    this.rejectedIcon = L.icon({
      iconUrl: 'assets/leaflet/rejected_marker_32.png',
      iconRetinaUrl: 'assets/leaflet/rejected_marker_64.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [32, 32]
    });

    this.pendingIcon = L.icon({
      iconUrl: 'assets/leaflet/pending_marker_32.png',
      iconRetinaUrl: 'assets/leaflet/pending_marker_64.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [32, 32]
    });

    // 🗺️ Inicijalizacija mape
    this.map = L.map('map').setView([44.284536, 18.0626781], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // ➕ Dodaj početne incidente
    this.addIncidentMarkers(this.incidents);

    // 📍 Klik na mapu — dodavanje trenutnog markera
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      if (this.currentMarker) {
        this.currentMarker.setLatLng([lat, lng]);
      } else {
        this.currentMarker = L.marker([lat, lng], { icon: this.currentIcon }).addTo(this.map);
      }

      this.locationSelected.emit({ lat, lng });
    });

    // ⏳ Kada je mapa spremna, javi parent komponenti
    setTimeout(() => {
      this.map.invalidateSize();
      this.mapReady.emit(); // 👈 Ovdje javljamo moderatoru da je mapa spremna
    }, 0);
  }

  public updateMarkers(incidents: IncidentModel[]): void {
    if (!this.map) return;

    const L = (window as any).L;

    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer !== this.currentMarker) {
        this.map.removeLayer(layer);
      }
    });

    this.addIncidentMarkers(incidents);
  }

  



  async addMarkers(incidents: IncidentModel[]) {
    if (!this.map) {
      console.warn('🕓 Mapa još nije spremna za markere.');
      return;
    }

    const L = (window as any).L;

    incidents.forEach((incident) => {
      const { latitude, longitude } = incident.location;
      const icon = this.getMarkerIcon(incident.status);

      L.marker([latitude, longitude], { icon })
  .addTo(this.map)
  .bindPopup(this.buildPopupContent(incident))
  .on('popupopen', () => {
    const select = document.getElementById(`status-select-${incident.id}`) as HTMLSelectElement;
    const button = document.getElementById(`submit-status-${incident.id}`) as HTMLButtonElement;

    if (button && select) {
      button.addEventListener('click', () => {
        const selectedStatus = select.value;
        this.changeStatus(incident, selectedStatus);
      });
    }
  });

    });
  }

  getMarkerIcon(status: IncidentStatus) {
    switch (status) {
      case IncidentStatus.Approved:
        return this.approvedIcon;
      case IncidentStatus.Reported:
        return this.reportedIcon;
      case IncidentStatus.Pending:
        return this.pendingIcon;
      case IncidentStatus.Rejected:
        return this.rejectedIcon;
    }
  }

  public removeCurrentMarker(): void {
    if (this.currentMarker && this.map) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = null;
    }
  }
  
  private addIncidentMarkers(incidents: IncidentModel[]): void {
  const L = (window as any).L;

  incidents.forEach((incident) => {
    const { latitude, longitude } = incident.location;
    const marker = L.marker([latitude, longitude], { icon: this.getMarkerIcon(incident.status) }).addTo(this.map);

    // Čuvamo incidentId u marker-u
    (marker as any).incidentId = incident.id;

    const popupContent = this.buildPopupContent(incident);
    marker.bindPopup(popupContent);

    // 🧠 Kada se popup otvori, dodaj event listener sa once: true
    marker.on('popupopen', () => {
      if(!this.isModerator) return;
      
      const selectEl = document.getElementById(`status-select-${incident.id}`) as HTMLSelectElement;
      const submitBtn = document.getElementById(`submit-status-${incident.id}`) as HTMLButtonElement;

      submitBtn?.addEventListener('click', () => {
        if (selectEl) {
          const newStatus = selectEl.value;
          this.changeStatus(incident, newStatus);
        }
      }, { once: true }); // <-- listener se aktivira samo jednom po popupu
    });
  });
}

private changeStatus(incident: IncidentModel, newStatus: string): void {
  if(!incident.id) return;

  const parsedStatus = newStatus as IncidentStatus;

  this.moderationService.updateIncidentStatus(incident.id, parsedStatus).subscribe({
    next: (updatedIncident) => {
      console.log('✅ Status ažuriran na backendu:', updatedIncident);

      // 🔄 Ažuriraj lokalni status incidenta
      incident.status = updatedIncident.status;

      // 📍 Pronađi marker po incidentId, a ne po lat/lng
      this.map.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L.Marker && layer.incidentId === incident.id) {
          layer.setIcon(this.getMarkerIcon(updatedIncident.status));
          layer.bindPopup(this.buildPopupContent(incident));
        }
      });

      alert(`✅ Status incidenta #${incident.id} promijenjen u: ${updatedIncident.status}`);
    },
    error: (err) => {
      console.error('⛔ Greška pri promjeni statusa incidenta:', err);
      alert('Greška pri promjeni statusa!');
    },
  });
}


  private buildPopupContent(incident: IncidentModel): string {
  const baseContent = `
    <h3>${incident.status}</h3>
    <b>${incident.type}</b><br/>
    <b>Description:</b> ${incident.description}<br/>
    <b>Address:</b> ${incident.location.address}<br/>
  `;

  if (this.isModerator) {
    return baseContent + `
      <hr/>
      <label for="status-select-${incident.id}">Change status:</label>
      <select id="status-select-${incident.id}">
        <option value="PENDING" ${incident.status === 'PENDING' ? 'selected' : ''}>Pending</option>
        <option value="APPROVED" ${incident.status === 'APPROVED' ? 'selected' : ''}>Approved</option>
        <option value="REJECTED" ${incident.status === 'REJECTED' ? 'selected' : ''}>Rejected</option>
        <option value="REPORTED" ${incident.status === 'REPORTED' ? 'selected' : ''}>Reported</option>
      </select>
      <button id="submit-status-${incident.id}" style="margin-top:4px;">Submit</button>
    `;
  }

  return baseContent; // običan korisnik vidi samo informacije
}


}

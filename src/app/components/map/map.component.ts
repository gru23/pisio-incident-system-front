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
import { AlertService } from '../../services/alert/alert.service';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { IncidentService } from '../../services/incident/incident.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() incidents: IncidentModel[] = [];
  @Input() isModerator: boolean = false;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Output() mapReady = new EventEmitter<void>();

  private isBrowser: boolean;
  private map: any;
  private currentMarker: any;
  private currentIcon: any;
  private approvedIcon: any;
  private reportedIcon: any;
  private rejectedIcon: any;
  private pendingIcon: any;

  private radiusCircle: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private incidentService: IncidentService,
    private moderationService: ModerationService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    const L = await import('leaflet');
    (window as any).L = L;

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

    this.map = L.map('map').setView([44.284536, 18.0626781], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.addIncidentMarkers(this.incidents);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      if (this.currentMarker) {
        this.currentMarker.setLatLng([lat, lng]);
      } else {
        this.currentMarker = L.marker([lat, lng], { icon: this.currentIcon }).addTo(this.map);
      }

      this.locationSelected.emit({ lat, lng });
    });

    setTimeout(() => {
      this.map.invalidateSize();
      this.mapReady.emit();
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
      console.warn('Map is not ready for markers.');
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

      (marker as any).incidentId = incident.id;

      const popupContent = this.buildPopupContent(incident);
      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        if (!this.isModerator) return;

        const selectEl = document.getElementById(`status-select-${incident.id}`) as HTMLSelectElement;
        const submitBtn = document.getElementById(`submit-status-${incident.id}`) as HTMLButtonElement;

        submitBtn?.addEventListener('click', () => {
          if (selectEl) {
            const newStatus = selectEl.value;
            this.changeStatus(incident, newStatus);
          }
        }, { once: true });
      });
    });
  }

  private changeStatus(incident: IncidentModel, newStatus: string): void {
    if (!incident.id) return;

    const parsedStatus = newStatus as IncidentStatus;

    this.moderationService.updateIncidentStatus(incident.id, parsedStatus).subscribe({
      next: (updatedIncident) => {
        console.log('Status updated:', updatedIncident);

        incident.status = updatedIncident.status;

        this.map.eachLayer((layer: any) => {
          if (layer instanceof (window as any).L.Marker && layer.incidentId === incident.id) {
            layer.setIcon(this.getMarkerIcon(updatedIncident.status));
            layer.bindPopup(this.buildPopupContent(incident));
          }
        });

        alert(`Incident status #${incident.id} changed to: ${updatedIncident.status}`);
      },
      error: (err) => {
        console.error('Changing incident status error:', err);
        alert('Error while changing status!');
      },
    });

    this.incidentService.updateStatus(incident.id, parsedStatus).subscribe({
      next: (updatedIncident) => {
        console.log('Status update:', updatedIncident);
      },
      error: (err) => {
        console.error('Changing incident status error:', err);
        alert('Error while changing status!');
      },
    });

    this.alertService.updateIncidentStatus(incident.id, parsedStatus).subscribe({
      next: (updatedIncident) => {
        console.log('Changing incident status error:', updatedIncident);
      },
      error: (err) => {
        console.error('Changing incident status error:', err);
        alert('Error while changing status!');
      },
    });

    this.analyticsService.updateIncidentStatus(incident.id, parsedStatus).subscribe({
      next: (updatedIncident) => {
        console.log('Changing incident status error:', updatedIncident);
      },
      error: (err) => {
        console.error('Changing incident status error:', err);
        alert('Error while changing status!');
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

    return baseContent;
  }

  public showRadius(lat: number, lng: number, radiusInKm: number): void {
    if (!this.map) return;

    const radiusInMeters = radiusInKm * 1000;
    const L = (window as any).L;

    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
    }

    this.radiusCircle = L.circle([lat, lng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.2,
      radius: radiusInMeters
    }).addTo(this.map);

    this.map.fitBounds(this.radiusCircle.getBounds());
  }
}

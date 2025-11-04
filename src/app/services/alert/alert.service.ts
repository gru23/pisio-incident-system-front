import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ALERT_ENDPOINTS } from '../../shared/api-endpoints';
import { DetectionPositionRequestDto } from '../../models/requests/detection-position.dto';
import { IncidentDetectionRequestDto } from '../../models/requests/incident-detection.dto';
import { DetectionPositionModel } from '../../models/alert/detection-position-model';
import { IncidentModel } from '../../models/incident-model';
import { IncidentStatus } from '../../enums';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private http: HttpClient) {}

  submitIncident(incident: IncidentModel): Observable<any> {
      return this.http.post(API_ALERT_ENDPOINTS.incidents, incident);
  }

  updateIncidentStatus(id: number, newStatus: IncidentStatus): Observable<IncidentModel> {
    const url = API_ALERT_ENDPOINTS.updateIncidentStatus(id);
    const body = { status: newStatus };
  
    console.log(`📡 PUT ${url}`, body);
  
    return this.http.put<IncidentModel>(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getDetectionPosition(): Observable<DetectionPositionModel> {
    return this.http.get<DetectionPositionModel>(API_ALERT_ENDPOINTS.detectionPosition);
  }
  
  updateDetectionPosition(request: DetectionPositionRequestDto): Observable<any> {
    return this.http.post(API_ALERT_ENDPOINTS.detectionPosition, request);
  }

  getDetectedIncidents(incidentDetection: IncidentDetectionRequestDto): Observable<IncidentModel[]> {
    return this.http.post<IncidentModel[]>(API_ALERT_ENDPOINTS.incidentDetection, incidentDetection);
  }
}

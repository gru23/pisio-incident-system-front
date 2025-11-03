import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ALERT_ENDPOINTS } from '../../shared/api-endpoints';
import { DetectionPositionRequestDto } from '../../models/requests/detection-position.dto';
import { IncidentDetectionRequestDto } from '../../models/requests/incident-detection.dto';
import { DetectionPositionModel } from '../../models/alert/detection-position-model';
import { IncidentModel } from '../../models/incident-model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private http: HttpClient) {}

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

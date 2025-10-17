import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IncidentModel } from '../../models/incident-model';
import { Observable } from 'rxjs';
import { API_INCIDENT_ENDPOINTS } from '../../shared/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  constructor(private http: HttpClient) {}

  submitIncident(incident: IncidentModel): Observable<any> {
    return this.http.post(API_INCIDENT_ENDPOINTS.incidents, incident);
  }
}

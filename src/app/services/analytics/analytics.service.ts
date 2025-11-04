import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ANALYTICS_ENDPOINTS } from '../../shared/api-endpoints';
import { IncidentModel } from '../../models/incident-model';
import { IncidentStatus } from '../../enums';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private http: HttpClient) { }

  submitIncident(incident: IncidentModel): Observable<any> {
        return this.http.post(API_ANALYTICS_ENDPOINTS.incidents, incident);
  }
  
  updateIncidentStatus(id: number, newStatus: IncidentStatus): Observable<IncidentModel> {
      const url = API_ANALYTICS_ENDPOINTS.updateIncidentStatus(id);
      const body = { status: newStatus };
    
      console.log(`📡 PUT ${url}`, body);
    
      return this.http.put<IncidentModel>(url, body, {
        headers: { 'Content-Type': 'application/json' }
      });
  }

  getIncidentCountByCity(): Observable<any> {
    return this.http.get<any>(API_ANALYTICS_ENDPOINTS.cityIncidentCount);
  }

  getIncidentCountByType(): Observable<any> {
    return this.http.get<any>(API_ANALYTICS_ENDPOINTS.typeIncidentCount);
  }

  getIncidentCountByMonth(year: number, month: number): Observable<any>{
    return this.http.get<any>(API_ANALYTICS_ENDPOINTS.incidentPerDay(year, month));
  }
}

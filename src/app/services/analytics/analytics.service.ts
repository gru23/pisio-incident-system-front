import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ANALYTICS_ENDPOINTS } from '../../shared/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private http: HttpClient) { }

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

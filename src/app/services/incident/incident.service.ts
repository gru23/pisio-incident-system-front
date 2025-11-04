import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IncidentModel } from '../../models/incident-model';
import { Observable } from 'rxjs';
import { API_INCIDENT_ENDPOINTS } from '../../shared/api-endpoints';
import { FilterRequestDto } from '../../models/requests/filter-request.dto';
import { IncidentStatus } from '../../enums';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  constructor(private http: HttpClient) {}

  submitIncident(incident: IncidentModel): Observable<any> {
    return this.http.post(API_INCIDENT_ENDPOINTS.incidents, incident);
  }

  getIncidents(status?: string, page: number = 0, size: number = 100): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any>(API_INCIDENT_ENDPOINTS.incidents, { params });
  }

  filterIncidents(
    filter: FilterRequestDto,
    page: number = 0,
    size: number = 10
  ): Observable<Page<IncidentModel>> {

    return this.http.post<Page<IncidentModel>>(API_INCIDENT_ENDPOINTS.filter, filter);
  }

  updateStatus(id: number, newStatus: IncidentStatus): Observable<IncidentModel> {
    const url = API_INCIDENT_ENDPOINTS.updateStatus(id);
    const body = { status: newStatus };
  
    console.log(`📡 PUT ${url}`, body);
  
    return this.http.put<IncidentModel>(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

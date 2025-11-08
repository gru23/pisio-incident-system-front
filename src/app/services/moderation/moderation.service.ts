import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IncidentStatus } from '../../enums';
import { Observable } from 'rxjs';
import { IncidentModel } from '../../models/incident-model';
import { API_MODERATION_ENDPOINTS } from '../../shared/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {

  constructor(private http: HttpClient) { }

 updateIncidentStatus(id: number, newStatus: IncidentStatus): Observable<IncidentModel> {
  const url = API_MODERATION_ENDPOINTS.updateStatus(id);
  const body = { status: newStatus };

  console.log(`PUT ${url}`, body);

  return this.http.put<IncidentModel>(url, body, {
    headers: { 'Content-Type': 'application/json' }
  });
}

  
}

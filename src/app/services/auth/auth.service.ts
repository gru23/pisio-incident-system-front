import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_AUTH_ENDPOINTS } from '../../shared/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  loadUser(): Observable<any> {
    return this.http.get<any>(API_AUTH_ENDPOINTS.loadUser, { withCredentials: true });
  }
}

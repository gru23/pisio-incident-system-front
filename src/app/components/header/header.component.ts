import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { API_AUTH_ENDPOINTS } from '../../shared/api-endpoints';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgIf,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  userEmail: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.authService.loadUser().subscribe({
      next: (response) => {
        if (response.authenticated) {
          this.userEmail = response.email.split("@")[0];

          // samo u browseru koristimo localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('userEmail', response.email);
          }
        } else {
          this.userEmail = null;

          if (typeof window !== 'undefined') {
            localStorage.removeItem('userEmail');
          }
        }
      },
      error: () => {
        this.userEmail = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userEmail');
        }
      }
    });
}


  logout(): void {
    window.location.href = API_AUTH_ENDPOINTS.logout;
  }

  login(): void {
    window.location.href = API_AUTH_ENDPOINTS.login;
  }
}
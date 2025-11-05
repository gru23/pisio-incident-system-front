import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard.service';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
    },
    {
        path: 'main',
        loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent),
        title: 'Incidents',
    },
    {
        path: 'moderator',
        loadComponent: () => import('./pages/moderator/moderator.component').then(m => m.ModeratorComponent),
        title: 'Moderation',
        canActivate: [authGuard]
    },
    {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
        title: 'Analytics',
        canActivate: [authGuard]
    },
    {
        path: 'detection',
        loadComponent: () => import('./pages/incident-detection/incident-detection.component').then(m => m.IncidentDetectionComponent),
        title: 'Detection',
        canActivate: [authGuard]
    }
];
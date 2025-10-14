import { Routes } from '@angular/router';

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
    },
];
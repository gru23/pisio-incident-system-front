import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Proveri da li smo u browseru
  if (isPlatformBrowser(platformId)) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } else {
    // Ako nije browser (npr. SSR), blokiraj pristup ili vrati false
    return false;
  }
};

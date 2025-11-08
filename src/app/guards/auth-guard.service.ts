import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } else {
    return false;
  }
};

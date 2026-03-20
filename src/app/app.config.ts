import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { debugInterceptor } from './core/interceptors/debug.interceptor';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, debugInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: { preset: Aura }
    }),

    // 🔥 AQUÍ ESTÁ LA SOLUCIÓN
    provideLottieOptions({
      player: () => player,
    }),
  ],
};
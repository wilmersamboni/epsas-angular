import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { signal } from '@angular/core';  // ← agrega signal
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
import { provideTaiga } from '@taiga-ui/core';
import { tuiAssetsPathProvider } from '@taiga-ui/core/tokens';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { TUI_LANGUAGE } from '@taiga-ui/i18n/tokens';
import { TUI_SPANISH_LANGUAGE } from '@taiga-ui/i18n/languages/spanish';


registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, debugInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
    { provide: LOCALE_ID, useValue: 'es' },
    {
      provide: TUI_LANGUAGE,
      useFactory: () => signal(TUI_SPANISH_LANGUAGE),  // ← signal()
    },
    ...provideTaiga({ scrollbars: 'native' }),
    tuiAssetsPathProvider('assets/taiga-ui/icons'),
    provideLottieOptions({ player: () => player }),
  ],
};
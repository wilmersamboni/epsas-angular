import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token    = localStorage.getItem('token');
  const centroId = localStorage.getItem('centroId');
  const cargo    = localStorage.getItem('cargo'); // ← nuevo

  const isExternal          = req.url.startsWith('https://bot.kromas.lat');
  const isBackendSecundario = req.url.includes('/api2/');

  const headers: Record<string, string> = {};

  if (token && !isExternal) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isBackendSecundario) {
    if (centroId) headers['X-Centro-ID'] = centroId;
    if (cargo)    headers['X-Cargo']     = cargo; // ← nuevo
  }

  return next(req.clone({ setHeaders: headers }));
};
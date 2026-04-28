import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const centroId = localStorage.getItem('centroId');
  const cargo    = localStorage.getItem('cargo'); // ← nuevo


  const isBackendSecundario = req.url.includes('/api2/');

  const headers: Record<string, string> = {};


  if (isBackendSecundario) {
    if (centroId) headers['X-Centro-ID'] = centroId;
    if (cargo)    headers['X-Cargo']     = cargo; // ← nuevo
  }

  return next(req.clone({ setHeaders: headers }));
};
// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {

//   const centroId = localStorage.getItem('centroId');
//   const cargo    = localStorage.getItem('cargo'); // ← nuevo


//   const isBackendSecundario = req.url.includes('/api2/');

//   const headers: Record<string, string> = {};


//   if (isBackendSecundario) {
//     if (centroId) headers['X-Centro-ID'] = centroId;
//     if (cargo)    headers['X-Cargo']     = cargo; // ← nuevo
//   }

//   return next(req.clone({ setHeaders: headers }));
// };

import { HttpInterceptorFn } from '@angular/common/http';

function resolveTenant(): string | null {
  const hostname = window.location.hostname;

  // En localhost no hay subdominio real, así que no se puede resolver así
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  const parts = hostname.split('.');
  // Necesita al menos subdominio.dominio (2+ segmentos)
  if (parts.length >= 2) {
    return parts[0].toLowerCase();
  }

  return null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const centroId = localStorage.getItem('centroId');
  const cargo    = localStorage.getItem('cargo');
  // En localhost no hay subdominio; usamos el slug guardado en localStorage
  // (centroId contiene el slug que devuelve el login del ERP)
  const tenant   = resolveTenant() ?? centroId ?? null;

  const headers: Record<string, string> = {};
  if (tenant) headers['x-tenant'] = tenant;

  if (req.url.includes('/api2/')) {
    if (centroId) headers['X-Centro-ID'] = centroId;
    if (cargo)    headers['X-Cargo']     = cargo;
  }

  return next(req.clone({ setHeaders: headers }));
};
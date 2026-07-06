import { HttpInterceptorFn } from '@angular/common/http';

function resolveTenant(): string | null {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  // *.localhost en desarrollo (ej: tenant1.localhost)
  if (hostname.endsWith('.localhost')) {
    return hostname.slice(0, hostname.lastIndexOf('.localhost')).toLowerCase();
  }
  // Producción: subdominio.dominio.tld (3+ partes)
  const parts = hostname.split('.');
  return parts.length >= 3 ? parts[0].toLowerCase() : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Rutas del panel admin → Bearer token
  if (req.url.includes('/admin/')) {
    const token = localStorage.getItem('tenant_admin_token');
    if (token) {
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }
    return next(req);
  }

  // Rutas del ERP principal → x-tenant header + cookie de sesión
  const centroId   = localStorage.getItem('centroId');
  const tenantSlug = localStorage.getItem('tenantSlug');
  const cargo      = localStorage.getItem('cargo');
  const tenant     = resolveTenant() ?? tenantSlug ?? null;

  const headers: Record<string, string> = {};
  if (tenant) headers['x-tenant'] = tenant;

  if (req.url.includes('/api2/')) {
    if (centroId) headers['X-Centro-ID'] = centroId;
    if (cargo)    headers['X-Cargo']     = cargo;
  }

  // withCredentials envía la cookie JWT desde subdominios (ej: tenant1.localhost)
  return next(req.clone({ setHeaders: headers, withCredentials: true }));
};

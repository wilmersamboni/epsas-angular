import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Peticiones externas (n8n) — sin modificar
  const isExternal = req.url.startsWith('https://bot.kromas.lat');

  // Login y register no necesitan withCredentials ni token
  const isAuthEndpoint = req.url.includes('/api/auth/login') ||
                        req.url.includes('/api/auth/register');

  if (isExternal || isAuthEndpoint) {
    return next(req);
  }

  // Resto de peticiones — añadir token JWT
  const authReq = req.clone({
    withCredentials: true,
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });

  return next(authReq);
};
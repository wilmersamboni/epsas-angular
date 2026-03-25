import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // No aplicar withCredentials a peticiones externas como n8n
  const isExternal = req.url.startsWith('https://bot.kromas.lat');

  const authReq = req.clone({
    withCredentials: isExternal ? false : true,
    ...(token && !isExternal ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });

  return next(authReq);
};
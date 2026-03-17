import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Añade el token Bearer Y envía cookies en todas las peticiones.
 * Equivale a axios con { withCredentials: true } + interceptors.request
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const authReq = req.clone({
    withCredentials: true,  // envía cookies (necesario para backends con sesión)
    ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}),
  });

  return next(authReq);
};

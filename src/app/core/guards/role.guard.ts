import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de roles: verifica que el cargo del usuario esté entre los roles
 * permitidos definidos en route.data['roles'].
 *
 * Uso en rutas:
 *   {
 *     path: 'admin',
 *     canActivate: [authGuard, roleGuard],
 *     data: { roles: ['administrador'] },
 *     ...
 *   }
 *
 * Si el usuario no tiene el rol requerido, redirige al Home (/).
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];

  if (allowedRoles.length === 0 || auth.hasRole(allowedRoles)) {
    return true;
  }

  // Sin permiso → redirige al home silenciosamente
  return router.createUrlTree(['/']);
};

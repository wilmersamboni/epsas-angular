import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Equivalente al componente <ProtectedRoute> de React.
 *
 * React:
 *   if (!user) return <Navigate to="/login" replace />;
 *   return children;
 *
 * Angular:
 *   if (!isAuthenticated) → redirect to /login
 *   else → allow navigation
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

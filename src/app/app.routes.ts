import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

function tieneSubdominio(): boolean {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
  // *.localhost en desarrollo (ej: tenant1.localhost)
  if (hostname.endsWith('.localhost')) return true;
  // Producción: subdominio.dominio.tld (3+ partes)
  return hostname.split('.').length >= 3;
}

export const routes: Routes = [
  // ─────────────────────────────────────────────
  // SIN SUBDOMINIO → Panel de administración de tenants
  // ─────────────────────────────────────────────
  {
    path: '',
    canMatch: [() => !tieneSubdominio()],
    loadChildren: () => import('./admin-panel.routes').then((m) => m.ADMIN_PANEL_ROUTES),
  },

  // ─────────────────────────────────────────────
  // CON SUBDOMINIO → Main ERP (app de tenant)
  // ─────────────────────────────────────────────
  {
    path: '',
    canMatch: [() => tieneSubdominio()],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'ForgotPassword',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: '404',
        loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: '',
        loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
        children: [
          { path: 'home', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
          { path: 'seguimiento', loadComponent: () => import('./features/seguimiento/seguimiento.component').then((m) => m.SeguimientoComponent) },
          { path: 'docs', canActivate: [roleGuard], data: { roles: ['administrador', 'administrador_erp'] }, loadComponent: () => import('./features/historial/historial.component').then((m) => m.HistorialComponent) },
          { path: 'format', loadComponent: () => import('./features/formatos/formatos.component').then((m) => m.FormatosComponent) },
          { path: 'blog', loadComponent: () => import('./features/chat/chat.component').then((m) => m.ChatComponent) },
          { path: 'admin', canActivate: [roleGuard], data: { roles: ['administrador', 'administrador_erp'] }, loadComponent: () => import('./features/admin/admin-panel/admin-panel.component').then((m) => m.AdminPanelComponent) },
          { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent) },
          { path: 'area-detail/:idArea', loadComponent: () => import('./features/seguimiento/page-course/page-course.component').then((m) => m.PageCourseComponent) },
          { path: 'pagetable/:idCurso', loadComponent: () => import('./features/seguimiento/page-table/aprendices.page.ts').then((m) => m.AprendicesPage) },
          { path: 'migracion', canActivate: [roleGuard], data: { roles: ['administrador', 'administrador_erp'] }, loadComponent: () => import('./features/migracion/migration.component').then((m) => m.MigrationComponent) },
        ],
      },
      { path: '**', redirectTo: '404' },
    ],
  },

  // Comodín global (por si ningún canMatch pasa)
  { path: '**', redirectTo: '' },
];

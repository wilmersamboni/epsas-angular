import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'ForgotPassword',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        m => m.ForgotPasswordComponent
      ),
  },
  // ✅ RUTA 404 PÚBLICA (Fuera del Guard para que todos puedan verla)
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    // canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'seguimiento', loadComponent: () => import('./features/seguimiento/seguimiento.component').then(m => m.SeguimientoComponent) },
      // { path: 'docs', canActivate: [roleGuard], data: { roles: ['administrador'] }, loadComponent: () => import('./features/historial/historial.component').then(m => m.HistorialComponent) },
      { path: 'format', loadComponent: () => import('./features/formatos/formatos.component').then(m => m.FormatosComponent) },
      { path: 'blog', loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent) },
      { path: 'admin', canActivate: [roleGuard], data: { roles: ['administrador'] }, loadComponent: () => import('./features/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'area-detail/:idArea', loadComponent: () => import('./features/seguimiento/page-course/page-course.component').then(m => m.PageCourseComponent) },
      { path: 'pagetable/:idCurso', loadComponent: () => import('./features/seguimiento/page-table/aprendices.page.ts').then(m => m.AprendicesPage) },
      { path: 'migracion', canActivate: [roleGuard], data: { roles: ['administrador'] }, loadComponent: () => import('./features/migracion/migration.component').then(m => m.MigrationComponent) },
    ],
  },
  // COMODÍN: Si no es nada de lo anterior, va al 404
  { path: '**', redirectTo: '404' },
];
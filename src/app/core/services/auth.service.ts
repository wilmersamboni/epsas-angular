import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Usuario, LoginRequest, LoginResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<Usuario | null>(this._loadUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  private _loadUser(): Usuario | null {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  }

  async login(data: LoginRequest): Promise<void> {
    // Sin withCredentials — el backend usa JWT en localStorage, no cookies.
    // withCredentials + wildcard CORS es incompatible con el navegador.
    const resp = await firstValueFrom(
      this.http.post<LoginResponse>(
        'http://localhost:3000/api/auth/login',
        data
      )
    );
    localStorage.setItem('user', JSON.stringify(resp.usuario));
    localStorage.setItem('token', resp.token);
    this._user.set(resp.usuario);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this._user.set(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  actualizarUser(datos: Partial<Usuario>): void {
    const current = this._user();
    const nuevo = { ...current, ...datos };
    localStorage.setItem('user', JSON.stringify(nuevo));
    this._user.set(nuevo);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ── Métodos de autorización ────────────────────────────────────────────────
  /**
   * Retorna el cargo del usuario actual (ej: 'administrador', 'instructor')
   */
  cargo(): string | undefined {
    return this._user()?.cargo;
  }

  /**
   * Verifica si el usuario tiene uno de los cargos especificados
   */
  hasRole(roles: string[]): boolean {
    const userRole = this.cargo();
    if (!userRole) return false;
    return roles.includes(userRole);
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.cargo() === 'administrador';
  }
}
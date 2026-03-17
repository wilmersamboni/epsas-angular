import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Usuario, LoginRequest, LoginResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ── Estado reactivo (señales, equivale al useState de React) ──────────────
  private _user = signal<Usuario | null>(this._loadUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  // ── Inicializar desde localStorage (igual que el init del useState) ────────
  private _loadUser(): Usuario | null {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  }

  // ── login() ────────────────────────────────────────────────────────────────
  // El login va DIRECTO a :3000 (sin proxy) para que el navegador
  // reciba y guarde la cookie de sesión correctamente.
  // Esa misma cookie la envía luego en las peticiones a :3001 vía proxy.
  async login(data: LoginRequest): Promise<void> {
    const resp = await firstValueFrom(
      this.http.post<LoginResponse>(
        'http://localhost:3000/token/generar_token_jwsv',
        data,
        { withCredentials: true }   // ← guarda la cookie que envía :3000
      )
    );
    localStorage.setItem('user', JSON.stringify(resp.usuario));
    localStorage.setItem('token', resp.token);
    this._user.set(resp.usuario);
  }

  // ── logout() ──────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this._user.set(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // ── actualizarUser() — actualiza parcialmente el usuario ──────────────────
  actualizarUser(datos: Partial<Usuario>): void {
    const current = this._user();
    const nuevo = { ...current, ...datos };
    localStorage.setItem('user', JSON.stringify(nuevo));
    this._user.set(nuevo);
  }

  // ── Obtener el token del storage ──────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

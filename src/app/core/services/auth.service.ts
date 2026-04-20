import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Usuario, LoginRequest, LoginResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private USE_BACKEND = false;

  // ── Estado reactivo (señales, equivale al useState de React) ──────────────
  private _user = signal<Usuario | null>(this._loadUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  // ── Inicializar desde localStorage ────────────────────────────────────────
  private _loadUser(): Usuario | null {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
    
  }

  // ── login() ────────────────────────────────────────────────────────────────
  async login(data: LoginRequest): Promise<void> {
<<<<<<< HEAD
    const resp = await firstValueFrom(
      this.http.post<LoginResponse>(
        'http://localhost:3000/token/generar_token_jwsv',
        data,
        { withCredentials: true }
      )
    );
    localStorage.setItem('user', JSON.stringify(resp.usuario));
    localStorage.setItem('token', resp.token);
    this._user.set(resp.usuario);
  }
=======
  const resp = await firstValueFrom(
    this.http.post<LoginResponse>(
      'http://localhost:3000/api/auth/login',
      data,
      { withCredentials: true }
    )
  );
  localStorage.setItem('user', JSON.stringify(resp.usuario));
  //localStorage.setItem('token', resp.token);
  localStorage.setItem('centroId', resp.centroId ?? '');
  localStorage.setItem('cargo', resp.usuario.cargo ?? '');
  this._user.set(resp.usuario);
  
}
>>>>>>> origin/master

  // ── logout() ──────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem('user');
    //localStorage.removeItem('token');
    localStorage.removeItem('centroId');
    localStorage.removeItem('cargo');
    this._user.set(null);
    this.router.navigate(['/login'], { replaceUrl: true });
    
  }

  // ── actualizarUser() ──────────────────────────────────────────────────────
  actualizarUser(datos: Partial<Usuario>): void {
    const current = this._user();
    const nuevo = { ...current, ...datos };
    localStorage.setItem('user', JSON.stringify(nuevo));
    this._user.set(nuevo);
  }

<<<<<<< HEAD
  // ── Obtener token ─────────────────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem('token');
  }
=======
  // ── Obtener el token del storage ──────────────────────────────────────────
  // getToken(): string | null {
  //   return localStorage.getItem('token');
  // }

>>>>>>> origin/master
}
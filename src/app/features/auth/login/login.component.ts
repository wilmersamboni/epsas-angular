import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <!-- Fondo gris claro -->
    <div class="min-h-screen flex items-center justify-center p-4"
         style="background-color: #dce8e0;">

      <!-- Tarjeta principal dividida en 2 -->
      <div class="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex"
           style="min-height: 420px;">

        <!-- Panel izquierdo verde -->
        <div class="w-1/2 flex flex-col justify-between p-10 text-white"
             style="background: linear-gradient(135deg, #2d8400 0%, #39A900 60%, #4dc800 100%);">

          <div>
            <h1 class="text-3xl font-bold mb-4 leading-tight">
              Bienvenido de nuevo
            </h1>
            <p class="text-white/85 text-sm leading-relaxed">
              Accede al sistema EPSAS y gestiona toda tu información
              desde un solo lugar.
            </p>
          </div>

          <!-- Imagen central -->
          <div class="flex justify-center my-6">
            <img src="/img/logo.png" alt="EPSAS"
                 class="w-40 h-40 object-contain drop-shadow-xl"
                 onerror="this.style.opacity='0'" />
          </div>

          <p class="text-white/60 text-xs">
            © {{ year }} EPSAS · Todos los derechos reservados
          </p>
        </div>

        <!-- Panel derecho blanco -->
        <div class="w-1/2 bg-white flex flex-col justify-center px-10 py-10">

          <h2 class="text-2xl font-bold mb-1" style="color: #0f2d4a;">
            Iniciar Sesión
          </h2>
          <p class="text-gray-400 text-sm mb-8">
            Ingresa tus credenciales para continuar
          </p>

          <!-- Error -->
          @if (error()) {
            <div class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Usuario -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Usuario
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  [(ngModel)]="credentials.login"
                  name="login"
                  placeholder="usuario1"
                  required
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
                         transition-colors bg-gray-50"
                />
              </div>
            </div>

            <!-- Contraseña -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="credentials.password"
                  name="password"
                  placeholder="••••••••"
                  required
                  class="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
                         transition-colors bg-gray-50"
                />
                <button type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  @if (showPassword) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Olvidaste contraseña -->
            <div class="text-right">
              <a routerLink="/ForgotPassword"
                 class="text-sm font-medium hover:underline"
                 style="color: #39A900;">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <!-- Botón -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3.5 text-white font-semibold rounded-xl text-sm
                     flex items-center justify-center gap-2
                     transition-all disabled:opacity-60 disabled:cursor-not-allowed
                     hover:brightness-110 active:scale-[0.98]"
              style="background-color: #39A900;">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Ingresando...
              } @else {
                Ingresar
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              }
            </button>

          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  credentials  = { login: '', password: '' };
  loading      = signal(false);
  error        = signal<string | null>(null);
  showPassword = false;
  year         = new Date().getFullYear();

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.login(this.credentials);
      this.router.navigate(['/']);
    } catch {
      this.error.set('Usuario o contraseña incorrectos. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}
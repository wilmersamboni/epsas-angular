import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

/**
 * Equivalente a ForgotPasswordPage.tsx → ForgotPassword.tsx de React.
 * Maneja 3 pasos: solicitar código, verificar, cambiar contraseña.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <!-- Fondo gris claro -->
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style="
        background-color: #ced4d9;
        background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Cpolygon points=%2720,4 36,13 36,31 20,40 4,31 4,13%27 fill=%27none%27 stroke=%27white%27 stroke-width=%271%27 opacity=%270.35%27/%3E%3Ccircle cx=%2758%27 cy=%2720%27 r=%272.5%27 fill=%27white%27 opacity=%270.28%27/%3E%3Ccircle cx=%2758%27 cy=%2760%27 r=%272.5%27 fill=%27white%27 opacity=%270.1%27/%3E%3Crect x=%2752%27 y=%272%27 width=%2714%27 height=%2714%27 rx=%272%27 fill=%27none%27 stroke=%27white%27 stroke-width=%270.9%27 opacity=%270.1%27 transform=%27rotate(20 59 9)%27/%3E%3Cline x1=%2750%27 y1=%2740%27 x2=%2770%27 y2=%2760%27 stroke=%27white%27 stroke-width=%270.8%27 opacity=%270.08%27/%3E%3C/svg%3E');
      "
    >
      <!-- Tarjeta principal dividida en 2 -->
      <div class="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex"
        style="min-height: 420px;">

        <!-- Panel izquierdo verde -->
        <div class="w-1/2 flex flex-col justify-between p-10 text-white rounded-1xl"
          style="background: linear-gradient(135deg, #2d8400 0%, #39A900 60%, #4dc800 100%);">
          <div>
            <h2 class="text-4xl font-bold mb-8">¿Olvidaste tu Contraseña?</h2>
            <p class="text-white/90 text-lg mb-8 mt-10">
              No te preocupes, sigue las instrucciones para restablecer tu contraseña.
            </p>
          </div>
          <a routerLink="/login" class="block text-left mt-4 text-x text-white hover:underline flex items-center gap-1">
            Volver al inicio de sesión
          </a>
        </div>

        <!-- Panel derecho blanco -->
        <div class="w-1/2 flex flex-col bg-white rounded-1xl shadow-xl p-8 w-full max-w-md">

        <h1 class="text-2xl font-bold text-gray-800 mb-3">Recuperar contraseña</h1>
          <p class="text-sm text-gray-400 mb-6">
            {{ step() === 1 ? 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña'
              : step() === 2 ? 'Ingresa el código enviado'
              : 'Ingresa tu nueva contraseña' }}
          </p>
          <label class="text-sm text-black mb-4 ml-1">Correo Electronico</label>

        @if (mensaje()) {
          <div class="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {{ mensaje() }}
          </div>
        }
        @if (error()) {
          <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {{ error() }}
          </div>
        }

        <!-- Paso 1: Correo -->
        @if (step() === 1) {
          <div class="space-y-4">
            <input type="email" [(ngModel)]="correo" placeholder="correo@ejemplo.com"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none mb-3
                focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]" />
            <button (click)="solicitarCodigo()" [disabled]="loading()"
              class="w-full py-3 bg-[#39A900] text-white font-semibold rounded-lg
                hover:bg-[#2d8400] transition-colors disabled:opacity-60">
              Enviar código
            </button>
          </div>
        }

        <!-- Paso 2: Código -->
        @if (step() === 2) {
          <div class="space-y-4">
            <input type="text" [(ngModel)]="codigo" placeholder="Código de verificación"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]" />
            <button (click)="verificarCodigo()" [disabled]="loading()"
              class="w-full py-3 bg-[#39A900] text-white font-semibold rounded-lg
                hover:bg-[#2d8400] transition-colors disabled:opacity-60">
              Verificar código
            </button>
          </div>
        }

        <!-- Paso 3: Nueva contraseña -->
        @if (step() === 3) {
          <div class="space-y-4">
            <input type="password" [(ngModel)]="nuevaPassword" placeholder="Nueva contraseña"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-[#39A900]/40 focus:border-[#39A900]" />
            <button (click)="cambiarPassword()" [disabled]="loading()"
              class="w-full py-3 bg-[#39A900] text-white font-semibold rounded-lg
                  hover:bg-[#2d8400] transition-colors disabled:opacity-60">
              Cambiar contraseña
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  step    = signal(1);
  loading = signal(false);
  error   = signal<string | null>(null);
  mensaje = signal<string | null>(null);

  correo        = '';
  codigo        = '';
  nuevaPassword = '';

  constructor(private api: ApiService) {}

  async solicitarCodigo(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.api.solicitarRecuperacion(this.correo);
      this.mensaje.set('Código enviado a tu correo.');
      this.step.set(2);
    } catch { this.error.set('No se pudo enviar el código.'); }
    finally  { this.loading.set(false); }
  }

  async verificarCodigo(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.api.verificarCodigo(this.correo, this.codigo);
      this.mensaje.set('Código correcto. Ingresa tu nueva contraseña.');
      this.step.set(3);
    } catch { this.error.set('Código incorrecto.'); }
    finally  { this.loading.set(false); }
  }

  async cambiarPassword(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.api.cambiarPassword(this.correo, this.codigo, this.nuevaPassword);
      this.mensaje.set('Contraseña actualizada. Ya puedes iniciar sesión.');
    } catch { this.error.set('No se pudo cambiar la contraseña.'); }
    finally  { this.loading.set(false); }
  }
}

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
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50
                flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <h1 class="text-2xl font-bold text-gray-800 mb-1">Recuperar contraseña</h1>
        <p class="text-sm text-gray-400 mb-6">
          {{ step() === 1 ? 'Ingresa tu correo registrado'
            : step() === 2 ? 'Ingresa el código enviado'
            : 'Ingresa tu nueva contraseña' }}
        </p>

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
              class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none
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

        <a routerLink="/login" class="block text-center mt-4 text-xs text-[#39A900] hover:underline">
          Volver al inicio de sesión
        </a>
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

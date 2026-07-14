import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../core/admin-auth/admin-auth.service';
import { AdminToastService } from '../../../core/admin-auth/admin-toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style="background:#020d05;">
      <div class="w-full max-w-4xl flex rounded-3xl overflow-hidden relative" style="min-height:520px; box-shadow:0 32px 80px rgba(0,0,0,.7);">

        <!-- PANEL IZQUIERDO -->
        <div class="relative flex-col hidden md:flex" style="width:52%;background:#041a0c;overflow:hidden;">
          <div class="absolute pointer-events-none"
            style="width:320px;height:320px;border-radius:50%;
                   background:radial-gradient(circle,rgba(57,169,0,.18) 0%,transparent 70%);
                   top:50%;left:50%;transform:translate(-50%,-50%);"></div>

          <svg class="absolute right-0 top-0 h-full pointer-events-none"
            style="width:72px;z-index:3;" viewBox="0 0 72 520"
            preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M72,0 C52,90 14,130 36,210 C58,290 16,340 26,420 C36,470 58,490 72,520 L72,0 Z" fill="white"/>
          </svg>

          <div class="relative flex flex-col h-full p-9" style="z-index:2;">
            <div class="flex items-center gap-3 mb-auto">
              <div class="flex items-center justify-center rounded-xl flex-shrink-0" style="width:36px;height:36px;background:#39A900;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div class="font-bold tracking-widest text-white" style="font-size:16px;">EPSAS</div>
                <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:1px;">Panel Administrativo · SENA</div>
              </div>
            </div>

            <div class="flex items-center justify-center" style="flex:1;padding:12px 0;">
              <svg width="220" height="220" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
                <defs>
                  <radialGradient id="lglow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#39A900" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#39A900" stop-opacity="0"/>
                  </radialGradient>
                </defs>
                <circle cx="130" cy="135" r="95" fill="url(#lglow)"/>
                <polygon points="30,190 80,105 130,150 170,88 220,190" fill="rgba(57,169,0,.18)" stroke="rgba(57,169,0,.45)" stroke-width="1.5" stroke-linejoin="round"/>
                <rect x="107" y="93" width="46" height="58" rx="5" fill="rgba(255,255,255,.06)" stroke="rgba(57,169,0,.65)" stroke-width="1.5"/>
                <rect x="114" y="101" width="13" height="9" rx="2" fill="rgba(57,169,0,.45)"/>
                <rect x="133" y="101" width="13" height="9" rx="2" fill="rgba(57,169,0,.45)"/>
                <rect x="121" y="138" width="18" height="13" rx="2" fill="rgba(57,169,0,.55)"/>
                <circle cx="195" cy="78" r="15" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
                <text x="195" y="83" text-anchor="middle" fill="rgba(57,169,0,.85)" font-size="13" font-weight="bold" font-family="sans-serif">S</text>
              </svg>
            </div>

            <div class="text-center mt-auto">
              <p style="color:rgba(255,255,255,.7);font-size:14px;font-weight:600;letter-spacing:.3px;margin-bottom:4px;">
                Bienvenido de nuevo
              </p>
              <p style="color:rgba(255,255,255,.3);font-size:11px;">
                Gestiona los Centros de Formación desde un solo lugar
              </p>
            </div>
            <div class="mt-6" style="color:rgba(255,255,255,.2);font-size:10px;">
              © {{ year }} SENA · Panel de Tenants · Todos los derechos reservados
            </div>
          </div>
        </div>

        <!-- PANEL DERECHO -->
        <div class="flex flex-col justify-center bg-white px-8 sm:px-10 py-10" style="flex:1;">
          <h2 style="font-size:24px;font-weight:700;color:#071a0a;margin-bottom:6px;">Iniciar sesión</h2>
          <p style="font-size:13px;color:#8fa896;margin-bottom:28px;">Ingresa tus credenciales de administrador para continuar</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
            <!-- Usuario -->
            <div>
              <label style="display:block;font-size:11px;font-weight:700;color:#2d4a33;margin-bottom:6px;letter-spacing:.5px;text-transform:uppercase;">
                Usuario
              </label>
              <div class="relative">
                <span class="absolute" style="left:13px;top:50%;transform:translateY(-50%);color:#8fa896;pointer-events:none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                <input type="text" formControlName="correo" placeholder="usuario o correo" autocomplete="username"
                  class="w-full transition-colors outline-none"
                  style="padding:11px 12px 11px 38px;border:1.5px solid #e2ece5;border-radius:12px;font-size:13px;color:#071a0a;background:#f5faf6;"
                  [class.border-red-400]="form.controls.correo.invalid && form.controls.correo.touched"
                  (focus)="onFocus($event)" (blur)="onBlur($event)" />
              </div>
              @if (form.controls.correo.invalid && form.controls.correo.touched) {
                <p class="mt-1.5 text-xs" style="color:#dc2626;">El usuario es obligatorio.</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label style="display:block;font-size:11px;font-weight:700;color:#2d4a33;margin-bottom:6px;letter-spacing:.5px;text-transform:uppercase;">
                Contraseña
              </label>
              <div class="relative">
                <span class="absolute" style="left:13px;top:50%;transform:translateY(-50%);color:#8fa896;pointer-events:none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input [type]="mostrarPassword() ? 'text' : 'password'" formControlName="password"
                  placeholder="••••••••" autocomplete="current-password"
                  class="w-full transition-colors outline-none"
                  style="padding:11px 40px 11px 38px;border:1.5px solid #e2ece5;border-radius:12px;font-size:13px;color:#071a0a;background:#f5faf6;"
                  [class.border-red-400]="form.controls.password.invalid && form.controls.password.touched"
                  (focus)="onFocus($event)" (blur)="onBlur($event)" />
                <button type="button" (click)="toggleMostrarPassword()" class="absolute"
                  style="right:12px;top:50%;transform:translateY(-50%);color:#8fa896;background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;">
                  @if (mostrarPassword()) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                </button>
              </div>
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <p class="mt-1.5 text-xs" style="color:#dc2626;">La contraseña es obligatoria.</p>
              }
            </div>

            <button type="submit" [disabled]="cargando()"
              class="w-full flex items-center justify-center gap-2 font-semibold transition-opacity disabled:opacity-60"
              style="background:#39A900;color:white;padding:12px;border-radius:12px;font-size:13.5px;border:none;cursor:pointer;margin-top:8px;">
              @if (cargando()) {
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              }
              {{ cargando() ? 'Ingresando...' : 'Iniciar sesión' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private readonly fb           = inject(FormBuilder);
  private readonly authService  = inject(AdminAuthService);
  private readonly toast        = inject(AdminToastService);
  private readonly router       = inject(Router);

  readonly cargando        = signal(false);
  readonly mostrarPassword = signal(false);
  readonly year            = new Date().getFullYear();

  readonly form = this.fb.nonNullable.group({
    correo:   ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  onFocus(event: Event): void {
    const el = event.target as HTMLInputElement;
    el.style.borderColor = '#39A900';
    el.style.background  = '#fff';
  }

  onBlur(event: Event): void {
    const el = event.target as HTMLInputElement;
    el.style.borderColor = '#e2ece5';
    el.style.background  = '#f5faf6';
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.toast.success('Bienvenido al panel administrativo');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err?.error?.message ?? 'Credenciales inválidas. Inténtalo de nuevo.');
      },
    });
  }
}

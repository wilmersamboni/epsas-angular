import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const BASE2 = '/api2';

@Component({
  selector: 'app-configuracion-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-gray-900">Configuración del Sistema</h3>
          <p class="text-xs text-gray-400">Parámetros globales de las etapas prácticas</p>
        </div>
      </div>

      @if (cargando()) {
        <div class="flex items-center gap-2 py-4 text-gray-400 text-sm">
          <div class="w-5 h-5 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
          Cargando configuración…
        </div>
      } @else {
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">

          <!-- Campo minAvance -->
          <div class="flex-1 max-w-xs">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">
              Avance mínimo para etapa práctica
            </label>
            <p class="text-xs text-gray-400 mb-2">
              Porcentaje de avance académico que debe tener un aprendiz para poder crear su etapa práctica.
            </p>
            <div class="relative flex items-center gap-2">
              <input
                type="number"
                [(ngModel)]="minAvance"
                name="minAvance"
                min="0" max="100"
                class="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-center
                       focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all" />
              <span class="text-lg font-bold text-gray-500">%</span>
            </div>

            <!-- Barra visual del porcentaje -->
            <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden w-48">
              <div class="h-full rounded-full transition-all duration-300"
                [style.width.%]="clampPct()"
                [class]="clampPct() < 40 ? 'bg-red-400' : clampPct() < 70 ? 'bg-amber-400' : 'bg-emerald-500'">
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-1">Valor actual: <strong>{{ clampPct() }}%</strong></p>
          </div>

          <!-- Botón guardar -->
          <div class="flex flex-col items-start gap-2">
            <button (click)="guardar()" [disabled]="guardando()"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold
                     bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-all shadow-sm hover:shadow-md">
              @if (guardando()) {
                <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Guardando…
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                Guardar configuración
              }
            </button>

            <!-- Feedback -->
            @if (mensaje()) {
              <div class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                [class]="mensajeOk() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'">
                @if (mensajeOk()) {
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
                {{ mensaje() }}
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ConfiguracionAdminComponent implements OnInit {
  private http = inject(HttpClient);

  minAvance = 70;
  cargando  = signal(false);
  guardando = signal(false);
  mensaje   = signal('');
  mensajeOk = signal(true);

  get clampPct(): () => number {
    return () => Math.min(100, Math.max(0, Number(this.minAvance) || 0));
  }

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const resp: any = await firstValueFrom(this.http.get(`${BASE2}/configuracion`));
      this.minAvance = resp?.minAvance ?? resp?.min_avance ?? 70;
    } catch {
      this.mostrarMensaje('No se pudo cargar la configuración.', false);
    } finally {
      this.cargando.set(false);
    }
  }

  async guardar(): Promise<void> {
    const valor = Number(this.minAvance);
    if (isNaN(valor) || valor < 0 || valor > 100) {
      this.mostrarMensaje('El valor debe estar entre 0 y 100.', false);
      return;
    }

    this.guardando.set(true);
    this.mensaje.set('');
    try {
      await firstValueFrom(this.http.patch(`${BASE2}/configuracion`, { minAvance: valor }));
      this.mostrarMensaje('Configuración guardada correctamente.', true);
    } catch (e: any) {
      const msg = e?.error?.message ?? e?.error?.mensaje ?? 'Error al guardar.';
      this.mostrarMensaje(typeof msg === 'string' ? msg : 'Error al guardar.', false);
    } finally {
      this.guardando.set(false);
    }
  }

  private mostrarMensaje(texto: string, ok: boolean): void {
    this.mensajeOk.set(ok);
    this.mensaje.set(texto);
    setTimeout(() => this.mensaje.set(''), 4000);
  }
}

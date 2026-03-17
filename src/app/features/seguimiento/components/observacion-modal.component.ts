import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

/**
 * Equivalente a Textarea.tsx (ObservacionModal) de React.
 */
@Component({
  selector: 'app-observacion-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen && alumno) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        (click)="$event.target === $event.currentTarget && closed.emit()">

        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

          <!-- Header -->
          <div class="mb-4">
            <h2 class="text-lg font-bold text-gray-800">Registrar observación</h2>
            @if (alumno) {
              <div class="flex items-center gap-2 mt-1">
                <span class="text-sm text-gray-500">{{ alumno.name }}</span>
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {{ alumno.programa }}
                </span>
              </div>
            }
          </div>

          <!-- Textarea -->
          <textarea
            [(ngModel)]="texto"
            (ngModelChange)="error.set('')"
            rows="4"
            placeholder="Escribe aquí la observación sobre la etapa práctica..."
            class="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none resize-y transition-colors"
            [class.border-red-300]="error()"
            [class.border-gray-200]="!error()"
            [class.focus:border-red-400]="error()"
            [class.focus:border-[#39A900]]="!error()"
          ></textarea>

          @if (error()) {
            <p class="text-red-500 text-xs mt-1">{{ error() }}</p>
          }

          <!-- Footer -->
          <div class="flex justify-end gap-2 mt-4">
            <button (click)="closed.emit()" [disabled]="loading()"
              class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg
                     transition-colors font-medium disabled:opacity-60">
              Cancelar
            </button>
           <button (click)="guardar()" [disabled]="loading()"
            class="px-5 py-2 text-sm text-white font-medium rounded-lg transition-all
                   disabled:opacity-60 shadow-md hover:shadow-lg"
            style="background: linear-gradient(to right, #39A900, #007832)">
            {{ loading() ? 'Guardando...' : 'Guardar' }}
          </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ObservacionModalComponent implements OnChanges {
  @Input() isOpen  = false;
  @Input() alumno: any = null;
  @Output() closed  = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  texto   = '';
  loading = signal(false);
  error   = signal('');

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      this.texto = '';
      this.error.set('');
    }
  }

  async guardar(): Promise<void> {
    if (!this.texto.trim()) { this.error.set('La observación no puede estar vacía.'); return; }
    this.loading.set(true);
    try {
      await this.api.actualizarObservacion(this.alumno.id_practica, this.texto.trim());
      this.success.emit();
      this.closed.emit();
    } catch {
      this.error.set('Error al guardar la observación. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Modal genérico reutilizable para crear/editar registros.
 * Recibe columnas editables y el formulario como objeto.
 */
@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

          <!-- Header -->
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-gray-800">
              {{ editando ? 'Editar ' + labelSingular : 'Nuevo ' + labelSingular }}
            </h2>
            <button (click)="closed.emit()"
              class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 text-xl leading-none">×</button>
          </div>

          <!-- Campos -->
          <div class="space-y-3">
            @for (col of columns; track col) {
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1 capitalize">
                  {{ col.replace(/_/g, ' ') }}
                </label>
                <input type="text" [(ngModel)]="form[col]" [name]="col"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
              </div>
            }
          </div>

          <!-- Error -->
          @if (error) {
            <p class="text-red-500 text-xs mt-3 p-2 bg-red-50 rounded-lg">{{ error }}</p>
          }

          <!-- Footer -->
          <div class="flex justify-end gap-2 mt-6">
            <button (click)="closed.emit()"
              class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Cancelar
            </button>
            <button (click)="saved.emit(form)" [disabled]="saving"
              class="px-5 py-2 text-white text-sm font-medium rounded-lg
                     disabled:opacity-60 transition-colors"
              style="background-color: #39A900">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminModalComponent {
  @Input() open          = false;
  @Input() editando:     any    = null;
  @Input() labelSingular = 'registro';
  @Input() columns:      string[] = [];
  @Input() form:         Record<string, any> = {};
  @Input() saving        = false;
  @Input() error:        string | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<Record<string, any>>();
}

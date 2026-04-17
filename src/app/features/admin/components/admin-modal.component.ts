import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpcionSelect } from '../services/admin.service';

const AUTOCOMPLETE_THRESHOLD = 10; // más de este número → búsqueda en lugar de select

/**
 * Modal genérico para crear/editar registros.
 * - Campos FK con ≤10 opciones  → <select>
 * - Campos FK con >10 opciones  → autocomplete con búsqueda por texto
 * - Resto                       → <input> con el tipo correcto (date, number, email, text)
 */
@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
           (click)="onBackdropClick($event)">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
             (click)="$event.stopPropagation()">

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
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  {{ formatLabel(col) }}
                </label>

                @if (esAutocomplete(col)) {
                  <!-- AUTOCOMPLETE: lista grande → búsqueda por texto -->
                  <div class="relative">
                    <input
                      type="text"
                      [value]="getLabelSeleccionado(col)"
                      (input)="onBusqueda(col, $any($event.target).value)"
                      (focus)="abrirLista(col)"
                      [placeholder]="'Buscar ' + formatLabel(col) + '...'"
                      autocomplete="off"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />

                    @if (listasAbiertas[col]) {
                      <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200
                                  rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        @if (filtradas(col).length === 0) {
                          <p class="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                        }
                        @for (opt of filtradas(col); track opt.value) {
                          <button type="button"
                            (click)="seleccionar(col, opt)"
                            class="w-full text-left px-3 py-2 text-sm hover:bg-[#39A900]/10
                                   hover:text-[#39A900] transition-colors"
                            [class.bg-green-50]="form[col] === opt.value"
                            [class.text-green-700]="form[col] === opt.value">
                            {{ opt.label }}
                          </button>
                        }
                      </div>
                    }
                  </div>

                } @else if (opciones[col]?.length) {
                  <!-- SELECT: lista pequeña -->
                  <select
                    [(ngModel)]="form[col]"
                    [name]="col"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
                           text-gray-900 cursor-pointer">
                    <option value="">— Selecciona —</option>
                    @for (opt of opciones[col]; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>

                } @else {
                  <!-- INPUT normal -->
                  <input
                    [type]="tiposCampo[col] ?? 'text'"
                    [(ngModel)]="form[col]"
                    [name]="col"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                }
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
export class AdminModalComponent implements OnChanges {
  @Input() open          = false;
  @Input() editando:     any    = null;
  @Input() labelSingular = 'registro';
  @Input() columns:      string[] = [];
  @Input() form:         Record<string, any> = {};
  @Input() opciones:     Record<string, OpcionSelect[]> = {};
  @Input() tiposCampo:   Record<string, string> = {};
  @Input() saving        = false;
  @Input() error:        string | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<Record<string, any>>();

  // ── Estado interno del autocomplete ──────────────────────────
  busquedas:     Record<string, string>  = {};  // texto escrito por campo
  listasAbiertas: Record<string, boolean> = {}; // si el dropdown está visible

  ngOnChanges(): void {
    // Al abrir el modal, inicializar el texto del autocomplete con el label ya seleccionado
    if (this.open) {
      this.busquedas     = {};
      this.listasAbiertas = {};
    }
  }

  // ── Helpers autocomplete ──────────────────────────────────────

  esAutocomplete(col: string): boolean {
    return (this.opciones[col]?.length ?? 0) > AUTOCOMPLETE_THRESHOLD;
  }

  getLabelSeleccionado(col: string): string {
    // Si el usuario está escribiendo, mostrar lo que escribe
    if (this.busquedas[col] !== undefined) return this.busquedas[col];
    // Si hay un valor seleccionado, mostrar su label
    const valor = this.form[col];
    if (!valor) return '';
    const opt = this.opciones[col]?.find(o => o.value === valor);
    return opt?.label ?? '';
  }

  onBusqueda(col: string, texto: string): void {
    this.busquedas[col]      = texto;
    this.listasAbiertas[col] = true;
    // Si borra el texto, limpiar el valor del form
    if (!texto.trim()) this.form[col] = '';
  }

  abrirLista(col: string): void {
    this.listasAbiertas[col] = true;
    // Mostrar el texto actual del label si hay valor
    if (this.form[col] && this.busquedas[col] === undefined) {
      const opt = this.opciones[col]?.find(o => o.value === this.form[col]);
      this.busquedas[col] = opt?.label ?? '';
    }
  }

  seleccionar(col: string, opt: OpcionSelect): void {
    this.form[col]           = opt.value;
    this.busquedas[col]      = opt.label;   // mostrar el nombre elegido
    this.listasAbiertas[col] = false;
  }

  filtradas(col: string): OpcionSelect[] {
    const texto = (this.busquedas[col] ?? '').toLowerCase().trim();
    const lista = this.opciones[col] ?? [];
    if (!texto) return lista;
    return lista.filter(o => o.label.toLowerCase().includes(texto));
  }

  onBackdropClick(e: MouseEvent): void {
    // Cerrar listas abiertas al hacer clic en el fondo
    this.listasAbiertas = {};
  }

  // ── Formato de etiquetas ──────────────────────────────────────
  formatLabel(col: string): string {
    return col
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\s*Id\s*$/i, '')
      .trim()
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }
}

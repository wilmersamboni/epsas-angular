import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { BitacorasModalComponent } from './bitacoras-modal.component';

@Component({
  selector: 'app-seguimientos-modal',
  standalone: true,
  imports: [FormsModule, BitacorasModalComponent],
  template: `
    @if (isOpen && alumno) {
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        (click)="$event.target === $event.currentTarget && closed.emit()">

        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-800">Seguimientos de {{ alumno?.name }}</h2>
            <button (click)="closed.emit()"
              class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors text-lg leading-none">×</button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="w-8 h-8 border-4 border-[#39A900]/30 border-t-[#39A900] rounded-full animate-spin"></div>
              </div>
            } @else if (seguimientos().length === 0) {
              <p class="text-center text-gray-400 text-sm py-8">No hay seguimientos registrados</p>
            } @else {
              @for (item of seguimientos(); track item.id_seguimiento) {

                <!-- Card de seguimiento -->
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible"
                  (click)="abrirDetalle(item)">

                  <!-- Card header -->
                  <div class="flex items-center justify-between px-4 pt-4 pb-2">
                    <span class="font-semibold text-gray-800">Seguimiento</span>

                    <div class="flex items-center gap-2" (click)="$event.stopPropagation()">
                      <!-- Estado chip -->
                      <span class="text-xs font-medium px-2.5 py-1 rounded-full"
                        [class.bg-green-100]="item.estado === 'activo'"
                        [class.text-green-700]="item.estado === 'activo'"
                        [class.bg-yellow-100]="item.estado === 'pendiente'"
                        [class.text-yellow-700]="item.estado === 'pendiente'"
                        [class.bg-red-100]="item.estado !== 'activo' && item.estado !== 'pendiente'"
                        [class.text-red-600]="item.estado !== 'activo' && item.estado !== 'pendiente'">
                        {{ item.estado }}
                      </span>

                      <!-- Botón ⋮ con menú desplegable -->
                      <div class="relative">
                        <button
                          (click)="toggleMenu(item.id_seguimiento ?? item.id)"
                          class="w-7 h-7 flex items-center justify-center rounded-full
                                 hover:bg-gray-100 text-gray-500 transition-colors text-lg font-bold">
                          ⋮
                        </button>

                        @if (openMenu() === (item.id_seguimiento ?? item.id)) {
                          <!-- Dropdown menu -->
                          <div class="absolute right-0 top-8 z-[100] bg-white rounded-xl shadow-lg
                                       border border-gray-100 py-1 min-w-[160px]">

                            <!-- Observación -->
                            <button (click)="abrirEditar(item)"
                              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700
                                     hover:bg-gray-50 transition-colors text-left">
                              ✏️ Observación
                            </button>

                            <!-- Subir Acta -->
                            <button (click)="subirActa(item)"
                              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700
                                     hover:bg-gray-50 transition-colors text-left">
                              📤 Subir Acta
                            </button>

                            <!-- Descargar Acta -->
                            <button (click)="descargarActa(item)"
                              [disabled]="!item.actas_pdf"
                              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-left"
                              [class.text-gray-700]="item.actas_pdf"
                              [class.hover:bg-gray-50]="item.actas_pdf"
                              [class.text-gray-300]="!item.actas_pdf"
                              [class.cursor-not-allowed]="!item.actas_pdf">
                              📥 Descargar Acta
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Observación -->
                  <div class="px-4 pb-3">
                    <p class="text-sm text-gray-600 leading-relaxed">
                      {{ item.observacion ?? '—' }}
                    </p>
                  </div>

                  <!-- Acta badge -->
                  <div class="px-4 pb-4">
                    @if (item.actas_pdf) {
                      <span class="inline-flex items-center gap-1 text-xs font-medium
                                   bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-200">
                        📎 Acta cargada
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-xs font-medium
                                   bg-gray-50 text-gray-400 px-2.5 py-1 rounded-full border border-gray-100">
                        Sin acta
                      </span>
                    }
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button (click)="closed.emit()"
              class="text-sm text-red-500 hover:text-red-600 font-medium transition-colors px-3 py-1.5">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Input oculto para subir acta -->
      <input #actaInput type="file" accept="application/pdf" class="hidden"
        (change)="onActaFileChange($event)" />

      <!-- Modal editar observación -->
      @if (editOpen()) {
        <div class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Editar Seguimiento</h3>
            <textarea [(ngModel)]="editObservacion" rows="4"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none
                     focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900] resize-y"
              placeholder="Observación..."></textarea>
            <div class="flex justify-end gap-2 mt-4">
              <button (click)="editOpen.set(false)"
                class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
              <button (click)="guardarEdicion()"
                class="px-5 py-2 bg-[#39A900] text-white text-sm font-medium rounded-lg
                       hover:bg-[#2d8400] transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      }
    }

    <!-- Modal Bitácoras -->
    <app-bitacoras-modal
      [isOpen]="bitacorasOpen()"
      [alumno]="alumno"
      [seguimiento]="seguimientoSeleccionado()"
      (closed)="bitacorasOpen.set(false); reopened.emit()"
    />
  `,
})
export class SeguimientosModalComponent implements OnChanges {
  @Input() isOpen  = false;
  @Input() alumno: any = null;
  @Output() closed   = new EventEmitter<void>();
  @Output() reopened = new EventEmitter<void>();

  seguimientos = signal<any[]>([]);
  loading      = signal(false);
  openMenu     = signal<number | null>(null);

  editOpen     = signal(false);
  bitacorasOpen = signal(false);
  seguimientoEditando     = signal<any>(null);
  seguimientoSeleccionado = signal<any>(null);
  editObservacion = '';

  // Para subir acta
  private pendingActaItem: any = null;

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && this.alumno) {
      this.cargarSeguimientos();
      this.openMenu.set(null);
    }
  }

  async cargarSeguimientos(): Promise<void> {
    if (!this.alumno) return;
    this.loading.set(true);
    try {
      const data = await this.api.obtenerSeguimientos(this.alumno.id);
      this.seguimientos.set(data);
    } catch (e) { console.error(e); }
    finally { this.loading.set(false); }
  }

  toggleMenu(id: number): void {
    this.openMenu.update(v => v === id ? null : id);
  }

  abrirDetalle(item: any): void {
    this.openMenu.set(null);
    this.seguimientoSeleccionado.set(item);
    this.bitacorasOpen.set(true);
    this.closed.emit();
  }

  abrirEditar(item: any): void {
    this.openMenu.set(null);
    this.seguimientoEditando.set(item);
    this.editObservacion = item.observacion ?? '';
    this.editOpen.set(true);
  }

  async guardarEdicion(): Promise<void> {
    const seg = this.seguimientoEditando();
    if (!seg) return;
    try {
      const id = seg.id_seguimiento ?? seg.id;
      await this.api.actualizarSeguimiento(id, { observacion: this.editObservacion });
      await this.cargarSeguimientos();
      this.editOpen.set(false);
    } catch (e) { console.error(e); }
  }

  subirActa(item: any): void {
    this.openMenu.set(null);
    this.pendingActaItem = item;
    // Disparar input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: any) => this.onActaFileChange(e);
    input.click();
  }

  async onActaFileChange(event: any): Promise<void> {
    const file = event.target?.files?.[0];
    if (!file || !this.pendingActaItem) return;
    try {
      const id = this.pendingActaItem.id_seguimiento ?? this.pendingActaItem.id;
      await this.api.subirActa(id, file);
      await this.cargarSeguimientos();
    } catch (e) { console.error(e); }
    this.pendingActaItem = null;
  }

  descargarActa(item: any): void {
    this.openMenu.set(null);
    if (!item.actas_pdf) return;
    window.open(`http://localhost:3001/uploads/actas/${item.actas_pdf}`, '_blank');
  }
}

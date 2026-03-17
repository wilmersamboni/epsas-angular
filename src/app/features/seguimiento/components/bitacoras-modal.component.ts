import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ApiService } from '../../../core/services/api.service';
import { PdfViewerComponent } from 'ng2-pdf-viewer';

/**
 * Equivalente a ModalBitacoras.tsx + BitacorasCard.tsx de React.
 * Incluye el modal de detalle y el modal de subir bitácora inline.
 */
@Component({
  selector: 'app-bitacoras-modal',
  standalone: true,
  imports: [FormsModule, PdfViewerModule, DecimalPipe],
  template: `
    @if (isOpen && alumno) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        (click)="$event.target === $event.currentTarget && closed.emit()">

        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-800">Bitácoras de {{ alumno?.name }}</h2>
            <button (click)="closed.emit()"
              class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">✕</button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            @if (loading()) {
              <div class="flex justify-center py-8">
                <div class="w-8 h-8 border-4 border-[#39A900]/30 border-t-[#39A900] rounded-full animate-spin"></div>
              </div>
            } @else if (bitacoras().length === 0) {
              <p class="text-center text-gray-400 text-sm py-8">No hay bitácoras registradas</p>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (item of bitacoras(); track item.id_bitacora) {
                  <!-- BitacorasCard -->
                  <div class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md
                               transition-shadow cursor-pointer"
                    (click)="abrirDetalle(item)">

                    <div class="flex items-center justify-between p-4 border-b border-gray-50">
                      <span class="font-semibold text-sm text-gray-800">{{ formatFecha(item.fecha) }}</span>
                      <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                        [class.bg-green-100]="item.estado === 'aceptada'"
                        [class.text-green-700]="item.estado === 'aceptada'"
                        [class.bg-yellow-100]="item.estado === 'pendiente'"
                        [class.text-yellow-700]="item.estado === 'pendiente'"
                        [class.bg-red-100]="item.estado === 'rechazada'"
                        [class.text-red-600]="item.estado === 'rechazada'">
                        {{ item.estado }}
                      </span>
                    </div>

                    <div class="p-4">
                      <p class="text-sm text-gray-600 mb-3">{{ item.bitacora_pdf }}</p>

                      <!-- Dropdown evaluar (detiene propagación) -->
                      <div class="relative" (click)="$event.stopPropagation()">
                        <button (click)="toggleDropdown(item.id_bitacora)"
        class="text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity"
        style="background: linear-gradient(to right, #39A900, #007832)">
  Evaluar Bitácora
</button>
                        @if (openDropdown() === item.id_bitacora) {
                          <div class="absolute left-0 top-8 z-10 bg-white border border-gray-100
                                       rounded-xl shadow-lg py-1 min-w-[160px]">
                            <button (click)="cambiarEstado(item, 'pendiente')"
                              class="w-full text-left px-4 py-2 text-xs text-yellow-600 hover:bg-yellow-50 transition-colors">
                              🕒 Pendiente
                            </button>
                            <button (click)="cambiarEstado(item, 'aceptada')"
                              class="w-full text-left px-4 py-2 text-xs text-green-600 hover:bg-green-50 transition-colors">
                              ✅ Aceptar
                            </button>
                            <button (click)="cambiarEstado(item, 'rechazada')"
                              class="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                              ❌ Rechazar
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button (click)="closed.emit()"
              class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
              Cerrar
            </button>
            <button (click)="subirOpen.set(true)"
              class="px-4 py-2 text-sm text-white font-medium rounded-lg
                     bg-gradient-to-r from-[#39A900] to-[#5cd600]
                     hover:opacity-90 transition-opacity">
              Subir bitácora
            </button>
          </div>
        </div>
      </div>

      <!-- Modal detalle bitácora con ng2-pdf-viewer -->
      @if (detalleOpen() && bitacoraSeleccionada()) {
        <div class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0"
                 style="background: linear-gradient(135deg, #001f33, #003a5c)">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                     style="background-color: #39A900">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">
                    Bitácora — {{ formatFecha(bitacoraSeleccionada().fecha) }}
                  </h3>
                  <p class="text-[11px] text-white/50">Seguimiento etapa productiva</p>
                </div>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full ml-2"
                  [class.bg-yellow-400]="bitacoraSeleccionada().estado === 'pendiente'"
                  [class.text-yellow-900]="bitacoraSeleccionada().estado === 'pendiente'"
                  [class.bg-green-400]="bitacoraSeleccionada().estado === 'aceptada'"
                  [class.text-green-900]="bitacoraSeleccionada().estado === 'aceptada'"
                  [class.bg-red-400]="bitacoraSeleccionada().estado === 'rechazada'"
                  [class.text-red-900]="bitacoraSeleccionada().estado === 'rechazada'">
                  {{ bitacoraSeleccionada().estado }}
                </span>
              </div>

              <!-- Controles -->
              <div class="flex items-center gap-2">

                <!-- Paginación -->
                <div class="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                  <button (click)="prevPage()"
                    [disabled]="pdfPage <= 1"
                    class="text-white/70 hover:text-white disabled:opacity-30 transition-colors px-1">
                    ‹
                  </button>
                  <span class="text-white text-xs min-w-[60px] text-center">
                    {{ pdfPage }} / {{ pdfTotalPages }}
                  </span>
                  <button (click)="nextPage()"
                    [disabled]="pdfPage >= pdfTotalPages"
                    class="text-white/70 hover:text-white disabled:opacity-30 transition-colors px-1">
                    ›
                  </button>
                </div>

                <!-- Zoom -->
                <div class="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                  <button (click)="zoomOut()"
                    class="text-white/70 hover:text-white transition-colors w-6 h-6 flex items-center justify-center">
                    −
                  </button>
                  <span class="text-white text-xs min-w-[45px] text-center">
                    {{ (pdfZoom * 100) | number:'1.0-0' }}%
                  </span>
                  <button (click)="zoomIn()"
                    class="text-white/70 hover:text-white transition-colors w-6 h-6 flex items-center justify-center">
                    +
                  </button>
                </div>

                <!-- Descargar -->
                <a [href]="'http://localhost:3001/uploads/bitacoras/' + bitacoraSeleccionada().bitacora_pdf"
                  [download]="bitacoraSeleccionada().bitacora_pdf"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         text-white transition-colors"
                  style="background-color: #39A900">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Descargar
                </a>

                <!-- Cerrar -->
                <button (click)="detalleOpen.set(false); resetPdf()"
                  class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white
                         flex items-center justify-center transition-colors text-lg leading-none">
                  ×
                </button>
              </div>
            </div>

            <!-- Visor PDF con ng2-pdf-viewer -->
            <div class="flex-1 overflow-auto flex justify-center bg-gray-100 p-4">
              @if (bitacoraSeleccionada().bitacora_pdf) {
                <pdf-viewer
  [src]="pdfUrl(bitacoraSeleccionada().bitacora_pdf)"
  [page]="pdfPage"
  [zoom]="pdfZoom"
  [zoom-scale]="'page-width'"
  [show-all]="false"
  [render-text]="true"
  [original-size]="false"
  [fit-to-page]="true"
  [c-maps-url]="'assets/'"
  (after-load-complete)="onPdfLoaded($event)"
  style="width:100%; height: calc(92vh - 120px); display:block">
</pdf-viewer>
              } @else {
                <div class="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                  <svg class="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="text-sm">No hay archivo PDF disponible</p>
                </div>
              }
            </div>

          </div>
        </div>
      }

      <!-- Modal subir bitácora -->
      @if (subirOpen()) {
        <div class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">Subir Bitácora</h3>
              <button (click)="subirOpen.set(false)"
                class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha</label>
                <input type="date" [(ngModel)]="subirFecha"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                         focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Archivo PDF</label>
                <input type="file" accept="application/pdf" (change)="onFileChange($event)"
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg
                         file:border-0 file:text-sm file:font-semibold file:bg-[#39A900] file:text-white
                         hover:file:bg-[#2d8400] cursor-pointer" />
              </div>

              @if (subirError()) {
                <p class="text-red-500 text-xs">{{ subirError() }}</p>
              }

              <div class="flex justify-end gap-2 pt-2">
                <button (click)="subirOpen.set(false)"
                  class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                <button (click)="subirBitacora()" [disabled]="subirLoading()"
                  class="px-5 py-2 bg-[#39A900] text-white text-sm font-medium rounded-lg
                         hover:bg-[#2d8400] disabled:opacity-60 transition-colors">
                  {{ subirLoading() ? 'Subiendo...' : 'Subir' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class BitacorasModalComponent implements OnChanges {
  @Input() isOpen      = false;
  @Input() alumno:     any = null;
  @Input() seguimiento: any = null;
  @Output() closed = new EventEmitter<void>();

  bitacoras = signal<any[]>([]);
  loading   = signal(false);

  detalleOpen          = signal(false);
  bitacoraSeleccionada = signal<any>(null);
  openDropdown         = signal<number | null>(null);

  subirOpen    = signal(false);
  subirLoading = signal(false);
  subirError   = signal('');
  subirFecha   = '';
  subirFile:   File | null = null;

  constructor(private api: ApiService, private sanitizer: DomSanitizer) {}

  // ── PDF Viewer ────────────────────────────────────────────────────────────
  pdfPage       = 1;
  pdfTotalPages = 1;
  pdfZoom       = 1.0;

  pdfUrl(archivo: string): string {
    return `http://localhost:3001/uploads/bitacoras/${archivo}`;
  }

  pdfSafeUrl(archivo: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `http://localhost:3001/uploads/bitacoras/${archivo}`
    );
  }

  onPdfLoaded(pdf: any): void {
    this.pdfTotalPages = pdf.numPages;
    this.pdfPage = 1;
  }

  prevPage(): void { if (this.pdfPage > 1) this.pdfPage--; }
  nextPage(): void { if (this.pdfPage < this.pdfTotalPages) this.pdfPage++; }
  zoomIn():   void { this.pdfZoom = Math.min(3, +(this.pdfZoom + 0.25).toFixed(2)); }
  zoomOut():  void { this.pdfZoom = Math.max(0.25, +(this.pdfZoom - 0.25).toFixed(2)); }
  resetPdf(): void { this.pdfPage = 1; this.pdfZoom = 1.5; this.pdfTotalPages = 1; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && this.seguimiento) {
      this.cargarBitacoras();
    }
  }

  async cargarBitacoras(): Promise<void> {
    const id = this.seguimiento?.id ?? this.seguimiento?.id_seguimiento;
    if (!id) return;
    this.loading.set(true);
    try {
      const data = await this.api.obtenerBitacoras(id);
      this.bitacoras.set(data);
    } catch (e) { console.error(e); }
    finally { this.loading.set(false); }
  }

  abrirDetalle(item: any): void {
    this.bitacoraSeleccionada.set(item);
    this.detalleOpen.set(true);
  }

  toggleDropdown(id: number): void {
    this.openDropdown.update(v => v === id ? null : id);
  }

  async cambiarEstado(item: any, estado: string): Promise<void> {
    try {
      await this.api.actualizarEstadoBitacora(item.id_bitacora, estado);
      await this.cargarBitacoras();
    } catch (e) { console.error(e); }
    finally { this.openDropdown.set(null); }
  }

  formatFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? 'Fecha inválida' : d.toLocaleDateString('es-ES');
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.subirFile = input.files?.[0] ?? null;
  }

  async subirBitacora(): Promise<void> {
    if (!this.subirFecha) { this.subirError.set('Ingresa la fecha.'); return; }
    if (!this.subirFile)  { this.subirError.set('Selecciona un archivo PDF.'); return; }
    const id = this.seguimiento?.id ?? this.seguimiento?.id_seguimiento;
    if (!id) return;

    this.subirLoading.set(true);
    this.subirError.set('');
    try {
      const fd = new FormData();
      fd.append('fecha', this.subirFecha);
      fd.append('archivo', this.subirFile);
      fd.append('fk_seguimiento', String(id));
      fd.append('estado', 'pendiente');
      await this.api.crearBitacoraArchivo(fd);
      this.subirOpen.set(false);
      this.subirFecha = '';
      this.subirFile  = null;
      await this.cargarBitacoras();
    } catch { this.subirError.set('Error al subir. Intenta de nuevo.'); }
    finally { this.subirLoading.set(false); }
  }

  ngOnInit(): void {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
}
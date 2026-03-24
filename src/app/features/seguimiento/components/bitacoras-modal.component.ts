import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ApiService } from '../../../core/services/api.service';

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
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        (click)="$event.target === $event.currentTarget && closed.emit()">

        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39A900] to-[#2d8500] flex items-center justify-center shadow-lg shadow-[#39A900]/20">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-800">Bitácoras de {{ alumno?.name }}</h2>
                <p class="text-xs text-gray-500">{{ bitacoras().length }} registros</p>
              </div>
            </div>
            <button (click)="closed.emit()"
              class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            @if (loading()) {
              <!-- Skeleton loader mejorado -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (i of [1,2,3,4]; track i) {
                  <div class="bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse">
                    <div class="flex items-center justify-between p-4 border-b border-gray-50">
                      <div class="h-4 bg-gray-200 rounded w-24"></div>
                      <div class="h-5 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div class="p-4 space-y-3">
                      <div class="h-3 bg-gray-200 rounded w-full"></div>
                      <div class="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (bitacoras().length === 0) {
              <div class="flex flex-col items-center justify-center py-12">
                <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <p class="text-gray-500 text-sm font-medium">No hay bitácoras registradas</p>
                <p class="text-gray-400 text-xs mt-1">Usa el botón de abajo para subir una</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (item of bitacoras(); track item.id_bitacora) {
                  <!-- BitacorasCard mejorada -->
                  <div class="group bg-white rounded-xl border border-gray-200 hover:border-[#39A900]/30 
                              hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                    (click)="abrirDetalle(item)">

                    <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="font-semibold text-sm text-gray-800">{{ formatFecha(item.fecha) }}</span>
                      </div>
                      <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                        [class.bg-green-100]="item.estado === 'aceptada'"
                        [class.text-green-700]="item.estado === 'aceptada'"
                        [class.bg-yellow-100]="item.estado === 'pendiente'"
                        [class.text-yellow-700]="item.estado === 'pendiente'"
                        [class.bg-red-100]="item.estado === 'rechazada'"
                        [class.text-red-600]="item.estado === 'rechazada'">
                        {{ item.estado }}
                      </span>
                    </div>

                    <div class="p-4 space-y-3">
                      <div class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        <p class="text-sm text-gray-600 line-clamp-2">{{ item.bitacora_pdf }}</p>
                      </div>

                      <!-- Dropdown evaluar (detiene propagación) -->
                      <div class="relative" (click)="$event.stopPropagation()">
                        <button (click)="toggleDropdown(item.id_bitacora)"
                          class="w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg text-white 
                                 transition-all duration-200 group-hover:shadow-md"
                          style="background: linear-gradient(135deg, #39A900 0%, #2d8500 100%)">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                          </svg>
                          Evaluar Bitácora
                        </button>
                        @if (openDropdown() === item.id_bitacora) {
                          <div class="absolute left-0 top-full mt-1 z-10 bg-white border border-gray-200
                                       rounded-xl shadow-xl py-1.5 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
                            <button (click)="cambiarEstado(item, 'pendiente')"
                              class="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 transition-colors">
                              <span class="text-base">🕒</span>
                              <span>Pendiente</span>
                            </button>
                            <div class="h-px bg-gray-100 my-1"></div>
                            <button (click)="cambiarEstado(item, 'aceptada')"
                              class="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors">
                              <span class="text-base">✅</span>
                              <span>Aceptar</span>
                            </button>
                            <div class="h-px bg-gray-100 my-1"></div>
                            <button (click)="cambiarEstado(item, 'rechazada')"
                              class="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                              <span class="text-base">❌</span>
                              <span>Rechazar</span>
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
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button (click)="closed.emit()"
              class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 
                     rounded-lg transition-all duration-200">
              Cerrar
            </button>
            <button (click)="subirOpen.set(true)"
              class="group relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-lg
                     overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#39A900]/30
                     hover:scale-[1.02] active:scale-[0.98]"
              style="background: linear-gradient(135deg, #39A900 0%, #2d8500 100%)">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <span class="relative z-10">Subir bitácora</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal detalle bitácora con ng2-pdf-viewer -->
      @if (detalleOpen() && bitacoraSeleccionada()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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

            <!-- Visor PDF con ng2-pdf-viewer - Solo carga cuando se abre -->
            <div class="flex-1 overflow-auto flex justify-center bg-gray-100 p-4">
              @if (bitacoraSeleccionada().bitacora_pdf) {
                <pdf-viewer
                  [src]="pdfUrl(bitacoraSeleccionada().bitacora_pdf)"
                  [page]="pdfPage"
                  [zoom]="pdfZoom"
                  [show-all]="false"
                  [render-text]="true"
                  [original-size]="false"
                  [fit-to-page]="false"
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
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[#39A900]/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-[#39A900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800">Subir Bitácora</h3>
              </div>
              <button (click)="subirOpen.set(false)"
                class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                <input type="date" [(ngModel)]="subirFecha"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] 
                         transition-all" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Archivo PDF</label>
                <div class="relative">
                  <input type="file" accept="application/pdf" (change)="onFileChange($event)"
                    class="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg
                           file:border-0 file:text-sm file:font-semibold file:bg-[#39A900] file:text-white
                           hover:file:bg-[#2d8400] cursor-pointer transition-all" />
                </div>
              </div>

              @if (subirError()) {
                <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-red-600 text-xs font-medium">{{ subirError() }}</p>
                </div>
              }

              <div class="flex justify-end gap-3 pt-2">
                <button (click)="subirOpen.set(false)"
                  class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 
                         rounded-lg transition-all">
                  Cancelar
                </button>
                <button (click)="subirBitacora()" [disabled]="subirLoading()"
                  class="px-5 py-2.5 text-sm font-bold text-white rounded-lg
                         disabled:opacity-60 transition-all duration-200 shadow-lg hover:shadow-xl"
                  style="background: linear-gradient(135deg, #39A900 0%, #2d8500 100%)">
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
export class BitacorasModalComponent implements OnChanges, OnInit {
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

  onPdfLoaded(pdf: any): void {
    this.pdfTotalPages = pdf.numPages;
    this.pdfPage = 1;
  }

  prevPage(): void { if (this.pdfPage > 1) this.pdfPage--; }
  nextPage(): void { if (this.pdfPage < this.pdfTotalPages) this.pdfPage++; }
  zoomIn():   void { this.pdfZoom = Math.min(3, +(this.pdfZoom + 0.25).toFixed(2)); }
  zoomOut():  void { this.pdfZoom = Math.max(0.25, +(this.pdfZoom - 0.25).toFixed(2)); }
  resetPdf(): void { this.pdfPage = 1; this.pdfZoom = 1.0; this.pdfTotalPages = 1; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && this.seguimiento) {
      this.cargarBitacoras();
    }
  }

  ngOnInit(): void {
    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  async cargarBitacoras(): Promise<void> {
    const id = this.seguimiento?.id ?? this.seguimiento?.id_seguimiento;
    if (!id) return;
    
    this.loading.set(true);
    try {
      const data = await this.api.obtenerBitacoras(id);
      this.bitacoras.set(data || []);
    } catch (e) { 
      console.error('Error cargando bitácoras:', e);
      this.bitacoras.set([]);
    } finally { 
      this.loading.set(false); 
    }
  }

  abrirDetalle(item: any): void {
    this.bitacoraSeleccionada.set(item);
    this.detalleOpen.set(true);
  }

  toggleDropdown(id: number): void {
    this.openDropdown.update(v => v === id ? null : id);
  }

  async cambiarEstado(item: any, estado: string): Promise<void> {
    this.openDropdown.set(null);
    try {
      await this.api.actualizarEstadoBitacora(item.id_bitacora, estado);
      // Optimización: actualiza solo el elemento cambiado sin recargar todo
      this.bitacoras.update(lista => 
        lista.map(b => b.id_bitacora === item.id_bitacora ? {...b, estado} : b)
      );
    } catch (e) { 
      console.error('Error actualizando estado:', e);
      // Si falla, recarga todo
      await this.cargarBitacoras();
    }
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
    } catch { 
      this.subirError.set('Error al subir. Intenta de nuevo.'); 
    } finally { 
      this.subirLoading.set(false); 
    }
  }
}
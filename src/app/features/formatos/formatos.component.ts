import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Formato } from '../../shared/models';

const TIPOS: { value: string; label: string; icon: string }[] = [
  { value: 'bitacora',         label: 'Bitácora',        icon: '📋' },
  { value: 'acta_seguimiento', label: 'Acta seguimiento', icon: '📝' },
  { value: 'otro',             label: 'Otro',             icon: '📁' },
];

const FILE_BASE = 'http://localhost:3001/uploads/formatos/';

@Component({
  selector: 'app-formatos',
  standalone: true,
  imports: [FormsModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .card-enter {
      animation: fadeInUp 0.3s ease both;
    }
    .card-enter:nth-child(1)  { animation-delay: 0.05s; }
    .card-enter:nth-child(2)  { animation-delay: 0.10s; }
    .card-enter:nth-child(3)  { animation-delay: 0.15s; }
    .card-enter:nth-child(4)  { animation-delay: 0.20s; }
    .card-enter:nth-child(5)  { animation-delay: 0.25s; }
    .card-enter:nth-child(6)  { animation-delay: 0.30s; }
    .card-enter:nth-child(7)  { animation-delay: 0.35s; }
    .card-enter:nth-child(8)  { animation-delay: 0.40s; }
    .spinner {
      animation: spin 0.8s linear infinite;
    }
    .file-row:hover .file-icon-bg { background: #dcfce7; }
  `],
  template: `
    <p-toast position="top-right" [baseZIndex]="9999" />
    <p-confirmdialog />

    <section class="min-h-screen bg-gray-50 px-4 py-10">
      <div class="max-w-6xl mx-auto space-y-8">

        <!-- ── Header ──────────────────────────────────────────────── -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Formatos</h1>
            <p class="text-sm text-gray-500 mt-0.5">
              {{ formatos().length }} archivo{{ formatos().length !== 1 ? 's' : '' }} disponible{{ formatos().length !== 1 ? 's' : '' }}
            </p>
          </div>

          @if (esAdmin()) {
            <button
              (click)="mostrarForm.set(!mostrarForm())"
              class="inline-flex items-center gap-2 px-4 py-2 bg-[#39A900] hover:bg-[#2d8400]
                     text-white text-sm font-semibold rounded-xl transition-all duration-200
                     shadow-sm hover:shadow-md active:scale-95">
              <span class="text-base leading-none">{{ mostrarForm() ? '✕' : '+' }}</span>
              {{ mostrarForm() ? 'Cancelar' : 'Subir formato' }}
            </button>
          }
        </div>

        <!-- ── Formulario de subida ─────────────────────────────────── -->
        @if (esAdmin() && mostrarForm()) {
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                      animate-[fadeInUp_0.25s_ease_both]">
            <div class="bg-gradient-to-r from-[#39A900]/8 to-transparent px-6 py-4 border-b border-gray-100">
              <h2 class="text-sm font-semibold text-gray-800">Nuevo formato</h2>
            </div>

            <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</label>
                <input
                  type="text"
                  [(ngModel)]="nombreFormato"
                  placeholder="Ej: Contrato empresa XYZ"
                  class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                         bg-gray-50 hover:bg-white focus:bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#39A900]/25 focus:border-[#39A900]
                         transition-all placeholder:text-gray-400"
                />
              </div>

              <!-- Tipo -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
                <select
                  [(ngModel)]="tipoSeleccionado"
                  class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                         bg-gray-50 hover:bg-white focus:bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#39A900]/25 focus:border-[#39A900]
                         transition-all text-gray-700">
                  <option value="">Selecciona un tipo</option>
                  @for (t of tipos; track t.value) {
                    <option [value]="t.value">{{ t.icon }} {{ t.label }}</option>
                  }
                </select>
              </div>

              <!-- Drop zone / Archivo -->
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Archivo</label>
                <label
                  class="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed
                         rounded-xl cursor-pointer transition-all
                         {{ archivo ? 'border-[#39A900] bg-[#39A900]/5' : 'border-gray-200 bg-gray-50 hover:border-[#39A900]/50 hover:bg-[#39A900]/3' }}">
                  <input
                    type="file"
                    accept="application/pdf,.doc,.docx,image/*"
                    (change)="onFileChange($event)"
                    class="hidden"
                  />
                  @if (archivo) {
                    <div class="flex items-center gap-2 text-[#39A900]">
                      <span class="text-xl">✅</span>
                      <span class="text-sm font-medium max-w-xs truncate">{{ archivo.name }}</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ formatBytes(archivo.size) }}</span>
                  } @else {
                    <span class="text-2xl text-gray-300">📎</span>
                    <span class="text-sm text-gray-400">Haz clic o arrastra un archivo aquí</span>
                    <span class="text-xs text-gray-300">PDF, DOC, DOCX, Imagen</span>
                  }
                </label>
              </div>

              <!-- Botón subir -->
              <div class="sm:col-span-2 flex justify-end">
                <button
                  (click)="handleUpload()"
                  [disabled]="!archivo || uploading()"
                  class="inline-flex items-center gap-2 px-6 py-2.5 bg-[#39A900] hover:bg-[#2d8400]
                         text-white text-sm font-semibold rounded-xl transition-all duration-200
                         shadow-sm hover:shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                         disabled:hover:bg-[#39A900] disabled:active:scale-100">
                  @if (uploading()) {
                    <svg class="w-4 h-4 spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Subiendo...
                  } @else {
                    <span>↑</span>
                    Subir archivo
                  }
                </button>
              </div>
            </div>
          </div>
        }

        <!-- ── Filtros ───────────────────────────────────────────────── -->
        @if (formatos().length > 0 || filtroTipo()) {
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Filtrar:</span>

            <button
              (click)="filtroTipo.set('')"
              [class]="'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' +
                (filtroTipo() === '' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300')">
              Todos
            </button>

            @for (t of tipos; track t.value) {
              <button
                (click)="filtroTipo.set(filtroTipo() === t.value ? '' : t.value)"
                [class]="'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' +
                  (filtroTipo() === t.value
                    ? 'bg-[#39A900] text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#39A900]/40')">
                {{ t.icon }} {{ t.label }}
              </button>
            }
          </div>
        }

        <!-- ── Listado ───────────────────────────────────────────────── -->
        @if (loading()) {
          <div class="flex justify-center items-center py-20">
            <div class="flex flex-col items-center gap-3">
              <svg class="w-8 h-8 text-[#39A900] spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span class="text-sm text-gray-400">Cargando formatos...</span>
            </div>
          </div>
        }

        @if (!loading() && formatosFiltrados().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4">📂</div>
            <p class="text-gray-500 font-medium">
              {{ filtroTipo() ? 'No hay formatos de este tipo' : 'No hay formatos registrados' }}
            </p>
            <p class="text-sm text-gray-400 mt-1">
              {{ esAdmin() ? 'Sube el primer formato con el botón de arriba.' : 'Consulta con el administrador.' }}
            </p>
          </div>
        }

        @if (!loading() && formatosFiltrados().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (f of formatosFiltrados(); track f.id; let i = $index) {
              <div class="card-enter group bg-white rounded-2xl border border-gray-100
                          hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5
                          transition-all duration-200 overflow-hidden">

                <!-- Cabecera de la card -->
                <div class="p-4 pb-3">
                  <div class="flex items-start gap-3">
                    <div class="file-icon-bg w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center
                                transition-colors duration-200 flex-shrink-0">
                      <span class="text-base">{{ iconoArchivo(f.ruta_archivo) }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm text-gray-800 leading-snug line-clamp-2 group-hover:text-[#39A900] transition-colors">
                        {{ f.nombre }}
                      </p>
                      <div class="flex items-center gap-1.5 mt-1.5">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full
                                     bg-[#39A900]/10 text-[#2d8400] uppercase tracking-wide">
                          {{ tipoLabel(f.tipo) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Divisor -->
                <div class="mx-4 border-t border-gray-50"></div>

                <!-- Acciones -->
                <div class="p-3 flex gap-1.5">
                  <a [href]="fileUrl(f.ruta_archivo)"
                     target="_blank"
                     class="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold
                            rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <span>👁</span> Ver
                  </a>
                  <a [href]="fileUrl(f.ruta_archivo)"
                     [download]="f.nombre_original"
                     class="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold
                            rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                    <span>↓</span> Descargar
                  </a>
                  @if (esAdmin()) {
                    <button
                      (click)="handleEliminar(f.id)"
                      title="Eliminar"
                      class="w-8 flex items-center justify-center py-1.5 text-[11px]
                             rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600
                             transition-colors">
                      🗑
                    </button>
                  }
                </div>

              </div>
            }
          </div>
        }

      </div>
    </section>
  `,
})
export class FormatosComponent implements OnInit {
  private auth = inject(AuthService);

  readonly tipos = TIPOS;

  formatos         = signal<Formato[]>([]);
  loading          = signal(false);
  uploading        = signal(false);
  mostrarForm      = signal(false);
  filtroTipo       = signal('');
  archivo:           File | null = null;
  nombreFormato    = '';
  tipoSeleccionado = '';

  esAdmin() { return this.auth.isAdmin(); }

  formatosFiltrados() {
    const tipo = this.filtroTipo();
    return tipo ? this.formatos().filter(f => f.tipo === tipo) : this.formatos();
  }

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmationService,
  ) {}

  ngOnInit(): void { this.cargarFormatos(); }

  async cargarFormatos(): Promise<void> {
    this.loading.set(true);
    try { this.formatos.set(await this.api.listarFormatos()); }
    catch (e: any) { this.toast.httpError(e, 'No se pudieron cargar los formatos.'); }
    finally { this.loading.set(false); }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
  }

  async handleUpload(): Promise<void> {
    if (!this.archivo) { this.toast.warn('Campo requerido', 'Selecciona un archivo.'); return; }
    if (!this.nombreFormato.trim()) { this.toast.warn('Campo requerido', 'Escribe un nombre descriptivo.'); return; }
    if (!this.tipoSeleccionado) { this.toast.warn('Campo requerido', 'Selecciona el tipo de formato.'); return; }
    if (!this.esAdmin()) return;

    this.uploading.set(true);
    try {
      await this.api.subirFormato(this.nombreFormato.trim(), this.tipoSeleccionado, this.archivo);
      this.archivo          = null;
      this.nombreFormato    = '';
      this.tipoSeleccionado = '';
      this.mostrarForm.set(false);
      this.toast.ok('Archivo subido', 'El formato fue registrado correctamente.');
      await this.cargarFormatos();
    } catch (e: any) {
      this.toast.httpError(e, 'Error al subir el archivo.');
    } finally { this.uploading.set(false); }
  }

  handleEliminar(id: string): void {
    if (!this.esAdmin()) return;
    this.confirm.confirm({
      message: '¿Estás seguro de que deseas eliminar este formato? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.api.eliminarFormato(id);
          this.toast.ok('Eliminado', 'Formato eliminado correctamente.');
          await this.cargarFormatos();
        } catch (e: any) {
          this.toast.httpError(e, 'Error al eliminar el formato.');
        }
      },
    });
  }

  fileUrl(rutaArchivo: string): string {
    return FILE_BASE + rutaArchivo;
  }

  tipoLabel(tipo: string): string {
    return TIPOS.find(t => t.value === tipo)?.label ?? tipo;
  }

  iconoArchivo(ruta: string): string {
    const ext = ruta?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext ?? '')) return '📝';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) return '🖼️';
    return '📁';
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
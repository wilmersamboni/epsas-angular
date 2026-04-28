import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Formato } from '../../shared/models';

const TIPOS: { value: string; label: string }[] = [
  { value: 'contrato',           label: 'Contrato' },
  { value: 'acta_inicio',        label: 'Acta de inicio' },
  { value: 'acta_seguimiento_1', label: 'Acta seguimiento 1' },
  { value: 'acta_seguimiento_2', label: 'Acta seguimiento 2' },
  { value: 'carta_presentacion', label: 'Carta de presentación' },
  { value: 'paz_y_salvo',        label: 'Paz y salvo' },
  { value: 'certificado',        label: 'Certificado' },
  { value: 'otro',               label: 'Otro' },
];

const FILE_BASE = 'http://localhost:3001/uploads/formatos/';

@Component({
  selector: 'app-formatos',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="flex flex-col items-center gap-8 py-10">

      <h1 class="text-3xl font-bold text-gray-800">Formatos</h1>

      <!-- ── Subir (solo administrador) ───────────────────────────────── -->
      @if (esAdmin()) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-md">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Subir nuevo formato</h2>

          <!-- Nombre -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre descriptivo</label>
          <input
            type="text"
            [(ngModel)]="nombreFormato"
            placeholder="Ej: Contrato empresa XYZ"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm mb-3
                   focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]"
          />

          <!-- Tipo -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de formato</label>
          <select
            [(ngModel)]="tipoSeleccionado"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm mb-3
                   focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
            <option value="">Selecciona un tipo</option>
            @for (t of tipos; track t.value) {
              <option [value]="t.value">{{ t.label }}</option>
            }
          </select>

          <!-- Archivo -->
          <label class="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
          <input
            type="file"
            accept="application/pdf,.doc,.docx,image/*"
            (change)="onFileChange($event)"
            class="block w-full text-sm text-gray-500 mb-4
                   file:me-4 file:py-2 file:px-4
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-[#39A900] file:text-white
                   hover:file:bg-[#2d8400] cursor-pointer"
          />

          <button
            (click)="handleUpload()"
            [disabled]="!archivo || uploading()"
            class="w-full py-2.5 bg-[#39A900] text-white font-semibold rounded-lg
                   hover:bg-[#2d8400] transition-colors disabled:opacity-50">
            {{ uploading() ? 'Subiendo...' : 'Subir archivo' }}
          </button>
        </div>
      }

      <!-- ── Listado ────────────────────────────────────────────────── -->
      <div class="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Archivos disponibles</h2>
        <hr class="mb-4 border-gray-100" />

        @if (loading()) {
          <div class="flex justify-center py-8">
            <div class="w-8 h-8 border-4 border-[#39A900]/30 border-t-[#39A900] rounded-full animate-spin"></div>
          </div>
        }

        @if (!loading() && formatos().length === 0) {
          <p class="text-center text-gray-400 py-10 text-sm">No hay formatos registrados</p>
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          @for (f of formatos(); track f.id) {
            <div class="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow p-4">

              <div class="flex items-start gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 text-lg flex-shrink-0">
                  📄
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="font-medium text-sm text-gray-800 line-clamp-2">{{ f.nombre }}</p>
                  <span class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5
                                bg-[#39A900]/10 text-[#39A900] rounded-full capitalize">
                    {{ tipoLabel(f.tipo) }}
                  </span>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex justify-between gap-2">
                <a [href]="fileUrl(f.ruta_archivo)"
                   target="_blank"
                   class="flex-1 text-center py-1.5 text-xs font-medium rounded-lg
                          bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                  Ver
                </a>
                <a [href]="fileUrl(f.ruta_archivo)"
                   [download]="f.nombre_original"
                   class="flex-1 text-center py-1.5 text-xs font-medium rounded-lg
                          bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                  Descargar
                </a>
                @if (esAdmin()) {
                  <button (click)="handleEliminar(f.id)"
                    class="flex-1 py-1.5 text-xs font-medium rounded-lg
                           bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    Eliminar
                  </button>
                }
              </div>

            </div>
          }
        </div>
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
  archivo:           File | null = null;
  nombreFormato    = '';
  tipoSeleccionado = '';

  esAdmin() { return this.auth.isAdmin(); }

  constructor(private api: ApiService, private toast: ToastService) {}

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
      this.toast.ok('Archivo subido', 'El formato fue registrado correctamente.');
      await this.cargarFormatos();
    } catch (e: any) {
      this.toast.httpError(e, 'Error al subir el archivo.');
    } finally { this.uploading.set(false); }
  }

  async handleEliminar(id: string): Promise<void> {
    if (!this.esAdmin()) return;
    if (!confirm('¿Eliminar este formato?')) return;
    try {
      await this.api.eliminarFormato(id);
      this.toast.ok('Eliminado', 'Formato eliminado correctamente.');
      await this.cargarFormatos();
    } catch (e: any) { this.toast.httpError(e, 'Error al eliminar el formato.'); }
  }

  fileUrl(rutaArchivo: string): string {
    return FILE_BASE + rutaArchivo;
  }

  tipoLabel(tipo: string): string {
    return TIPOS.find(t => t.value === tipo)?.label ?? tipo;
  }
}

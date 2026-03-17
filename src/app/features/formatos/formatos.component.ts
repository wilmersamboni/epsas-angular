import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Formato } from '../../shared/models';

/**
 * Equivalente a PricingPage.tsx de React.
 * Sube, lista y elimina archivos PDF.
 */
@Component({
  selector: 'app-formatos',
  standalone: true,
  imports: [],
  template: `
    <section class="flex flex-col items-center gap-8 py-10">

      <h1 class="text-3xl font-bold text-gray-800">Formatos</h1>

      <!-- Subir -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-96">
        <label class="block text-sm font-medium text-gray-700 mb-3">Seleccionar PDF</label>
        <input
          type="file"
          accept="application/pdf"
          (change)="onFileChange($event)"
          class="block w-full text-sm text-gray-500
                 file:me-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-[#39A900] file:text-white
                 hover:file:bg-[#2d8400] cursor-pointer"
        />
        <button
          (click)="handleUpload()"
          [disabled]="!archivo || uploading()"
          class="mt-4 w-full py-2.5 bg-[#39A900] text-white font-semibold rounded-lg
                 hover:bg-[#2d8400] transition-colors disabled:opacity-50"
        >
          {{ uploading() ? 'Subiendo...' : 'Subir Archivo' }}
        </button>
      </div>

      <!-- Listado -->
      <div class="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Archivos Subidos</h2>
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
          @for (f of formatos(); track f.id_formatos) {
            <div class="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow p-4">

              <div class="flex items-start gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 text-lg flex-shrink-0">
                  📄
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="font-medium text-sm text-gray-800 line-clamp-2">{{ f.nombre }}</p>
                  <span class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5
                                bg-red-50 text-red-500 rounded-full">PDF</span>
                </div>
              </div>

              <div class="flex justify-between gap-2">
                <a [href]="'http://localhost:3000/uploads/' + f.formato_pdf"
                   target="_blank"
                   class="flex-1 text-center py-1.5 text-xs font-medium rounded-lg
                          bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                  Ver
                </a>
                <a [href]="'http://localhost:3000/uploads/' + f.formato_pdf"
                   [download]="f.nombre"
                   class="flex-1 text-center py-1.5 text-xs font-medium rounded-lg
                          bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                  Descargar
                </a>
                <button (click)="handleEliminar(f.id_formatos)"
                  class="flex-1 py-1.5 text-xs font-medium rounded-lg
                         bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class FormatosComponent implements OnInit {
  formatos  = signal<Formato[]>([]);
  loading   = signal(false);
  uploading = signal(false);
  archivo: File | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.cargarFormatos(); }

  async cargarFormatos(): Promise<void> {
    this.loading.set(true);
    try { this.formatos.set(await this.api.listarFormatos()); }
    catch { console.error('Error cargando formatos'); }
    finally { this.loading.set(false); }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
  }

  async handleUpload(): Promise<void> {
    if (!this.archivo) return;
    this.uploading.set(true);
    try {
      await this.api.subirFormato(this.archivo.name, this.archivo);
      this.archivo = null;
      await this.cargarFormatos();
    } catch { alert('Error al subir el archivo.'); }
    finally { this.uploading.set(false); }
  }

  async handleEliminar(id: number): Promise<void> {
    if (!confirm('¿Eliminar este formato?')) return;
    await this.api.eliminarFormato(id);
    await this.cargarFormatos();
  }
}

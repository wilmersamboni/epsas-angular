import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

/**
 * Equivalente a CrearPracticaModal.tsx de React.
 * Crea la etapa práctica de un aprendiz: modalidad, empresa, fechas, estado, observación.
 */
@Component({
  selector: 'app-crear-practica-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        (click)="$event.target === $event.currentTarget && closed.emit()">

        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 class="text-lg font-bold text-gray-800">Crear etapa práctica</h2>
            <p class="text-xs text-gray-400 mt-0.5">Completa los datos para asignar la etapa práctica</p>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

            @if (loadingData()) {
              <p class="text-sm text-gray-400 text-center py-4">Cargando datos...</p>
            } @else {

              <!-- Info del aprendiz -->
              @if (alumnoPreseleccionado) {
                <div class="flex items-center gap-3 p-3 rounded-xl bg-[#39A900]/8 border border-[#39A900]/20">
                  <div class="w-9 h-9 rounded-full bg-[#39A900]/20 text-[#39A900]
                               flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {{ initials(alumnoPreseleccionado.name) }}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-800">{{ alumnoPreseleccionado.name }}</p>
                    <p class="text-xs text-gray-400">{{ alumnoPreseleccionado.programa }} · {{ alumnoPreseleccionado.area }}</p>
                  </div>
                  <span class="text-[10px] bg-[#39A900]/10 text-[#39A900] px-2 py-0.5 rounded-full font-medium">
                    ID: {{ alumnoPreseleccionado.id }}
                  </span>
                </div>
              }

              <!-- Select aprendiz (si no viene preseleccionado) -->
              @if (!alumnoPreseleccionado) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Aprendiz</label>
                  <select [(ngModel)]="form.aprendizId"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                           focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
                    <option value="">Selecciona un aprendiz</option>
                    @for (a of sinPractica(); track a.id) {
                      <option [value]="a.id">{{ a.name }} — {{ a.programa }}</option>
                    }
                  </select>
                </div>
              }

              <!-- Modalidad -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Modalidad</label>
                <select [(ngModel)]="form.modalidadId"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                         focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
                  <option value="">Selecciona una modalidad</option>
                  @for (m of modalidades(); track m.id_modalida) {
                    <option [value]="m.id_modalida">{{ m.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Empresa -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Empresa</label>
                <select [(ngModel)]="form.empresaId"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                         focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
                  <option value="">Selecciona una empresa</option>
                  @for (e of empresas(); track e.id_empresa) {
                    <option [value]="e.id_empresa">{{ e.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Fechas -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha inicio</label>
                  <input type="date" [(ngModel)]="form.fechaInicio"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                           focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha fin</label>
                  <input type="date" [(ngModel)]="form.fechaFin"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                           focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                </div>
              </div>

              <!-- Estado -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                <select [(ngModel)]="form.estado"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                         focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                  <option value="suspendida">Suspendida</option>
                </select>
              </div>

              <!-- Observación -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Observación (opcional)</label>
                <textarea [(ngModel)]="form.observacion" rows="3"
                  placeholder="Escribe una observación inicial..."
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none
                         focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900] resize-y">
                </textarea>
              </div>

              @if (error()) {
                <p class="text-red-500 text-xs">{{ error() }}</p>
              }
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">
            <button (click)="closed.emit()" [disabled]="loading()"
              class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-60">
              Cancelar
            </button>
            <button (click)="guardar()" [disabled]="loading() || loadingData()"
              class="px-5 py-2 text-sm text-white font-medium rounded-lg transition-all
                     bg-gradient-to-r from-[#39A900] to-[#5cd600]
                     hover:opacity-90 disabled:opacity-60">
              {{ loading() ? 'Creando...' : 'Crear etapa práctica' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CrearPracticaModalComponent implements OnChanges {
  @Input() isOpen   = false;
  @Input() aprendices: any[] = [];
  @Input() alumnoPreseleccionado: any = null;
  @Output() closed  = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  modalidades  = signal<any[]>([]);
  empresas     = signal<any[]>([]);
  loadingData  = signal(false);
  loading      = signal(false);
  error        = signal('');

  form = {
    aprendizId: '', modalidadId: '', empresaId: '',
    fechaInicio: '', fechaFin: '', estado: 'activa', observacion: '',
  };

  sinPractica = signal<any[]>([]);

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      this.resetForm();
      this.cargarDatos();
    }
    if (changes['aprendices']) {
      this.sinPractica.set(this.aprendices.filter(a => !a.id_practica));
    }
  }

  resetForm(): void {
    this.form = {
      aprendizId: this.alumnoPreseleccionado ? String(this.alumnoPreseleccionado.id) : '',
      modalidadId: '', empresaId: '',
      fechaInicio: '', fechaFin: '', estado: 'activa', observacion: '',
    };
    this.error.set('');
  }

  async cargarDatos(): Promise<void> {
    this.loadingData.set(true);
    try {
      const [mods, emps] = await Promise.all([
        this.api.listarModalidades(),
        this.api.listarEmpresas(),
      ]);
      this.modalidades.set(mods);
      this.empresas.set(emps);
    } catch { this.error.set('Error cargando datos.'); }
    finally { this.loadingData.set(false); }
  }

  async guardar(): Promise<void> {
    if (!this.form.aprendizId)  { this.error.set('Selecciona un aprendiz.'); return; }
    if (!this.form.modalidadId) { this.error.set('Selecciona una modalidad.'); return; }
    if (!this.form.empresaId)   { this.error.set('Selecciona una empresa.'); return; }
    if (!this.form.fechaInicio) { this.error.set('Ingresa la fecha de inicio.'); return; }
    if (!this.form.fechaFin)    { this.error.set('Ingresa la fecha de fin.'); return; }

    this.loading.set(true);
    this.error.set('');
    try {
      const matriculas = await this.api.listarMatriculasPorAlumno(Number(this.form.aprendizId));
      if (!matriculas.length) {
        this.error.set('El aprendiz no tiene matrícula registrada.');
        return;
      }
      await this.api.crearPractica({
        fk_matricula:  matriculas[0].id_matricula,
        fk_modalidad:  Number(this.form.modalidadId),
        fecha_inicio:  this.form.fechaInicio,
        fecha_fin:     this.form.fechaFin,
        fk_empresa:    Number(this.form.empresaId),
        estado:        this.form.estado,
        observacion:   this.form.observacion,
      });
      this.success.emit();
      this.closed.emit();
    } catch {
      this.error.set('Error al crear la etapa práctica. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  initials(name: string): string {
    return (name ?? '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}

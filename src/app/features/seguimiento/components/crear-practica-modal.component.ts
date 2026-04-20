import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, signal, computed
} from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';


import { type TuiDay } from '@taiga-ui/cdk';
import { TuiCalendar, } from '@taiga-ui/core';

@Component({
  selector: 'app-crear-practica-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiCalendar
  ],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        (click)="$event.target === $event.currentTarget && closed.emit()">

        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">

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

              <!-- Select aprendiz -->
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
                  @for (m of modalidades(); track m.id) {
                    <option [value]="m.id">{{ m.nombre }}</option>
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
                  @for (e of empresas(); track e.id) {
                    <option [value]="e.id">{{ e.nombre }}</option>
                  }
                </select>
              </div>

<!-- Fechas con TuiCalendar -->
<div class="grid grid-cols-2 gap-3">

  <!-- Fecha inicio -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha inicio</label>
    <div class="relative">
      <button type="button"
        (click)="toggleCalendario('inicio')"
        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-left
               focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
               flex items-center justify-between">
        <span [class.text-gray-400]="!fechaInicioCtrl.value">
          {{ fechaInicioCtrl.value
              ? (fechaInicioCtrl.value.day + '/' + (fechaInicioCtrl.value.month + 1) + '/' + fechaInicioCtrl.value.year)
              : 'DD/MM/AAAA' }}
        </span>
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </button>

      @if (calAbierto === 'inicio') {
        <div class="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl"
             (clickOutside)="calAbierto = null">
          <tui-calendar
            [value]="fechaInicioCtrl.value"
            (dayClick)="onDayClick($event, 'inicio')"
          />
        </div>
      }
    </div>
  </div>

  <!-- Fecha fin -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha fin</label>
    <div class="relative">
      <button type="button"
        (click)="toggleCalendario('fin')"
        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-left
               focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
               flex items-center justify-between">
        <span [class.text-gray-400]="!fechaFinCtrl.value">
          {{ fechaFinCtrl.value
              ? (fechaFinCtrl.value.day + '/' + (fechaFinCtrl.value.month + 1) + '/' + fechaFinCtrl.value.year)
              : 'DD/MM/AAAA' }}
        </span>
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </button>

      @if (calAbierto === 'fin') {
        <div class="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
          <tui-calendar
            [value]="fechaFinCtrl.value"
            (dayClick)="onDayClick($event, 'fin')"
          />
        </div>
      }
    </div>
  </div>

</div>

              <!-- Instructor (autocomplete) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Instructor responsable
                </label>
                <div class="relative">
                  <input
                    type="text"
                    [value]="instructorTexto"
                    (input)="onBuscarInstructor($any($event.target).value)"
                    (focus)="mostrarListaInstructor = true"
                    placeholder="Buscar instructor o administrador..."
                    autocomplete="off"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                           focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />

                  @if (mostrarListaInstructor && instructoresFiltrados().length > 0) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200
                                rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      @for (inst of instructoresFiltrados(); track inst.idPersona ?? inst.id_persona) {
                        <button type="button"
                          (click)="seleccionarInstructor(inst)"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-[#39A900]/10
                                 hover:text-[#39A900] transition-colors flex items-center gap-2">
                          <span class="flex-1">{{ inst.nombre }}</span>
                          <span class="text-[10px] px-1.5 py-0.5 rounded-full
                                       bg-gray-100 text-gray-500 capitalize">
                            {{ inst.cargo }}
                          </span>
                        </button>
                      }
                    </div>
                  }

                  @if (mostrarListaInstructor && instructoresFiltrados().length === 0 && instructorTexto.length > 0) {
                    <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200
                                rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
                      Sin resultados para "{{ instructorTexto }}"
                    </div>
                  }
                </div>
              </div>

              <!-- Estado -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                <select [(ngModel)]="form.estado"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                         focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="cerificado">Certificado</option>
                  <option value="por certificar">Por certificar</option>
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
                     bg-sena-gradient hover:opacity-90
                     disabled:opacity-60 disabled:grayscale disabled:cursor-not-allowed">
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
  instructores = signal<any[]>([]);
  loadingData  = signal(false);
  loading      = signal(false);
  error        = signal('');

  // ── TaigaUI v4 date controls ──────────────────────────────────
  fechaInicioCtrl = new FormControl<TuiDay | null>(null);
  fechaFinCtrl    = new FormControl<TuiDay | null>(null);



  // ── Autocomplete instructor ───────────────────────────────────
  instructorTexto        = '';
  mostrarListaInstructor = false;

  instructoresFiltrados = computed(() => {
    const texto = this.instructorTexto.toLowerCase().trim();
    if (!texto) return this.instructores();
    return this.instructores().filter((p: any) =>
      (p.nombre ?? '').toLowerCase().includes(texto)
    );
  });

  form = {
    aprendizId: '', modalidadId: '', empresaId: '',
    estado: 'activo', observacion: '', instructorId: '',
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
      aprendizId: this.alumnoPreseleccionado
        ? String(this.alumnoPreseleccionado.id ?? this.alumnoPreseleccionado.idPersona ?? '')
        : '',
      modalidadId: '', empresaId: '',
      estado: 'activo', observacion: '', instructorId: '',
    };
    this.fechaInicioCtrl.reset(null);
    this.fechaFinCtrl.reset(null);
    this.instructorTexto        = '';
    this.mostrarListaInstructor = false;
    this.error.set('');
  }

  async cargarDatos(): Promise<void> {
    this.loadingData.set(true);
    try {
      const [mods, emps, insts] = await Promise.all([
        this.api.listarModalidades(),
        this.api.listarEmpresas(),
        this.api.listarInstructores(),
      ]);
      this.modalidades.set(mods);
      this.empresas.set(emps);
      this.instructores.set(insts);
    } catch { this.error.set('Error cargando datos.'); }
    finally { this.loadingData.set(false); }
  }

  // ── TuiDay → 'YYYY-MM-DD' ────────────────────────────────────
  private tuiDayToISO(day: TuiDay | null): string {
    if (!day) return '';
    const m = String(day.month + 1).padStart(2, '0'); // month es 0-based
    const d = String(day.day).padStart(2, '0');
    return `${day.year}-${m}-${d}`;
  }

  onBuscarInstructor(texto: string): void {
    this.instructorTexto        = texto;
    this.mostrarListaInstructor = true;
    if (!texto.trim()) this.form.instructorId = '';
  }

  seleccionarInstructor(inst: any): void {
    this.form.instructorId      = String(inst.idPersona ?? inst.id_persona ?? inst.id ?? '');
    this.instructorTexto        = inst.nombre ?? '';
    this.mostrarListaInstructor = false;
  }
  // En la clase — agrega estas propiedades y elimina fechaInicio/fechaFin duplicados
calAbierto: 'inicio' | 'fin' | null = null;

toggleCalendario(cual: 'inicio' | 'fin'): void {
  this.calAbierto = this.calAbierto === cual ? null : cual;
}

onDayClick(day: TuiDay, cual: 'inicio' | 'fin'): void {
  if (cual === 'inicio') {
    this.fechaInicioCtrl.setValue(day);
  } else {
    this.fechaFinCtrl.setValue(day);
  }
  this.calAbierto = null; // cierra el calendario al seleccionar
}

  async guardar(): Promise<void> {
    const fechaInicio = this.tuiDayToISO(this.fechaInicioCtrl.value);
    const fechaFin    = this.tuiDayToISO(this.fechaFinCtrl.value);

    if (!this.form.aprendizId)   { this.error.set('Selecciona un aprendiz.'); return; }
    if (!this.form.modalidadId || this.form.modalidadId === 'undefined') { this.error.set('Selecciona una modalidad.'); return; }
    if (!this.form.empresaId   || this.form.empresaId   === 'undefined') { this.error.set('Selecciona una empresa.'); return; }
    if (!fechaInicio)            { this.error.set('Ingresa la fecha de inicio.'); return; }
    if (!fechaFin)               { this.error.set('Ingresa la fecha de fin.'); return; }

    this.loading.set(true);
    this.error.set('');
    try {
      const matriculas = await this.api.listarMatriculasPorAlumno(String(this.form.aprendizId));
      if (!matriculas.length) {
        this.error.set('El aprendiz no tiene matrícula registrada.');
        return;
      }
      const matriculaId = matriculas[0].idMatricula ?? matriculas[0].id_matricula;
      const payload: any = {
        matriculaId,
        modalidadId:  String(this.form.modalidadId),
        empresaId:    String(this.form.empresaId),
        fecha_inicio: fechaInicio,
        fecha_fin:    fechaFin,
        estado:       this.form.estado,
        observacion:  this.form.observacion,
      };
      if (this.form.instructorId) {
        payload.instructorId = String(this.form.instructorId);
      }
      await this.api.crearPractica(payload);
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
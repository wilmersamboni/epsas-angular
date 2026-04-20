import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges,
  signal, computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

/* ── Taiga UI ─────────────────────────────────────────── */
import { TuiButton, TuiInputDirective } from '@taiga-ui/core';
import { TuiSelect, TuiTextarea, TuiInputDate } from '@taiga-ui/kit';
import { TuiDay } from '@taiga-ui/cdk';

/**
 * Crea la etapa práctica de un aprendiz.
 * Formulario adaptado a Taiga UI v5.
 */
@Component({
  selector: 'app-crear-practica-modal',
  standalone: true,
  imports: [
    FormsModule,
    TuiButton,
    TuiInputDirective,
    ...TuiSelect,     // TuiNativeSelect + TuiTextfieldComponent + TuiLabel + …
    ...TuiTextarea,   // TuiTextareaComponent + TuiTextfieldComponent + TuiLabel + …
    ...TuiInputDate,  // TuiInputDateDirective + TuiCalendar + TuiTextfieldComponent + …
  ],
  styles: [`tui-textfield { display: block; }`],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
           (click)="$event.target === $event.currentTarget && closed.emit()">

        <!-- Contenedor del modal -->
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

          <!-- ── Header ─────────────────────────────── -->
          <div class="px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 class="text-lg font-bold text-gray-800">Crear etapa práctica</h2>
            <p class="text-xs text-gray-400 mt-0.5">
              Completa los datos para asignar la etapa práctica
            </p>
          </div>

          <!-- ── Body ──────────────────────────────── -->
          <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

            @if (loadingData()) {
              <p class="text-sm text-gray-400 text-center py-4">Cargando datos…</p>

            } @else {

              <!-- Info del aprendiz preseleccionado -->
              @if (alumnoPreseleccionado) {
                <div class="flex items-center gap-3 p-3 rounded-xl
                            bg-[#39A900]/8 border border-[#39A900]/20">
                  <div class="w-9 h-9 rounded-full bg-[#39A900]/20 text-[#39A900]
                              flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {{ initials(alumnoPreseleccionado.name) }}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-800">
                      {{ alumnoPreseleccionado.name }}
                    </p>
                    <p class="text-xs text-gray-400">
                      {{ alumnoPreseleccionado.programa }} · {{ alumnoPreseleccionado.area }}
                    </p>
                  </div>
                  <span class="text-[10px] bg-[#39A900]/10 text-[#39A900]
                               px-2 py-0.5 rounded-full font-medium">
                    ID: {{ alumnoPreseleccionado.id }}
                  </span>
                </div>
              }

              <!-- ── Aprendiz (solo si no viene preseleccionado) ── -->
              @if (!alumnoPreseleccionado) {
                <tui-textfield tuiTextfieldSize="m">
                  <label tuiLabel>Aprendiz</label>
                  <select tuiSelect
                    [items]="sinPractica()"
                    [labels]="sinPracticaLabels()"
                    placeholder="Selecciona un aprendiz"
                    [(ngModel)]="form.aprendiz"
                    name="aprendiz">
                  </select>
                </tui-textfield>
              }

              <!-- ── Modalidad ── -->
              <tui-textfield tuiTextfieldSize="m">
                <label tuiLabel>Modalidad</label>
                <select tuiSelect
                  [items]="modalidades()"
                  [labels]="modalidadesLabels()"
                  placeholder="Selecciona una modalidad"
                  [(ngModel)]="form.modalidad"
                  name="modalidad">
                </select>
              </tui-textfield>

              <!-- ── Empresa ── -->
              <tui-textfield tuiTextfieldSize="m">
                <label tuiLabel>Empresa</label>
                <select tuiSelect
                  [items]="empresas()"
                  [labels]="empresasLabels()"
                  placeholder="Selecciona una empresa"
                  [(ngModel)]="form.empresa"
                  name="empresa">
                </select>
              </tui-textfield>

              <!-- ── Fechas con calendario TUI ── -->
              <div class="grid grid-cols-2 gap-3">
                <tui-textfield tuiTextfieldSize="m">
                  <label tuiLabel>Fecha inicio</label>
                  <input tuiInputDate
                    [(ngModel)]="form.fechaInicio"
                    name="fechaInicio"
                    placeholder="DD.MM.AAAA" />
                </tui-textfield>

                <tui-textfield tuiTextfieldSize="m">
                  <label tuiLabel>Fecha fin</label>
                  <input tuiInputDate
                    [(ngModel)]="form.fechaFin"
                    name="fechaFin"
                    placeholder="DD.MM.AAAA" />
                </tui-textfield>
              </div>

              <!-- ── Instructor (autocomplete propio) ── -->
              <tui-textfield tuiTextfieldSize="m">
                <label tuiLabel>Instructor responsable</label>
                <input tuiInput
                  type="text"
                  [value]="instructorTexto"
                  (input)="onBuscarInstructor($any($event.target).value)"
                  (focus)="mostrarListaInstructor = true"
                  (blur)="ocultarListaConDelay()"
                  placeholder="Buscar instructor o administrador…"
                  autocomplete="off"
                  name="instructor" />
              </tui-textfield>

              <!-- Dropdown instructor -->
              @if (mostrarListaInstructor && instructoresFiltrados().length > 0) {
                <div class="relative -mt-3">
                  <div class="absolute z-50 w-full bg-white border border-gray-200
                              rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    @for (inst of instructoresFiltrados(); track inst.idPersona ?? inst.id_persona) {
                      <button type="button"
                        (mousedown)="seleccionarInstructor(inst)"
                        class="w-full text-left px-4 py-2 text-sm
                               hover:bg-[#39A900]/10 hover:text-[#39A900]
                               transition-colors flex items-center gap-2">
                        <span class="flex-1">{{ inst.nombre }}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded-full
                                     bg-gray-100 text-gray-500 capitalize">
                          {{ inst.cargo }}
                        </span>
                      </button>
                    }
                  </div>
                </div>
              }

              @if (mostrarListaInstructor &&
                   instructoresFiltrados().length === 0 &&
                   instructorTexto.length > 0) {
                <div class="relative -mt-3">
                  <div class="absolute z-50 w-full bg-white border border-gray-200
                              rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
                    Sin resultados para "{{ instructorTexto }}"
                  </div>
                </div>
              }

              <!-- ── Estado ── -->
              <tui-textfield tuiTextfieldSize="m">
                <label tuiLabel>Estado</label>
                <select tuiSelect
                  [items]="estadosValores"
                  [labels]="estadosLabels"
                  [(ngModel)]="form.estado"
                  name="estado">
                </select>
              </tui-textfield>

              <!-- ── Observación ── -->
              <tui-textfield tuiTextfieldSize="m">
                <label tuiLabel>Observación (opcional)</label>
                <textarea tuiTextarea
                  [(ngModel)]="form.observacion"
                  placeholder="Escribe una observación inicial…"
                  rows="3"
                  name="observacion">
                </textarea>
              </tui-textfield>

              @if (error()) {
                <p class="text-red-500 text-xs">{{ error() }}</p>
              }
            }
          </div>

          <!-- ── Footer ─────────────────────────────── -->
          <div class="px-6 py-4 border-t border-gray-100
                      flex justify-end gap-2 flex-shrink-0">
            <button tuiButton appearance="outline" size="m"
                    (click)="closed.emit()"
                    [disabled]="loading()">
              Cancelar
            </button>

            <button tuiButton appearance="primary" size="m"
                    (click)="guardar()"
                    [disabled]="loading() || loadingData()">
              {{ loading() ? 'Creando…' : 'Crear etapa práctica' }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class CrearPracticaModalComponent implements OnChanges {

  @Input() isOpen  = false;
  @Input() aprendices: any[] = [];
  @Input() alumnoPreseleccionado: any = null;
  @Output() closed  = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  /* ── Señales de datos ─────────────────────────────────────────── */
  modalidades  = signal<any[]>([]);
  empresas     = signal<any[]>([]);
  instructores = signal<any[]>([]);
  sinPractica  = signal<any[]>([]);
  loadingData  = signal(false);
  loading      = signal(false);
  error        = signal('');

  /* ── Labels computados para TuiNativeSelect ───────────────────── */
  modalidadesLabels = computed(() => this.modalidades().map(m => m.nombre ?? m.name ?? ''));
  empresasLabels    = computed(() => this.empresas().map(e => e.nombre    ?? e.name ?? ''));
  sinPracticaLabels = computed(() => this.sinPractica().map(a =>
    `${a.name ?? ''} — ${a.programa ?? ''}`
  ));

  /* ── Estados ──────────────────────────────────────────────────── */
  readonly estadosValores: readonly string[] = [
    'activo', 'inactivo', 'suspendido', 'certificado', 'por certificar',
  ];
  readonly estadosLabels: readonly string[] = [
    'Activo', 'Inactivo', 'Suspendido', 'Certificado', 'Por certificar',
  ];

  /* ── Autocomplete instructor ──────────────────────────────────── */
  instructorTexto        = '';
  mostrarListaInstructor = false;

  instructoresFiltrados = computed(() => {
    const texto = this.instructorTexto.toLowerCase().trim();
    if (!texto) return this.instructores();
    return this.instructores().filter((p: any) =>
      (p.nombre ?? '').toLowerCase().includes(texto)
    );
  });

  /* ── Modelo del formulario ────────────────────────────────────── */
  form: {
    aprendiz:     any;
    modalidad:    any;
    empresa:      any;
    fechaInicio:  TuiDay | null;   // TuiInputDate trabaja con TuiDay
    fechaFin:     TuiDay | null;
    estado:       string;
    observacion:  string;
    instructorId: string;
  } = this.emptyForm();

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

  /* ── Helpers de formulario ────────────────────────────────────── */
  private emptyForm() {
    return {
      aprendiz:     null as any,
      modalidad:    null as any,
      empresa:      null as any,
      fechaInicio:  null as TuiDay | null,
      fechaFin:     null as TuiDay | null,
      estado:       'activo',
      observacion:  '',
      instructorId: '',
    };
  }

  resetForm(): void {
    this.form = this.emptyForm();
    this.instructorTexto        = '';
    this.mostrarListaInstructor = false;
    this.error.set('');
  }

  /** Convierte TuiDay → 'YYYY-MM-DD' para el backend */
  private tuiDayToISO(d: TuiDay | null): string {
    if (!d) return '';
    const mm = String(d.month + 1).padStart(2, '0'); // month es 0-indexed en TuiDay
    const dd = String(d.day).padStart(2, '0');
    return `${d.year}-${mm}-${dd}`;
  }

  /* ── Carga de catálogos ───────────────────────────────────────── */
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
    } catch {
      this.error.set('Error cargando datos.');
    } finally {
      this.loadingData.set(false);
    }
  }

  /* ── Autocomplete instructor ──────────────────────────────────── */
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

  ocultarListaConDelay(): void {
    setTimeout(() => { this.mostrarListaInstructor = false; }, 200);
  }

  /* ── Guardar ──────────────────────────────────────────────────── */
  async guardar(): Promise<void> {
    const aprendizId = this.alumnoPreseleccionado
      ? String(this.alumnoPreseleccionado.id ?? this.alumnoPreseleccionado.idPersona ?? '')
      : String(this.form.aprendiz?.id ?? this.form.aprendiz?.idPersona ?? '');

    if (!aprendizId)           { this.error.set('Selecciona un aprendiz.'); return; }
    if (!this.form.modalidad)  { this.error.set('Selecciona una modalidad.'); return; }
    if (!this.form.empresa)    { this.error.set('Selecciona una empresa.'); return; }
    if (!this.form.fechaInicio){ this.error.set('Ingresa la fecha de inicio.'); return; }
    if (!this.form.fechaFin)   { this.error.set('Ingresa la fecha de fin.'); return; }

    this.loading.set(true);
    this.error.set('');

    try {
      const matriculas = await this.api.listarMatriculasPorAlumno(aprendizId);
      if (!matriculas.length) {
        this.error.set('El aprendiz no tiene matrícula registrada.');
        return;
      }

      const matriculaId = matriculas[0].idMatricula ?? matriculas[0].id_matricula;
      const payload: any = {
        matriculaId,
        modalidadId:  String(this.form.modalidad.id ?? this.form.modalidad.idModalidad ?? ''),
        empresaId:    String(this.form.empresa.id   ?? this.form.empresa.idEmpresa     ?? ''),
        fecha_inicio: this.tuiDayToISO(this.form.fechaInicio),
        fecha_fin:    this.tuiDayToISO(this.form.fechaFin),
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

  /* ── Util ─────────────────────────────────────────────────────── */
  initials(name: string): string {
    return (name ?? '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}

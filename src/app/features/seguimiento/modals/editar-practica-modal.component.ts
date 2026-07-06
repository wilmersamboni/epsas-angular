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
 * Edita los datos de una etapa práctica existente.
 * Permite cambiar empresa, modalidad, fechas, estado y observación.
 */
@Component({
  selector: 'app-editar-practica-modal',
  standalone: true,
  imports: [
    FormsModule,
    TuiButton,
    TuiInputDirective,
    ...TuiSelect,
    ...TuiTextarea,
    ...TuiInputDate,
  ],
  styles: [`tui-textfield { display: block; }`],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
           (click)="$event.target === $event.currentTarget && closed.emit()">

        <!-- Contenedor -->
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

          <!-- ── Header ─────────────────────────────── -->
          <div class="px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 class="text-lg font-bold text-gray-800">Editar etapa práctica</h2>
            @if (alumno) {
              <p class="text-xs text-gray-400 mt-0.5">
                {{ alumno.name }} · {{ alumno.programa }}
              </p>
            }
          </div>

          <!-- ── Body ──────────────────────────────── -->
          <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

            @if (loadingData()) {
              <p class="text-sm text-gray-400 text-center py-4">Cargando datos…</p>

            } @else {

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

              <!-- ── Fechas ── -->
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
                <label tuiLabel>Observación</label>
                <textarea tuiTextarea
                  [(ngModel)]="form.observacion"
                  placeholder="Escribe una observación…"
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
              {{ loading() ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class EditarPracticaModalComponent implements OnChanges {

  @Input() isOpen = false;
  @Input() alumno: any = null;   // Aprendiz con id_practica, empresa, modalidad, etc.
  @Output() closed  = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  /* ── Señales de datos ─────────────────────────────────────────── */
  modalidades  = signal<any[]>([]);
  empresas     = signal<any[]>([]);
  loadingData  = signal(false);
  loading      = signal(false);
  error        = signal('');

  /* ── Labels computados para TuiNativeSelect ───────────────────── */
  modalidadesLabels = computed(() => this.modalidades().map(m => m.nombre ?? m.name ?? ''));
  empresasLabels    = computed(() => this.empresas().map(e => e.nombre    ?? e.name ?? ''));

  /* ── Estados ──────────────────────────────────────────────────── */
  readonly estadosValores: readonly string[] = [
    'activo', 'inactivo', 'suspendido', 'condicionado',
    'certificado', 'por certificar', 'cancelado', 'retiro voluntario',
  ];
  readonly estadosLabels: readonly string[] = [
    'Activo', 'Inactivo', 'Suspendido', 'Condicionado',
    'Certificado', 'Por certificar', 'Cancelado', 'Retiro Voluntario',
  ];

  /* ── Modelo del formulario ────────────────────────────────────── */
  form: {
    modalidad:   any;
    empresa:     any;
    fechaInicio: TuiDay | null;
    fechaFin:    TuiDay | null;
    estado:      string;
    observacion: string;
  } = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      this.error.set('');
      this.cargarDatos();
    }
  }

  /* ── Helpers de formulario ────────────────────────────────────── */
  private emptyForm() {
    return {
      modalidad:   null as any,
      empresa:     null as any,
      fechaInicio: null as TuiDay | null,
      fechaFin:    null as TuiDay | null,
      estado:      'activo',
      observacion: '',
    };
  }

  /** Convierte TuiDay → 'YYYY-MM-DD' para el backend */
  private tuiDayToISO(d: TuiDay | null): string {
    if (!d) return '';
    const mm = String(d.month + 1).padStart(2, '0');
    const dd = String(d.day).padStart(2, '0');
    return `${d.year}-${mm}-${dd}`;
  }

  /** Convierte 'YYYY-MM-DD' → TuiDay */
  private isoToTuiDay(iso: string): TuiDay | null {
    if (!iso) return null;
    const parts = iso.substring(0, 10).split('-');
    if (parts.length !== 3) return null;
    return new TuiDay(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  /* ── Carga de catálogos y pre-populado ───────────────────────── */
  async cargarDatos(): Promise<void> {
    this.loadingData.set(true);
    try {
      const [mods, emps] = await Promise.all([
        this.api.listarModalidades(),
        this.api.listarEmpresas(),
      ]);
      this.modalidades.set(mods);
      this.empresas.set(emps);

      // Pre-popular el formulario con los datos actuales del alumno
      if (this.alumno) {
        const modalidadActual = mods.find((m: any) =>
          m.nombre === this.alumno.modalidad || m.id === this.alumno.modalidadId
        ) ?? null;
        const empresaActual = emps.find((e: any) =>
          e.nombre === this.alumno.empresa || e.id === this.alumno.empresaId
        ) ?? null;

        this.form = {
          modalidad:   modalidadActual,
          empresa:     empresaActual,
          fechaInicio: this.isoToTuiDay(this.alumno.startDate ?? this.alumno.fecha_inicio ?? ''),
          fechaFin:    this.isoToTuiDay(this.alumno.endDate   ?? this.alumno.fecha_fin    ?? ''),
          estado:      this.alumno.estado ?? 'activo',
          observacion: this.alumno.observacion ?? '',
        };
      }
    } catch {
      this.error.set('Error cargando datos.');
    } finally {
      this.loadingData.set(false);
    }
  }

  /* ── Guardar ──────────────────────────────────────────────────── */
  async guardar(): Promise<void> {
    if (!this.alumno?.id_practica) {
      this.error.set('No se encontró la etapa práctica.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const payload: any = {
        estado:      this.form.estado,
        observacion: this.form.observacion,
      };

      if (this.form.modalidad) {
        payload.modalidadId = String(this.form.modalidad.id ?? this.form.modalidad.idModalidad ?? '');
      }
      if (this.form.empresa) {
        payload.empresaId = String(this.form.empresa.id ?? this.form.empresa.idEmpresa ?? '');
      }
      if (this.form.fechaInicio) {
        payload.fecha_inicio = this.tuiDayToISO(this.form.fechaInicio);
      }
      if (this.form.fechaFin) {
        payload.fecha_fin = this.tuiDayToISO(this.form.fechaFin);
      }

      await this.api.actualizarPractica(String(this.alumno.id_practica), payload);
      this.success.emit();
      this.closed.emit();
    } catch {
      this.error.set('Error al guardar los cambios. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SeguimientosModalComponent } from './seguimientos-modal.component';
import { ObservacionModalComponent } from './observacion-modal.component';
import { CrearPracticaModalComponent } from './crear-practica-modal.component';

export const COLUMNS = [
  { name: 'Nombre',         uid: 'name',        sortable: true  },
  { name: 'Identificación', uid: 'age',         sortable: true  },
  { name: 'Email',          uid: 'email',       sortable: false },
  { name: 'Área',           uid: 'area',        sortable: false },
  { name: 'Programa',       uid: 'programa',    sortable: true  },
  { name: 'Ficha',          uid: 'number',      sortable: false },
  { name: 'Fecha Inicio',   uid: 'startDate',   sortable: false },
  { name: 'Fecha Fin',      uid: 'endDate',     sortable: true  },
  { name: 'Observación',    uid: 'observacion', sortable: false },
  { name: 'Avance',         uid: 'avance',      sortable: true  },
  { name: 'Estado',         uid: 'estado',      sortable: false },
  { name: 'Acciones',       uid: 'actions',     sortable: false },
];

const INITIAL_VISIBLE = new Set([
  'name','age','area','programa','number',
  'startDate','endDate','observacion','avance','estado','actions',
]);

const STATUS_OPTIONS = [
  { name: 'Activo',     uid: 'activo'     },
  { name: 'Inactivo',   uid: 'inactivo'   },
  { name: 'Suspendido', uid: 'suspendido' },
];

function formatDate(d: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

@Component({
  selector: 'app-table-info',
  standalone: true,
  imports: [FormsModule, SeguimientosModalComponent, ObservacionModalComponent, CrearPracticaModalComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100">

      <!-- Título -->
      <div class="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 class="text-xl font-semibold text-gray-800">Aprendices</h2>
      </div>

      <!-- Toolbar -->
      <div class="px-6 pb-4 flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

          <!-- Búsqueda -->
          <div class="relative w-full sm:max-w-md">
            <input
  type="text"
  [ngModel]="filterValue()"
  (ngModelChange)="filterValue.set($event); resetPage()"
              placeholder="🔍︎ Buscar por nombre o identificación..."
              class="w-full pl-3 pr-8 py-2 border-2 border-gray-200 rounded-xl text-sm
                     hover:border-[#39A900]/50 focus:outline-none focus:border-[#39A900] transition-colors"/>
            @if (filterValue()) {
              <button (click)="filterValue.set(''); resetPage()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            }
          </div>

          <!-- Botón Columnas -->
          <div class="flex gap-3">
            <div class="relative">
              <button (click)="showColMenu = !showColMenu"
                class="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                       text-sm text-gray-600 hover:border-[#39A900]/50 transition-colors bg-white">
                Columnas
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"/>
                </svg>
              </button>
              @if (showColMenu) {
                <div class="absolute right-0 top-10 z-20 bg-white border border-gray-200
                             rounded-xl shadow-lg p-3 min-w-[200px]">
                  <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Columnas visibles</p>
                  @for (col of allColumns; track col.uid) {
                    @if (col.uid !== 'actions') {
                      <label class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50
                                     cursor-pointer text-sm text-gray-700">
                        <input type="checkbox" [checked]="visibleCols.has(col.uid)"
                          (change)="toggleCol(col.uid)" class="accent-[#39A900] w-3.5 h-3.5"/>
                        {{ col.name }}
                      </label>
                    }
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Sub-toolbar -->
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-400">Total {{ filtered().length }} aprendices</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">Filas por página:</span>
            <select [(ngModel)]="rowsPerPage" (ngModelChange)="resetPage()"
              class="border border-gray-200 rounded-lg text-xs text-gray-600 py-1.5 px-2
                     focus:outline-none focus:border-[#39A900] hover:border-[#39A900]/50">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="15">15</option>
              <option [value]="20">20</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto min-h-[260px]" style="scrollbar-width:none">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-[#39A900]/30 border-t-[#39A900] rounded-full animate-spin"></div>
          </div>
        } @else {
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr>
                @for (col of headerColumns(); track col.uid) {
                  <th class="bg-[#F8F9FA] text-gray-500 text-xs font-semibold uppercase tracking-wider
                              border-b border-gray-100 py-3 px-4 text-left whitespace-nowrap"
                    [class.cursor-pointer]="col.sortable"
                    (click)="col.sortable && sort(col.uid)">

                    @if (col.uid === 'area') {
                      <!-- Filtro Área -->
                      <div class="relative">
                        <button (click)="$event.stopPropagation(); toggleAreaMenu()"
                          class="flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                          [class.bg-green-50]="selectedAreas.length > 0"
                          [class.text-green-700]="selectedAreas.length > 0"
                          [class.text-gray-500]="selectedAreas.length === 0">
                          <svg width="12" height="12" viewBox="0 0 24 24"
                            [attr.fill]="selectedAreas.length > 0 ? '#39A900' : 'none'"
                            [attr.stroke]="selectedAreas.length > 0 ? '#39A900' : 'currentColor'" stroke-width="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                          </svg>
                          Área
                          @if (selectedAreas.length > 0) {
                            <span class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                                          bg-[#39A900] text-white text-[10px] font-bold rounded-full">
                              {{ selectedAreas().length }}
                            </span>
                          }
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                            [class.rotate-180]="showAreaMenu">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                        @if (showAreaMenu) {
                          <div class="absolute left-0 top-8 z-[9999] min-w-[180px] bg-white border
                                       border-gray-200 rounded-xl shadow-lg p-3"
                            (click)="$event.stopPropagation()">
                            <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Filtrar por área</p>
                            <div class="flex flex-col gap-1">
                              @for (area of areas(); track area) {
                                <label class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                                  <input type="checkbox" [checked]="selectedAreas().includes(area)"
                                    (change)="toggleArea(area)" class="accent-[#39A900] w-3.5 h-3.5"/>
                                  {{ area }}
                                </label>
                              }
                            </div>
                            @if (selectedAreas.length > 0) {
                              <div class="border-t border-gray-100 mt-2 pt-2">
                                <button (click)="selectedAreas.set([]); resetPage()"
                                  class="w-full text-xs text-red-500 hover:text-red-600 py-1">
                                  Limpiar filtro
                                </button>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    } @else if (col.uid === 'estado') {
                      <!-- Filtro Estado -->
                      <div class="relative">
                        <button (click)="$event.stopPropagation(); toggleStatusMenu()"
                          class="flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                          [class.bg-green-50]="selectedStatuses.length > 0"
                          [class.text-green-700]="selectedStatuses.length > 0"
                          [class.text-gray-500]="selectedStatuses.length === 0">
                          <svg width="12" height="12" viewBox="0 0 24 24"
                            [attr.fill]="selectedStatuses.length > 0 ? '#39A900' : 'none'"
                            [attr.stroke]="selectedStatuses.length > 0 ? '#39A900' : 'currentColor'" stroke-width="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                          </svg>
                          Estado
                          @if (selectedStatuses.length > 0) {
                            <span class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                                          bg-[#39A900] text-white text-[10px] font-bold rounded-full">
                              {{ selectedStatuses().length }}
                            </span>
                          }
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                            [class.rotate-180]="showStatusMenu">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                        @if (showStatusMenu) {
                          <div class="absolute left-0 top-8 z-[9999] min-w-[180px] bg-white border
                                       border-gray-200 rounded-xl shadow-lg p-3"
                            (click)="$event.stopPropagation()">
                            <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Filtrar por estado</p>
                            <div class="flex flex-col gap-1">
                              @for (s of statusOptions; track s.uid) {
                                <label class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                                  <input type="checkbox" [checked]="selectedStatuses().includes(s.uid)"
                                    (change)="toggleStatus(s.uid)" class="accent-[#39A900] w-3.5 h-3.5"/>
                                  <span class="w-2 h-2 rounded-full flex-shrink-0"
                                    [style.background-color]="statusDotColor(s.uid)"></span>
                                  {{ s.name }}
                                </label>
                              }
                            </div>
                            @if (selectedStatuses.length > 0) {
                              <div class="border-t border-gray-100 mt-2 pt-2">
                                <button (click)="selectedStatuses.set([]); resetPage()"
                                  class="w-full text-xs text-red-500 hover:text-red-600 py-1">
                                  Limpiar filtro
                                </button>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    } @else {
                      <span class="flex items-center gap-1">
                        {{ col.name }}
                        @if (col.sortable && sortCol === col.uid) {
                          <span class="text-[#39A900]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                        }
                      </span>
                    }
                  </th>
                }
              </tr>
            </thead>

            <tbody>
              @if (paged().length === 0) {
                <tr>
                  <td [attr.colspan]="headerColumns().length"
                    class="text-center text-gray-400 py-10 text-sm">
                    No hay registros
                  </td>
                </tr>
              }
              @for (item of paged(); track item.id; let odd = $odd) {
                <tr class="transition-colors duration-150 hover:bg-[#39A900]/5"
                  [class.bg-white]="!odd"
                  [class.bg-[#F8FFFE]]="odd">

                  @for (col of headerColumns(); track col.uid) {
                    <td class="py-3 px-4 border-b border-gray-50 text-gray-700 text-sm">

                      @switch (col.uid) {

                        @case ('name') {
                          <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center
                                         text-xs font-bold flex-shrink-0"
                              [class]="avatarColor(item.name)">
                              {{ initials(item.name) }}
                            </div>
                            <div class="flex flex-col">
                              <span class="text-sm font-medium text-gray-800">{{ item.name }}</span>
                              <span class="text-xs text-gray-400">{{ item.email }}</span>
                            </div>
                          </div>
                        }

                        @case ('estado') {
                          @if (!item.id_practica) {
                            <span title="Sin etapa práctica asignada"
                              class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full
                                      bg-gray-100 text-gray-400 cursor-help">
                              ! Sin práctica
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1.5 text-xs font-medium
                                          px-2 py-1 rounded-full capitalize"
                              [class.bg-green-100]="item.estado === 'activo' || item.estado === 'activa'"
                              [class.text-green-700]="item.estado === 'activo' || item.estado === 'activa'"
                              [class.bg-red-100]="item.estado === 'inactivo'"
                              [class.text-red-600]="item.estado === 'inactivo'"
                              [class.bg-yellow-100]="item.estado === 'suspendido'"
                              [class.text-yellow-700]="item.estado === 'suspendido'">
                              <span class="w-1.5 h-1.5 rounded-full"
                                [class.bg-green-500]="item.estado === 'activo' || item.estado === 'activa'"
                                [class.bg-red-500]="item.estado === 'inactivo'"
                                [class.bg-yellow-500]="item.estado === 'suspendido'">
                              </span>
                              {{ item.estado }}
                            </span>
                          }
                        }

                        @case ('observacion') {
                          @if (item.observacion) {
                            <span class="text-sm text-gray-600 line-clamp-1 max-w-[150px]
                                          border-b border-dashed border-gray-300 cursor-help"
                              [title]="item.observacion">
                              {{ item.observacion }}
                            </span>
                          } @else {
                            <span class="text-xs text-gray-300">—</span>
                          }
                        }

                        @case ('avance') {
                          @if (item.id_practica) {
                            <div class="flex items-center gap-2 min-w-[80px]">
                              <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-500"
                                  [style.width.%]="avanceValor(item.avance)"
                                  [style.background-color]="avanceColor(item.avance)">
                                </div>
                              </div>
                              <span class="text-xs font-medium text-gray-500 min-w-[30px]">
                                {{ avanceValor(item.avance) }}%
                              </span>
                            </div>
                          } @else {
                            <span class="text-xs text-gray-300">—</span>
                          }
                        }

                        @case ('actions') {
                          <div class="flex items-center gap-1">

                            <!-- Ver seguimientos -->
                            <button (click)="abrirSeguimientos(item)" title="Ver seguimientos"
                              class="p-1.5 rounded-lg text-gray-400 hover:text-blue-500
                                     hover:bg-blue-50 transition-all duration-150">
                              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                              </svg>
                            </button>

                            <!-- Observación -->
                            @if (item.id_practica) {
                              <button (click)="abrirObservacion(item)" title="Realizar observación"
                                class="p-1.5 rounded-lg text-gray-400 hover:text-[#39A900]
                                       hover:bg-[#39A900]/10 transition-all duration-150">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            } @else {
                              <button disabled title="Sin etapa práctica"
                                class="p-1.5 rounded-lg text-gray-200 cursor-not-allowed">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            }

                            <!-- Crear práctica -->
                            @if (!item.id_practica) {
                              <button (click)="abrirCrearPractica(item)" title="Crear etapa práctica"
                                class="p-1.5 rounded-lg text-gray-400 hover:text-[#39A900]
                                       hover:bg-[#39A900]/10 transition-all duration-150">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="12" y1="8" x2="12" y2="16"/>
                                  <line x1="8" y1="12" x2="16" y2="12"/>
                                </svg>
                              </button>
                            } @else {
                              <button disabled title="Ya tiene etapa práctica"
                                class="p-1.5 rounded-lg text-gray-200 cursor-not-allowed">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="12" y1="8" x2="12" y2="16"/>
                                  <line x1="8" y1="12" x2="16" y2="12"/>
                                </svg>
                              </button>
                            }
                          </div>
                        }

                        @default {
                          {{ item[col.uid] ?? '—' }}
                        }
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Paginación -->
      @if (pages() > 0) {
        <div class="py-3 px-6 flex justify-center gap-1 border-t border-gray-50">
          <button (click)="page() > 1 && page.set(page() - 1)"
[disabled]="page() === 1"
            class="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500
                   hover:border-[#39A900] disabled:opacity-40 transition-colors">‹</button>

          @for (p of pageRange(); track p) {
            <button (click)="page.set(p)"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors font-medium"
              [class.bg-[#39A900]]="p === page()"
              [class.text-white]="p === page()"
              [class.border-[#39A900]]="p === page()"
              [class.border-gray-200]="p !== page()"
              [class.text-gray-500]="p !== page()">
              {{ p }}
            </button>
          }

          <button (click)="page() < pages() && page.set(page() + 1)"
[disabled]="page() === pages()"
            class="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500
                   hover:border-[#39A900] disabled:opacity-40 transition-colors">›</button>
        </div>
      }
    </div>

    <!-- Modales -->
    <app-seguimientos-modal
      [isOpen]="modalSeguimientos"
      [alumno]="alumnoSeleccionado"
      (closed)="modalSeguimientos = false"
      (reopened)="modalSeguimientos = true"
    />
    <app-observacion-modal
      [isOpen]="modalObservacion"
      [alumno]="alumnoObservacion"
      (closed)="modalObservacion = false"
      (success)="cargar()"
    />
    <app-crear-practica-modal
      [isOpen]="modalCrearPractica"
      [aprendices]="data()"
      [alumnoPreseleccionado]="alumnoParaPractica"
      (closed)="modalCrearPractica = false; alumnoParaPractica = null"
      (success)="cargar()"
    />
  `,
})
export class TableInfoComponent implements OnInit {
  data    = signal<any[]>([]);
  loading = signal(true);
  areas   = signal<string[]>([]);

  filterValue = signal('');
  selectedAreas = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);
  rowsPerPage = signal(5);
  page = signal(1);
  sortCol          = 'name';
  sortDir: 'asc' | 'desc' = 'asc';
  visibleCols      = new Set(INITIAL_VISIBLE);
  showColMenu      = false;
  showAreaMenu     = false;
  showStatusMenu   = false;
  allColumns       = COLUMNS;
  statusOptions    = STATUS_OPTIONS;

  // Modales
  modalSeguimientos  = false;
  modalObservacion   = false;
  modalCrearPractica = false;
  alumnoSeleccionado: any = null;
  alumnoObservacion:  any = null;
  alumnoParaPractica: any = null;

  // Computed
  filtered = computed(() => {
  let rows = this.data();

  const filter = this.filterValue();
  const areas = this.selectedAreas();
  const statuses = this.selectedStatuses();

  if (filter) {
    rows = rows.filter(r =>
      r.name?.toLowerCase().includes(filter.toLowerCase()) ||
      String(r.age ?? '').includes(filter) ||
      String(r.number ?? '').includes(filter)
    );
  }

  if (statuses.length > 0) {
    rows = rows.filter(r => statuses.includes(r.estado));
  }

  if (areas.length > 0) {
    rows = rows.filter(r => areas.includes(r.area));
  }

  return rows;
});

  pages = computed(() =>
  Math.ceil(this.filtered().length / this.rowsPerPage())
);

  paged = computed(() => {
  const start = (this.page() - 1) * this.rowsPerPage();
  const slice = this.filtered().slice(start, start + this.rowsPerPage());

  return [...slice].sort((a, b) => {
    const fa = a[this.sortCol], fb = b[this.sortCol];
    const cmp = fa < fb ? -1 : fa > fb ? 1 : 0;
    return this.sortDir === 'desc' ? -cmp : cmp;
  });
});

  headerColumns = computed(() =>
    COLUMNS.filter(c => c.uid === 'actions' || this.visibleCols.has(c.uid))
  );

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.cargar(); }

  @HostListener('document:click')
  closeMenus(): void {
    this.showColMenu    = false;
    this.showAreaMenu   = false;
    this.showStatusMenu = false;
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    try {
      const [aprendices, areasData, practicas] = await Promise.all([
        this.api.listarAprendices(),
        this.api.listarAreas(),
        this.api.listarPracticas(),
      ]);

      const practicaMap: Record<number, any> = {};
      practicas.forEach((p: any) => { practicaMap[p.fk_matricula] = p; });

      const transformados = await Promise.all(
        aprendices.map(async (persona: any) => {
          const matriculas = await this.api.listarMatriculasPorAlumno(persona.id_persona);
          const practica = matriculas
            .map((m: any) => practicaMap[m.id_matricula])
            .find((p: any) => p != null) ?? null;
          return {
            id: persona.id_persona,
            name: persona.nombre,
            age: persona.identificacion,
            email: persona.correo,
            programa: persona.programa,
            area: persona.area ?? '',
            number: persona.ficha,
            estado: persona.estado,
            startDate: practica?.fecha_inicio ? formatDate(practica.fecha_inicio) : '',
            endDate:   practica?.fecha_fin    ? formatDate(practica.fecha_fin)    : '',
            avance:      practica?.avance      ?? '',
            observacion: practica?.observacion ?? '',
            id_practica: practica?.id_etapa_practica ?? null,
            seguimientos: persona.total_seguimientos ?? 0,
          };
        })
      );

      this.data.set(transformados);
      this.areas.set(areasData.map((a: any) => a.nombre));
    } catch (e: any) {
      console.error('[TableInfo] Error:', e?.message ?? e);
    } finally {
      this.loading.set(false);
    }
  }

  // ── Helpers visuales ──────────────────────────────────────────────────────
  initials(name: string): string {
    return (name ?? '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const palette = [
      'bg-blue-100 text-blue-600',    'bg-purple-100 text-purple-600',
      'bg-orange-100 text-orange-600','bg-pink-100 text-pink-600',
      'bg-teal-100 text-teal-600',    'bg-yellow-100 text-yellow-600',
    ];
    return palette[(name?.charCodeAt(0) ?? 0) % palette.length];
  }

  avanceValor(avance: any): number { return parseInt(avance) || 0; }

  avanceColor(avance: any): string {
    const v = this.avanceValor(avance);
    return v >= 75 ? '#39A900' : v >= 40 ? '#f5a524' : v > 0 ? '#f31260' : '#e4e4e7';
  }

  statusDotColor(uid: string): string {
    const map: Record<string, string> = {
      activo: '#39A900', inactivo: '#f31260', suspendido: '#f5a524',
    };
    return map[uid] ?? '#ccc';
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  sort(col: string): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
  }

  resetPage(): void {
  this.page.set(1);
}

  toggleCol(uid: string): void {
    const s = new Set(this.visibleCols);
    s.has(uid) ? s.delete(uid) : s.add(uid);
    this.visibleCols = s;
  }

  toggleAreaMenu():   void { this.showAreaMenu   = !this.showAreaMenu;   this.showStatusMenu = false; }
  toggleStatusMenu(): void { this.showStatusMenu = !this.showStatusMenu; this.showAreaMenu   = false; }

  toggleArea(area: string): void {
  const current = this.selectedAreas();

  if (current.includes(area)) {
    this.selectedAreas.set(current.filter(a => a !== area));
  } else {
    this.selectedAreas.set([...current, area]);
  }

  this.resetPage();
}

toggleStatus(uid: string): void {
  const current = this.selectedStatuses();

  if (current.includes(uid)) {
    this.selectedStatuses.set(current.filter(s => s !== uid));
  } else {
    this.selectedStatuses.set([...current, uid]);
  }

  this.resetPage();
}
pageRange(): number[] {
  const total = this.pages();
  const page = this.page();
  const range: number[] = [];

  const start = Math.max(1, page - 2);
  const end   = Math.min(total, page + 2);

  for (let i = start; i <= end; i++) range.push(i);

  return range;
}

  abrirSeguimientos(item: any):  void { this.alumnoSeleccionado = item; this.modalSeguimientos  = true; }
  abrirObservacion(item: any):   void { this.alumnoObservacion  = item; this.modalObservacion   = true; }
  abrirCrearPractica(item: any): void { this.alumnoParaPractica = item; this.modalCrearPractica = true; }
}
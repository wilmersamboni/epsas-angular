import {
  Component, inject, signal, computed,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HistorialService } from '../../core/services/historial.service';
import { ResultadoConsulta } from '../../shared/models/estudiante.model';
import {
  debounceTime, Subject, switchMap, catchError, of, tap,
} from 'rxjs';

type Estado = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <section class="flex flex-col items-center gap-8 py-8 w-full">

      <h1 class="text-4xl font-bold text-gray-800">Historial del aprendiz</h1>

      <!-- ── Buscador con autocomplete ── -->
      <div class="w-full max-w-lg relative" (click)="$event.stopPropagation()">

        <!-- Input -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input
            type="text"
            [ngModel]="query()"
            (ngModelChange)="onQueryChange($event)"
            (focus)="onFocus()"
            placeholder="Ingrese el número de documento (cédula)"
            autocomplete="off"
            class="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-gray-200 text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
                   shadow-sm transition-colors"
            [class.rounded-b-none]="mostrarSugerencias() && sugerencias().length"
            [class.border-b-0]="mostrarSugerencias() && sugerencias().length"
          />

          <!-- Spinner o botón limpiar -->
          @if (estado === 'loading') {
            <div class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2
                        border-[#39A900]/30 border-t-[#39A900] rounded-full animate-spin"></div>
          } @else if (query()) {
            <button (click)="limpiar()"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400
                     hover:text-gray-600 transition-colors flex items-center justify-center">
              ×
            </button>
          }
        </div>

        <!-- Dropdown de sugerencias -->
        @if (mostrarSugerencias() && sugerencias().length) {
          <div class="absolute z-50 w-full bg-white border border-gray-200 border-t-0
                      rounded-b-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">

            @if (cargandoPersonas()) {
              <div class="flex items-center gap-2 px-4 py-3 text-xs text-gray-400">
                <div class="w-3 h-3 border-2 border-gray-200 border-t-[#39A900]
                            rounded-full animate-spin"></div>
                Cargando aprendices...
              </div>
            } @else {
              @for (p of sugerencias(); track p.idPersona ?? p.id_persona) {
                <button
                  (click)="seleccionarPersona(p)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                         hover:bg-[#39A900]/5 transition-colors border-b border-gray-50
                         last:border-b-0">
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full bg-[#39A900]/10 text-[#39A900]
                              flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {{ iniciales(p.nombre) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 truncate">{{ p.nombre }}</p>
                    <p class="text-xs text-gray-400">
                      {{ p.cedula ?? p.numeroDocumento }}
                      @if (p.programa) { · {{ p.programa }} }
                    </p>
                  </div>
                  <!-- Resaltar los dígitos que coinciden -->
                  <span class="text-xs font-mono text-[#39A900] flex-shrink-0">
                    {{ p.cedula ?? p.numeroDocumento }}
                  </span>
                </button>
              }
            }
          </div>
        }
      </div>

      <!-- ── Panel de resultados ── -->
      <div class="w-full max-w-4xl rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">

        @if (estado === 'idle') {
          <div class="flex flex-col items-center gap-3 p-12 text-center">
            <svg class="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <p class="text-gray-400 text-sm">Ingresa la cédula del aprendiz para ver su historial.</p>
          </div>
        }

        @if (estado === 'loading') {
          <div class="flex flex-col items-center gap-3 p-12">
            <div class="w-8 h-8 border-4 border-[#39A900]/20 border-t-[#39A900]
                        rounded-full animate-spin"></div>
            <p class="text-gray-400 text-sm animate-pulse">Cargando historial de "{{ query }}"…</p>
          </div>
        }

        @if (estado === 'error') {
          <div class="flex flex-col items-center gap-2 p-10 text-red-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            <p class="text-sm font-medium">No se encontró ningún aprendiz con ese documento.</p>
          </div>
        }

        @if (estado === 'success' && resultado) {

          <!-- Datos personales -->
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-[#39A900]/10 flex items-center justify-center
                          text-[#39A900] font-semibold text-lg">
                {{ iniciales(resultado.estudiante.nombre + ' ' + resultado.estudiante.apellido) }}
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-800">
                  {{ resultado.estudiante.nombre }} {{ resultado.estudiante.apellido }}
                </h2>
                <p class="text-sm text-gray-500">{{ resultado.estudiante.programa }}</p>
              </div>
              <span class="ml-auto text-xs font-medium px-3 py-1 rounded-full"
                [ngClass]="{
                  'bg-green-100 text-green-700': resultado.estudiante.estado === 'Activo',
                  'bg-gray-100 text-gray-500':   resultado.estudiante.estado === 'Inactivo',
                  'bg-blue-100 text-blue-700':   resultado.estudiante.estado === 'Graduado'
                }">
                {{ resultado.estudiante.estado }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-400 text-xs mb-1">Documento</p>
                <p class="text-gray-700 font-medium">{{ resultado.estudiante.documento }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-1">Matrículas</p>
                <p class="text-gray-700 font-medium">{{ totalCursos }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-1">Email</p>
                <p class="text-gray-700 font-medium truncate">{{ resultado.estudiante.email || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-1">Teléfono</p>
                <p class="text-gray-700 font-medium">{{ resultado.estudiante.telefono || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Resumen numérico -->
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-600 mb-3">Historial académico</h3>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div class="bg-gray-50 rounded-xl p-3 text-center">
                <p class="text-2xl font-bold text-gray-800">{{ totalCursos }}</p>
                <p class="text-xs text-gray-400 mt-1">Cursos</p>
              </div>
              <div class="bg-green-50 rounded-xl p-3 text-center">
                <p class="text-2xl font-bold text-green-600">{{ totalPracticas }}</p>
                <p class="text-xs text-gray-400 mt-1">Prácticas</p>
              </div>
              <div class="bg-[#39A900]/5 rounded-xl p-3 text-center">
                <p class="text-2xl font-bold text-[#39A900]">{{ totalBitacoras }}</p>
                <p class="text-xs text-gray-400 mt-1">Bitácoras</p>
              </div>
              <div class="bg-blue-50 rounded-xl p-3 text-center">
                <p class="text-2xl font-bold text-blue-600">{{ totalObservaciones }}</p>
                <p class="text-xs text-gray-400 mt-1">Observaciones</p>
              </div>
            </div>

            @if (resultado.historial.length) {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left border-b border-gray-100">
                      <th class="text-xs text-gray-400 font-medium pb-2 pr-4">Ficha</th>
                      <th class="text-xs text-gray-400 font-medium pb-2 pr-4">Programa</th>
                      <th class="text-xs text-gray-400 font-medium pb-2 pr-4">Periodo</th>
                      <th class="text-xs text-gray-400 font-medium pb-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (curso of resultado.historial; track curso.idMatricula) {
                      <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td class="py-3 pr-4 text-gray-400 font-mono text-xs">{{ curso.idCurso || '—' }}</td>
                        <td class="py-3 pr-4 text-gray-700">{{ curso.nombreCurso }}</td>
                        <td class="py-3 pr-4 text-gray-500">{{ curso.periodo || '—' }}</td>
                        <td class="py-3 text-center">
                          <span class="text-xs font-medium px-2 py-1 rounded-full"
                            [ngClass]="{
                              'bg-green-100 text-green-700': curso.estado === 'Aprobado',
                              'bg-red-100 text-red-600':     curso.estado === 'Reprobado',
                              'bg-blue-100 text-blue-600':   curso.estado === 'En curso'
                            }">
                            {{ curso.estado }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-sm text-gray-400 italic">Sin matrículas registradas.</p>
            }
          </div>

          <!-- Etapa práctica -->
          <div class="p-6">
            <h3 class="text-sm font-semibold text-gray-600 mb-3">Etapa práctica</h3>

            @if (resultado.practicas.length) {
              @for (p of resultado.practicas; track p.id) {
                <div class="rounded-xl border border-gray-100 p-4 mb-4 bg-gray-50/50">

                  <!-- Cabecera -->
                  <div class="flex flex-wrap items-center gap-3 mb-3">
                    <span class="text-sm font-semibold text-gray-800">
                      {{ p.programa || 'Programa sin nombre' }}
                    </span>
                    <span class="text-xs text-gray-400 font-mono">{{ p.fichaCurso }}</span>
                    <span class="ml-auto text-xs font-medium px-2 py-1 rounded-full
                                 bg-[#39A900]/10 text-[#39A900]">
                      {{ p.estado || 'sin estado' }}
                    </span>
                  </div>

                  <!-- Datos básicos -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mb-3">
                    <div>
                      <p class="text-gray-400">Inicio</p>
                      <p>{{ p.fechaInicio | date:'mediumDate' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400">Fin</p>
                      <p>{{ p.fechaFin | date:'mediumDate' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400">Empresa</p>
                      <p>{{ p.empresa || '—' }}</p>
                    </div>
                    <div>
                      <p class="text-gray-400">Modalidad</p>
                      <p>{{ p.modalidad || '—' }}</p>
                    </div>
                  </div>

                  @if (p.observacion) {
                    <p class="text-xs text-gray-500 italic mb-3">{{ p.observacion }}</p>
                  }

                  <!-- Instructores asignados -->
                  @if (p.asignaciones.length) {
                    <div class="mb-3">
                      <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Instructores asignados
                      </p>
                      <div class="flex flex-wrap gap-2">
                        @for (a of p.asignaciones; track a.id) {
                          <div class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs">
                            <div class="flex items-center gap-2 mb-0.5">
                              <span class="w-2 h-2 rounded-full flex-shrink-0"
                                [class.bg-green-400]="a.estado === 'activo'"
                                [class.bg-gray-300]="a.estado !== 'activo'"></span>
                              <span class="font-medium text-gray-700 capitalize">{{ a.estado }}</span>
                              <span class="text-gray-400">· {{ a.horas }}h asignadas</span>
                            </div>
                            <p class="text-gray-400">
                              {{ a.fechaInicio | date:'shortDate' }} →
                              {{ a.fechaFin   | date:'shortDate' }}
                            </p>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Seguimientos -->
                  @if (p.seguimientos.length) {
                    <div class="space-y-2">
                      @for (s of p.seguimientos; track s.id; let i = $index) {
                        <div class="bg-white border border-gray-100 rounded-lg p-3">

                          <!-- Encabezado del seguimiento -->
                          <div class="flex items-center gap-2 mb-1.5">
                            <span class="text-xs font-semibold text-gray-700">
                              Seguimiento #{{ i + 1 }}
                            </span>
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              {{ s.estado }}
                            </span>
                            @if (s.actasPdf) {
                              <span class="text-[10px] px-2 py-0.5 rounded-full
                                           bg-green-50 text-green-600">📎 Acta</span>
                            }
                            <span class="ml-auto text-[11px] text-gray-400">
                              {{ s.fechaInicio | date:'shortDate' }} →
                              {{ s.fechaFin    | date:'shortDate' }}
                            </span>
                          </div>

                          @if (s.observacion) {
                            <p class="text-[11px] text-gray-500 mb-2 italic">{{ s.observacion }}</p>
                          }

                          <!-- Bitácoras -->
                          @if (s.bitacoras.length) {
                            <div class="mb-2">
                              <p class="text-[10px] font-semibold text-gray-400 uppercase
                                        tracking-wide mb-1">
                                Bitácoras ({{ s.bitacoras.length }})
                              </p>
                              <ul class="text-[11px] text-gray-600 list-disc pl-4 space-y-0.5">
                                @for (b of s.bitacoras; track b.id) {
                                  <li>
                                    {{ b.fecha | date:'shortDate' }} —
                                    <span class="font-medium"
                                      [class.text-green-600]="b.estado === 'aceptada'"
                                      [class.text-yellow-600]="b.estado === 'pendiente'"
                                      [class.text-red-500]="b.estado === 'rechazada'">
                                      {{ b.estado }}
                                    </span>
                                    @if (b.pdf) { <span class="text-gray-400"> · PDF</span> }
                                  </li>
                                }
                              </ul>
                            </div>
                          } @else {
                            <p class="text-[11px] text-gray-400 italic mb-2">Sin bitácoras.</p>
                          }

                          <!-- Observaciones del seguimiento -->
                          @if (s.observaciones.length) {
                            <div class="border-t border-gray-50 pt-2 mt-1">
                              <p class="text-[10px] font-semibold text-gray-400 uppercase
                                        tracking-wide mb-1">
                                Observaciones ({{ s.observaciones.length }})
                              </p>
                              <div class="space-y-1.5">
                                @for (obs of s.observaciones; track obs.id) {
                                  <div class="bg-gray-50 rounded-lg px-3 py-2">
                                    <p class="text-[10px] text-gray-400 mb-0.5">
                                      {{ obs.fecha | date:'mediumDate' }}
                                    </p>
                                    <p class="text-[11px] text-gray-700 leading-snug">
                                      {{ obs.descripcion }}
                                    </p>
                                  </div>
                                }
                              </div>
                            </div>
                          }

                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-xs text-gray-400 italic">Sin seguimientos.</p>
                  }
                </div>
              }
            } @else {
              <p class="text-sm text-gray-400 italic">
                El aprendiz no tiene etapa práctica registrada.
              </p>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class HistorialComponent {
  private svc = inject(HistorialService);


  
  query = signal('');
  estado: Estado = 'idle';
  resultado: ResultadoConsulta | null = null;

  // ── Autocomplete ────────────────────────────────────────────────────────
  personas         = signal<any[]>([]);
  cargandoPersonas = signal(false);
  mostrarSugerencias = signal(false);
  private personasCargadas = false;

  sugerencias = computed(() => {
  const q = this.query().trim(); // 👈 ahora es signal

  if (!q || !this.personasCargadas) return [];

  return this.personas()
    .filter((p: any) => {
      const doc = String(p.cedula ?? p.numeroDocumento ?? '').trim();
      return doc.startsWith(q);
    })
    .slice(0, 8);
    
});

  // Cierra el dropdown si el click viene de fuera
  @HostListener('document:click')
  onDocumentClick() { this.mostrarSugerencias.set(false); }

  // ── Búsqueda historial ───────────────────────────────────────────────────
  private buscar$ = new Subject<string>();

  constructor() {
    this.buscar$.pipe(
      tap(() => { this.estado = 'loading'; this.resultado = null; }),
      debounceTime(400),
      switchMap(doc =>
        this.svc.consultar(doc).pipe(catchError(() => of(null)))
      ),
    ).subscribe(res => {
      this.resultado = res;
      this.estado    = res ? 'success' : 'error';
    });
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  onQueryChange(valor: string): void {
  const q = valor.trim();

  this.query.set(valor); // 👈 actualizar signal
  this.cargarPersonasLazy();

  if (!q) {
    this.estado = 'idle';
    this.resultado = null;
    this.mostrarSugerencias.set(false);
    return;
  }

  this.mostrarSugerencias.set(true);
}

  onFocus(): void {
  if (this.query().trim()) this.mostrarSugerencias.set(true);
  this.cargarPersonasLazy();
}

  seleccionarPersona(p: any): void {
  const cedula = String(p.cedula ?? p.numeroDocumento ?? '');
  this.query.set(cedula); // ✅
  this.mostrarSugerencias.set(false);
  this.buscar$.next(cedula);
}

  limpiar(): void {
  this.query.set(''); // ✅
  this.estado  = 'idle';
  this.resultado = null;
  this.mostrarSugerencias.set(false);
}

  private cargarPersonasLazy(): void {
    if (this.personasCargadas) return;
    this.cargandoPersonas.set(true);
    this.svc.listarActivos().subscribe({
      next: (lista) => {
  console.log('TOTAL PERSONAS:', lista.length);
  console.log(lista);
  this.personas.set(lista);
  this.personasCargadas = true;
  this.cargandoPersonas.set(false);
},
      error: () => this.cargandoPersonas.set(false),
    });
  }

  // ── Computed helpers ──────────────────────────────────────────────────────
  iniciales(nombre: string): string {
    return (nombre ?? '').split(/\s+/).slice(0, 2)
      .map(n => n[0] ?? '').join('').toUpperCase() || '?';
  }

  get totalCursos():      number { return this.resultado?.historial.length ?? 0; }
  get totalPracticas():   number { return this.resultado?.practicas.length ?? 0; }

  get totalBitacoras(): number {
    return (this.resultado?.practicas ?? []).reduce(
      (acc, p) => acc + p.seguimientos.reduce((a, s) => a + s.bitacoras.length, 0), 0,
    );
  }

  get totalObservaciones(): number {
    return (this.resultado?.practicas ?? []).reduce(
      (acc, p) => acc + p.seguimientos.reduce((a, s) => a + s.observaciones.length, 0), 0,
    );
  }

  
}

import {
  Component, inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  debounceTime, Subject, switchMap, catchError, of, tap,
} from 'rxjs';
import { HistorialService } from '../../core/services/historial.service';
import { PracticaService } from '../../core/services/practica.service';
import { EtapaPracticaItem, ResultadoConsulta } from '../../shared/models/estudiante.model';
import { HistorialBuscadorComponent } from './components/historial-buscador.component';
import { EtapaPracticaCardComponent } from './components/etapa-practica-card.component';

type Estado = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, HistorialBuscadorComponent, EtapaPracticaCardComponent],
  template: `
    <section class="flex flex-col items-center gap-8 py-8 w-full">

      <h1 class="text-4xl font-bold text-gray-800">Historial del aprendiz</h1>

      <!-- Buscador con autocomplete delegado al subcomponente -->
      <app-historial-buscador
        class="w-full max-w-2xl"
        [personas]="personas()"
        [cargandoPersonas]="cargandoPersonas()"
        [buscando]="estado === 'loading'"
        (inicioBusqueda)="cargarPersonasLazy()"
        (seleccionar)="seleccionarPersona($event)"
        (limpiar)="limpiar()"
      />

      <!-- Panel de resultados -->
      <div class="w-full max-w-4xl rounded-xl bg-white border border-gray-100
                  shadow-sm overflow-hidden">

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
            <p class="text-gray-400 text-sm animate-pulse">Cargando historial...</p>
          </div>
        }

        @if (estado === 'error') {
          <div class="flex flex-col items-center gap-2 p-10 text-red-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0
                   2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697
                   16.126zM12 15.75h.007v.008H12v-.008z"/>
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
                <p class="text-gray-400 text-xs mb-1">Matriculas</p>
                <p class="text-gray-700 font-medium">{{ totalCursos }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-1">Email</p>
                <p class="text-gray-700 font-medium truncate">{{ resultado.estudiante.email || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-1">Telefono</p>
                <p class="text-gray-700 font-medium">{{ resultado.estudiante.telefono || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Resumen numerico -->
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-600 mb-3">Historial academico</h3>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div class="bg-gray-50 rounded-xl p-3 text-center">
                <p class="text-2xl font-bold text-gray-800">{{ totalCursos }}</p>
                <p class="text-xs text-gray-400 mt-1">Cursos</p>
              </div>
              <div class="bg-green-50 rounded-xl p-3 text-center">
                <p class="text-2xl font-bold text-green-600">{{ totalPracticas }}</p>
                <p class="text-xs text-gray-400 mt-1">Practicas</p>
              </div>
              <div class="bg-[#39A900]/5 rounded-xl p-3 text-center">
                <p class="text-2xl font-bold text-[#39A900]">{{ totalBitacoras }}</p>
                <p class="text-xs text-gray-400 mt-1">Bitacoras</p>
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
                        <td class="py-3 pr-4 text-gray-400 font-mono text-xs">
                          {{ curso.idCurso || '—' }}
                        </td>
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
              <p class="text-sm text-gray-400 italic">Sin matriculas registradas.</p>
            }
          </div>

          <!-- Etapas practicas -->
          <div class="p-6">
            <h3 class="text-sm font-semibold text-gray-600 mb-3">Etapa practica</h3>

            @if (resultado.practicas.length) {
              @for (p of resultado.practicas; track p.id) {
                <app-etapa-practica-card
                  [practica]="p"
                  [docs]="docsMap()[p.id] ?? []"
                  [cargandoDocs]="cargandoDocs()"
                />
              }
            } @else {
              <p class="text-sm text-gray-400 italic">
                El aprendiz no tiene etapa practica registrada.
              </p>
            }
          </div>

        }
      </div>
    </section>
  `,
})
export class HistorialComponent {
  private svc        = inject(HistorialService);
  private practicaSvc = inject(PracticaService);

  // ── Estado ────────────────────────────────────────────────────────────────
  estado: Estado                      = 'idle';
  resultado: ResultadoConsulta | null = null;
  docsMap      = signal<Record<string, any[]>>({});
  cargandoDocs = signal(false);

  // ── Autocomplete ──────────────────────────────────────────────────────────
  personas          = signal<any[]>([]);
  cargandoPersonas  = signal(false);
  private personasCargadas = false;

  // ── Búsqueda historial ────────────────────────────────────────────────────
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
      if (res) this.cargarDocumentos(res.practicas);
    });
  }

  // ── Handlers públicos (usados desde el buscador via outputs) ──────────────
  seleccionarPersona(p: any): void {
    const cedula = String(p.cedula ?? p.numeroDocumento ?? '');
    this.cargarPersonasLazy();
    this.buscar$.next(cedula);
  }

  limpiar(): void {
    this.estado   = 'idle';
    this.resultado = null;
    this.docsMap.set({});
  }

  cargarPersonasLazy(): void {
    if (this.personasCargadas) return;
    this.cargandoPersonas.set(true);
    this.svc.listarActivos().subscribe({
      next: (lista) => {
        this.personas.set(lista);
        this.personasCargadas = true;
        this.cargandoPersonas.set(false);
      },
      error: () => this.cargandoPersonas.set(false),
    });
  }

  // ── Documentos ────────────────────────────────────────────────────────────
  private async cargarDocumentos(practicas: EtapaPracticaItem[]): Promise<void> {
    if (!practicas.length) return;
    this.cargandoDocs.set(true);
    try {
      const pares = await Promise.all(
        practicas.map(async p => {
          const docs = await this.practicaSvc.listarDocumentos(p.id);
          return [p.id, docs] as [string, any[]];
        })
      );
      this.docsMap.set(Object.fromEntries(pares));
    } finally {
      this.cargandoDocs.set(false);
    }
  }

  // ── Computed helpers ──────────────────────────────────────────────────────
  iniciales(nombre: string): string {
    return (nombre ?? '').split(/\s+/).slice(0, 2)
      .map(n => n[0] ?? '').join('').toUpperCase() || '?';
  }

  get totalCursos():    number { return this.resultado?.historial.length ?? 0; }
  get totalPracticas(): number { return this.resultado?.practicas.length ?? 0; }

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

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HistorialService } from '../../core/services/historial.service';
import {
  ResultadoConsulta,
  HistorialAcademico,
  EtapaPracticaItem,
} from '../../shared/models/estudiante.model';
import { debounceTime, Subject, switchMap, catchError, of, tap } from 'rxjs';

type Estado = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <section class="flex flex-col items-center gap-8 py-8 w-full">

      <h1 class="text-4xl font-bold text-gray-800">Historial del aprendiz</h1>

      <!-- Buscador -->
      <div class="w-full max-w-md relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          type="text"
          [(ngModel)]="query"
          (ngModelChange)="onQueryChange($event)"
          placeholder="INGRESE EL NÚMERO DE DOCUMENTO (CÉDULA)"
          class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm
                 focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
                 shadow-sm transition-colors"
        />
        <!-- Spinner dentro del input -->
        @if (estado === 'loading') {
          <div class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2
                      border-[#39A900]/30 border-t-[#39A900] rounded-full animate-spin"></div>
        }
      </div>

      <!-- Panel de resultados -->
      <div class="w-full max-w-4xl rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">

        @if (estado === 'idle') {
          <p class="text-gray-400 text-center text-sm p-8">
            Ingresa la cédula del aprendiz para ver su historial.
          </p>
        }

        @if (estado === 'loading') {
          <p class="text-gray-400 text-center text-sm p-8 animate-pulse">
            Buscando "{{ query }}"...
          </p>
        }

        @if (estado === 'error') {
          <div class="flex flex-col items-center gap-2 p-8 text-red-500">
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
                {{ iniciales }}
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

          <!-- Historial académico -->
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-600 mb-3">Historial académico</h3>

            <div class="grid grid-cols-3 gap-3 mb-5">
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
                  <div class="flex flex-wrap items-center gap-3 mb-3">
                    <span class="text-sm font-semibold text-gray-800">
                      {{ p.programa || 'Programa sin nombre' }}
                    </span>
                    <span class="text-xs text-gray-400 font-mono">{{ p.fichaCurso }}</span>
                    <span class="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-[#39A900]/10 text-[#39A900]">
                      {{ p.estado || 'sin estado' }}
                    </span>
                  </div>

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

                  @if (p.seguimientos.length) {
                    <div class="mt-2 space-y-2">
                      @for (s of p.seguimientos; track s.id) {
                        <div class="bg-white border border-gray-100 rounded-lg p-3">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-semibold text-gray-700">Seguimiento</span>
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              {{ s.estado }}
                            </span>
                            <span class="ml-auto text-[11px] text-gray-400">
                              {{ s.fechaInicio | date:'shortDate' }} → {{ s.fechaFin | date:'shortDate' }}
                            </span>
                          </div>
                          @if (s.observacion) {
                            <p class="text-[11px] text-gray-500 mb-2">{{ s.observacion }}</p>
                          }
                          @if (s.bitacoras.length) {
                            <ul class="text-[11px] text-gray-600 list-disc pl-4">
                              @for (b of s.bitacoras; track b.id) {
                                <li>
                                  {{ b.fecha | date:'shortDate' }} — <span class="font-medium">{{ b.estado }}</span>
                                </li>
                              }
                            </ul>
                          } @else {
                            <p class="text-[11px] text-gray-400 italic">Sin bitácoras.</p>
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
              <p class="text-sm text-gray-400 italic">El aprendiz no tiene etapa práctica registrada.</p>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class HistorialComponent {
  private svc = inject(HistorialService);

  query = '';
  estado: Estado = 'idle';
  resultado: ResultadoConsulta | null = null;

  private buscar$ = new Subject<string>();

  constructor() {
    this.buscar$.pipe(
      tap(() => { this.estado = 'loading'; this.resultado = null; }),
      debounceTime(500),
      switchMap(doc =>
        this.svc.consultar(doc).pipe(
          catchError(() => of(null))
        )
      ),
    ).subscribe(res => {
      if (res) {
        this.resultado = res;
        this.estado = 'success';
      } else {
        this.estado = 'error';
      }
    });
  }

  onQueryChange(valor: string) {
    const limpio = valor.trim();
    if (!limpio) { this.estado = 'idle'; return; }
    this.buscar$.next(limpio);
  }

  // ── Computed helpers ────────────────────────────────────────────────────
  get iniciales(): string {
    const e = this.resultado?.estudiante;
    if (!e) return '';
    const n = (e.nombre ?? '')[0] ?? '';
    const a = (e.apellido ?? '')[0] ?? '';
    return `${n}${a}`.toUpperCase() || '?';
  }

  get totalCursos(): number {
    return this.resultado?.historial.length ?? 0;
  }

  get totalPracticas(): number {
    return this.resultado?.practicas.length ?? 0;
  }

  get totalBitacoras(): number {
    return (this.resultado?.practicas ?? []).reduce(
      (acc, p) => acc + p.seguimientos.reduce((a, s) => a + s.bitacoras.length, 0),
      0,
    );
  }
}

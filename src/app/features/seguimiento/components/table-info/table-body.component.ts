// ─────────────────────────────────────────────────────────────────────────────
// table-body.component.ts  — <tbody> con todas las celdas
// ─────────────────────────────────────────────────────────────────────────────
import { Component, input, output, inject } from '@angular/core';
import {
  Column, Aprendiz,
  initials, avatarColor, avanceValor, avanceColor,
  ColumnUid,
} from './table-info.types';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-table-body',
  standalone: true,
  host: {
    style: 'display: contents'
  },
  template: `
    <tbody>
      @if (rows().length === 0) {
        <tr>
          <td [attr.colspan]="columns().length"
            class="text-center text-gray-400 py-10 text-sm">
            No hay registros
          </td>
        </tr>
      }

      @for (item of rows(); track item.id; let odd = $odd) {
        <tr class="transition-colors duration-150 hover:bg-[#39A900]/5"
          [class.bg-white]="!odd"
          [class.bg-[#F8FFFE]]="odd">

          @for (col of columns(); track col.uid) {
            <td class="py-3 px-4 border-b border-gray-50 text-gray-700 text-sm">

              @switch (col.uid) {

                <!-- ── Nombre + avatar ── -->
                @case ('name') {
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center
                                 text-xs font-bold flex-shrink-0"
                      [class]="avatarCls(item.name)">
                      {{ getInitials(item.name) }}
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-800">{{ item.name }}</span>
                      <span class="text-xs text-gray-400">{{ item.email }}</span>
                    </div>
                  </div>
                }

                <!-- ── Estado ── -->
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
                      [class.bg-green-100]="isActivo(item.estado)"
                      [class.text-green-700]="isActivo(item.estado)"
                      [class.bg-red-100]="item.estado === 'inactivo'"
                      [class.text-red-600]="item.estado === 'inactivo'"
                      [class.bg-yellow-100]="item.estado === 'suspendido'"
                      [class.text-yellow-700]="item.estado === 'suspendido'">
                      <span class="w-1.5 h-1.5 rounded-full"
                        [class.bg-green-500]="isActivo(item.estado)"
                        [class.bg-red-500]="item.estado === 'inactivo'"
                        [class.bg-yellow-500]="item.estado === 'suspendido'">
                      </span>
                      {{ item.estado }}
                    </span>
                  }
                }

                <!-- ── Observación ── -->
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

                <!-- ── Avance ── -->
                @case ('avance') {
                  @if (item.id_practica) {
                    <div class="flex items-center gap-2 min-w-[80px]">
                      <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500"
                          [style.width.%]="getAvanceValor(item.avance)"
                          [style.background-color]="getAvanceColor(item.avance)">
                        </div>
                      </div>
                      <span class="text-xs font-medium text-gray-500 min-w-[30px]">
                        {{ getAvanceValor(item.avance) }}%
                      </span>
                    </div>
                  } @else {
                    <span class="text-xs text-gray-300">—</span>
                  }
                }

                <!-- ── Acciones ── -->
                @case ('actions') {
                  <div class="flex items-center gap-1">

                    <!-- Ver seguimientos: todos los roles -->
                    <button (click)="verSeguimientos.emit(item)" title="Ver seguimientos"
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

                    <!-- Realizar observación: solo admin e instructor -->
                    @if (canObservar()) {
                      @if (item.id_practica) {
                        <button (click)="verObservacion.emit(item)" title="Realizar observación"
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
                    }

                    <!-- Crear práctica: solo admin -->
                    @if (canCrearPractica()) {
                      @if (!item.id_practica) {
                        <button (click)="crearPractica.emit(item)" title="Crear etapa práctica"
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
                    }

                  </div>
                }

                <!-- ── Celda genérica ── -->
                @default {
                  {{ getValue(item, col.uid) }}
                }

              }
            </td>
          }
        </tr>
      }
    </tbody>
  `,
})
export class TableBodyComponent {
  private auth = inject(AuthService);

  // ── Inputs ─────────────────────────────────────────────────────────────────
  rows    = input.required<Aprendiz[]>();
  columns = input.required<Column[]>();

  // ── Outputs ────────────────────────────────────────────────────────────────
  verSeguimientos = output<Aprendiz>();
  verObservacion  = output<Aprendiz>();
  crearPractica   = output<Aprendiz>();

  // ── Permisos por rol ────────────────────────────────────────────────────────
  /** Observar: admin e instructor */
  canObservar()      { return this.auth.hasRole(['administrador', 'instructor']); }
  /** Crear práctica: solo admin */
  canCrearPractica() { return this.auth.hasRole(['administrador']); }

  // ── Delegates a helpers puros ───────────────────────────────────────────────
  getInitials    = initials;
  avatarCls      = avatarColor;
  getAvanceValor = avanceValor;
  getAvanceColor = avanceColor;

  isActivo(estado: string): boolean {
    return estado === 'activo' || estado === 'activa';
  }

  getValue(item: Aprendiz, key: ColumnUid) {
    if (key === 'actions') return '—';
    return item[key] ?? '—';
  }
}
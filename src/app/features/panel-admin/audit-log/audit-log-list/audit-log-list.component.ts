import { Component, HostListener, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiDay } from '@taiga-ui/cdk';
import { TuiCalendar } from '@taiga-ui/core';
import { AuditLogAdminService } from '../../../../core/services/admin/audit-log-admin.service';
import { TenantAdminService } from '../../../../core/services/admin/tenant-admin.service';
import { AdminToastService } from '../../../../core/admin-auth/admin-toast.service';
import { AuditAccion, AuditLog, ACCION_COLORES } from '../../../../shared/models/admin/audit-log.model';
import { Tenant } from '../../../../shared/models/admin/tenant.model';

const ACCIONES: AuditAccion[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [FormsModule, DatePipe, TuiCalendar],
  template: `
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">Registro de Auditoría</h1>
      <p class="text-sm text-gray-500 mt-1">Historial de acciones realizadas en el sistema.</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">

        <!-- Tenant -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Tenant</label>
          <select [ngModel]="filtroTenantId()" (ngModelChange)="filtroTenantId.set($event)"
            class="w-full text-sm rounded-xl border border-gray-200 outline-none px-3 py-2 focus:border-[#39A900] bg-white">
            <option value="">Todos</option>
            @for (tenant of tenants(); track tenant.id) {
              <option [value]="tenant.id">{{ tenant.nombre }}</option>
            }
          </select>
        </div>

        <!-- Desde (TuiCalendar) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Desde</label>
          <div class="relative" (click)="$event.stopPropagation()">
            <button type="button" (click)="toggleCal('desde')"
              class="w-full flex items-center gap-2 text-sm rounded-xl border border-gray-200 outline-none px-3 py-2 hover:border-[#39A900] transition-colors bg-white text-left"
              [class.border-[#39A900]]="calAbierto() === 'desde'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 flex-shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <span [class.text-gray-400]="!filtroDesde()" class="flex-1">
                {{ filtroDesde() ? tuiDayToLabel(filtroDesde()!) : 'Seleccionar' }}
              </span>
              @if (filtroDesde()) {
                <span (click)="limpiarFecha('desde'); $event.stopPropagation()"
                  class="text-gray-300 hover:text-gray-500 cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
              }
            </button>
            @if (calAbierto() === 'desde') {
              <div class="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
                <tui-calendar [value]="filtroDesde()" (dayClick)="onDayClick($event, 'desde')" />
              </div>
            }
          </div>
        </div>

        <!-- Hasta (TuiCalendar) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Hasta</label>
          <div class="relative" (click)="$event.stopPropagation()">
            <button type="button" (click)="toggleCal('hasta')"
              class="w-full flex items-center gap-2 text-sm rounded-xl border border-gray-200 outline-none px-3 py-2 hover:border-[#39A900] transition-colors bg-white text-left"
              [class.border-[#39A900]]="calAbierto() === 'hasta'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 flex-shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <span [class.text-gray-400]="!filtroHasta()" class="flex-1">
                {{ filtroHasta() ? tuiDayToLabel(filtroHasta()!) : 'Seleccionar' }}
              </span>
              @if (filtroHasta()) {
                <span (click)="limpiarFecha('hasta'); $event.stopPropagation()"
                  class="text-gray-300 hover:text-gray-500 cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
              }
            </button>
            @if (calAbierto() === 'hasta') {
              <div class="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
                <tui-calendar [value]="filtroHasta()" (dayClick)="onDayClick($event, 'hasta')" />
              </div>
            }
          </div>
        </div>

        <!-- Acción -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Acción</label>
          <select [ngModel]="filtroAccion()" (ngModelChange)="filtroAccion.set($event)"
            class="w-full text-sm rounded-xl border border-gray-200 outline-none px-3 py-2 focus:border-[#39A900] bg-white">
            <option value="">Todas</option>
            @for (accion of acciones; track accion) {
              <option [value]="accion">{{ accion }}</option>
            }
          </select>
        </div>

        <!-- Botones -->
        <div class="flex gap-2">
          <button type="button" (click)="aplicarFiltros()"
            class="flex-1 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
            style="background:#39A900;">Filtrar</button>
          <button type="button" (click)="limpiarFiltros()"
            class="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Limpiar</button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      @if (cargando()) {
        <div class="flex flex-col items-center justify-center py-16">
          <svg class="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#39A900" stroke-width="3">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <p class="text-sm text-gray-400 mt-3">Cargando registros...</p>
        </div>
      } @else if (logs().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <p class="text-sm">No hay registros de auditoría para los filtros seleccionados.</p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 border-b border-gray-100" style="background:#fafbfc;">
                <th class="px-5 py-3 font-semibold">Fecha</th>
                <th class="px-5 py-3 font-semibold">Tenant</th>
                <th class="px-5 py-3 font-semibold">Usuario</th>
                <th class="px-5 py-3 font-semibold">Acción</th>
                <th class="px-5 py-3 font-semibold">Módulo</th>
                <th class="px-5 py-3 font-semibold">Descripción</th>
              </tr>
            </thead>
            <tbody>
              @for (log of logs(); track log.id) {
                <tr class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td class="px-5 py-3 text-gray-500 whitespace-nowrap">{{ log.fecha | date: 'medium' }}</td>
                  <td class="px-5 py-3 text-gray-700">{{ log.tenantSlug ?? '—' }}</td>
                  <td class="px-5 py-3 text-gray-700">{{ log.usuario }}</td>
                  <td class="px-5 py-3">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full" [class]="accionColores[log.accion]">{{ log.accion }}</span>
                  </td>
                  <td class="px-5 py-3 text-gray-500">{{ log.modulo }}</td>
                  <td class="px-5 py-3 text-gray-500">{{ log.descripcion ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {{ logs().length }} registro(s) encontrado(s)
        </div>
      }
    </div>
  `,
})
export class AuditLogListComponent {
  private readonly auditLogService = inject(AuditLogAdminService);
  private readonly tenantService   = inject(TenantAdminService);
  private readonly toast           = inject(AdminToastService);

  readonly acciones      = ACCIONES;
  readonly accionColores = ACCION_COLORES;
  readonly logs          = signal<AuditLog[]>([]);
  readonly tenants       = signal<Tenant[]>([]);
  readonly cargando      = signal(true);

  readonly filtroTenantId = signal('');
  readonly filtroDesde    = signal<TuiDay | null>(null);
  readonly filtroHasta    = signal<TuiDay | null>(null);
  readonly filtroAccion   = signal<AuditAccion | ''>('');
  readonly calAbierto     = signal<'desde' | 'hasta' | null>(null);

  constructor() {
    this.tenantService.obtenerTodos().subscribe({ next: (t) => this.tenants.set(t) });
    this.cargarLogs();
  }

  @HostListener('document:click')
  cerrarCalendario(): void {
    this.calAbierto.set(null);
  }

  toggleCal(cual: 'desde' | 'hasta'): void {
    this.calAbierto.update((v) => (v === cual ? null : cual));
  }

  limpiarFecha(cual: 'desde' | 'hasta'): void {
    if (cual === 'desde') this.filtroDesde.set(null);
    else this.filtroHasta.set(null);
  }

  onDayClick(day: TuiDay, cual: 'desde' | 'hasta'): void {
    if (cual === 'desde') this.filtroDesde.set(day);
    else this.filtroHasta.set(day);
    this.calAbierto.set(null);
  }

  tuiDayToLabel(day: TuiDay): string {
    const m = String(day.month + 1).padStart(2, '0');
    const d = String(day.day).padStart(2, '0');
    return `${d}/${m}/${day.year}`;
  }

  private tuiDayToISO(day: TuiDay | null): string | undefined {
    if (!day) return undefined;
    const m = String(day.month + 1).padStart(2, '0');
    const d = String(day.day).padStart(2, '0');
    return `${day.year}-${m}-${d}`;
  }

  aplicarFiltros(): void { this.cargarLogs(); }

  limpiarFiltros(): void {
    this.filtroTenantId.set('');
    this.filtroDesde.set(null);
    this.filtroHasta.set(null);
    this.filtroAccion.set('');
    this.calAbierto.set(null);
    this.cargarLogs();
  }

  private cargarLogs(): void {
    this.cargando.set(true);
    this.auditLogService.obtenerLogs({
      tenantId: this.filtroTenantId() || undefined,
      desde:    this.tuiDayToISO(this.filtroDesde()),
      hasta:    this.tuiDayToISO(this.filtroHasta()),
      accion:   this.filtroAccion() || undefined,
    }).subscribe({
      next: (logs) => { this.logs.set(logs); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.toast.error('No se pudieron cargar los registros de auditoría.'); },
    });
  }
}

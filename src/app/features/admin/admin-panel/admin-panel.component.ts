import { Component, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CONFIG, MODULOS, MODULOS_EPSAS, MODULOS_PRACTICA, MODULOS_ADMIN } from '../config/admin.config';
import { AdminService } from '../services/admin.service';
import { AdminTableComponent } from '../components/admin-table.component';
import { AdminModalComponent } from '../components/admin-modal.component';
import { RegistroRapidoModalComponent } from '../components/registro-rapido-modal.component';
import { ConfiguracionAdminComponent } from '../components/configuracion-admin.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    AdminTableComponent,
    AdminModalComponent,
    RegistroRapidoModalComponent,
    ConfiguracionAdminComponent,
  ],
  providers: [MessageService, ConfirmationService, AdminService],
  template: `
    <p-toast position="top-right" [baseZIndex]="9999" />
    <p-confirmdialog />

    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 lg:p-8">
      <div class="max-w-7xl mx-auto space-y-6">

        <!-- ── Header ── -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39A900] to-[#2d8500]
                      flex items-center justify-center shadow-lg shadow-[#39A900]/20">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
            <p class="text-sm text-gray-500">Gestión de datos académicos y etapas prácticas</p>
          </div>
        </div>

        <!-- ── REGISTRO RÁPIDO (ambos tipos de admin) ── -->
        @if (auth.isAdmin()) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-4 h-4 text-[#39A900]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <h2 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Registro Rápido</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Card Instructor -->
            <button (click)="abrirWizard('instructor')"
              class="group relative flex items-center gap-4 p-5 rounded-xl border-2 border-blue-100
                     hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left overflow-hidden">
              <div class="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200
                          flex items-center justify-center flex-shrink-0 transition-colors">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 14l6.16-3.422A12.08 12.08 0 0121 15c0 4.418-4.03 8-9 8s-9-3.582-9-8c0-1.348.29-2.63.84-3.778L12 14z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                  Nuevo Instructor
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  Crea persona, usuario y credencial en un solo formulario
                </p>
              </div>
              <svg class="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors"
                fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7"/>
              </svg>
              <!-- Acento decorativo -->
              <div class="absolute top-0 right-0 w-16 h-16 bg-blue-100/40 rounded-bl-full
                          group-hover:bg-blue-200/40 transition-colors"></div>
            </button>

            <!-- Card Aprendiz -->
            <button (click)="abrirWizard('aprendiz')"
              class="group relative flex items-center gap-4 p-5 rounded-xl border-2 border-emerald-100
                     hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 text-left overflow-hidden">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-200
                          flex items-center justify-center flex-shrink-0 transition-colors">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                  Nuevo Aprendiz
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  Crea persona, usuario y credencial en un solo formulario
                </p>
              </div>
              <svg class="w-4 h-4 text-gray-300 group-hover:text-emerald-400 flex-shrink-0 transition-colors"
                fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7"/>
              </svg>
              <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-100/40 rounded-bl-full
                          group-hover:bg-emerald-200/40 transition-colors"></div>
            </button>

          </div>
        </div>
        } <!-- /Registro Rápido -->

        <!-- ── CONFIGURACIÓN GLOBAL ── -->
        <app-configuracion-admin />

        <!-- ── GESTIÓN DE TABLAS ── -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">

          <!-- ── Barra de vista: ERP / Prácticas (solo administrador_erp) ── -->
          @if (auth.isAdminErp()) {
            <div class="px-6 pt-5 pb-4 border-b border-gray-100 bg-gray-50/60">
              <div class="inline-flex items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-1 gap-1">

                <!-- Botón ERP -->
                <button (click)="setVista('epsas')"
                  class="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  [class]="vista() === 'epsas'
                    ? 'bg-[#39A900] text-white shadow-md shadow-[#39A900]/25'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  ERP
                </button>

                <!-- Botón Prácticas -->
                <button (click)="setVista('practica')"
                  class="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  [class]="vista() === 'practica'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Prácticas
                </button>

              </div>
            </div>
          }

          <!-- ── Pestañas del grupo activo ── -->
          <div class="px-2 pt-3 pb-0 border-b border-gray-200/80 flex items-end gap-1">

            <!-- Flecha izquierda -->
            <button (click)="scrollTabs(-200)"
              class="flex-shrink-0 w-7 h-8 flex items-center justify-center rounded-lg
                     text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors mb-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <!-- Carril de tabs con scroll -->
            <div #tabsEl class="flex gap-1 overflow-x-auto pb-px flex-1" style="scrollbar-width:none">
              @for (mod of modulosVista(); track mod) {
                <button (click)="admin.activeTab.set(mod)"
                  class="relative px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 rounded-t-lg"
                  [class]="admin.activeTab() === mod
                    ? (vista() === 'epsas' ? 'text-[#39A900] bg-[#39A900]/5' : 'text-indigo-600 bg-indigo-50')
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'">
                  {{ config[mod].label }}
                  @if (admin.activeTab() === mod) {
                    <div class="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      [class]="vista() === 'epsas' ? 'bg-[#39A900]' : 'bg-indigo-500'"></div>
                  }
                </button>
              }
            </div>

            <!-- Flecha derecha -->
            <button (click)="scrollTabs(200)"
              class="flex-shrink-0 w-7 h-8 flex items-center justify-center rounded-lg
                     text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors mb-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

          </div>

          <div class="p-6">

            <!-- Controles -->
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">

              <div class="flex flex-col sm:flex-row gap-3 flex-1">
                <!-- Buscador -->
                <div class="relative flex-1 max-w-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input type="text" [(ngModel)]="admin.filtro"
                    (ngModelChange)="admin.setFiltro($event)"
                    placeholder="Buscar registros..."
                    class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]
                           focus:bg-white transition-all text-gray-900 placeholder:text-gray-400" />
                  @if (admin.filtro()) {
                    <button (click)="admin.setFiltro('')"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  }
                </div>

                <!-- Filas por página -->
                <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filas</span>
                  <select [ngModel]="admin.registrosPorPagina()"
                    (ngModelChange)="admin.setRegistrosPorPagina($event)"
                    class="text-sm font-semibold bg-transparent border-none focus:ring-0 text-gray-700 cursor-pointer">
                    <option [ngValue]="10">10</option>
                    <option [ngValue]="20">20</option>
                    <option [ngValue]="50">50</option>
                    <option [ngValue]="100">100</option>
                  </select>
                </div>
              </div>

              <!-- Botón Agregar -->
              @if (config[admin.activeTab()].crear) {
                <button (click)="admin.abrirModal()"
                  class="group flex items-center gap-2 px-5 py-2 text-white text-sm font-bold rounded-xl
                         shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  [style]="vista() === 'epsas'
                    ? 'background: linear-gradient(135deg, #39A900 0%, #2d8500 100%)'
                    : 'background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'">
                  <svg class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                  Agregar {{ config[admin.activeTab()].label.slice(0,-1) }}
                </button>
              }
            </div>

            <!-- Tabla -->
            <app-admin-table
              [rows]="admin.activeData()"
              [columns]="admin.activeColumns()"
              [loading]="admin.loading()"
              [canEdit]="!!config[admin.activeTab()].actualizar"
              [canDelete]="!!config[admin.activeTab()].eliminar"
              (edit)="admin.editarFila($event)"
              (delete)="admin.eliminarFila($event)"
            />

            <!-- Paginación -->
            @if (!admin.loading() && admin.totalRegistros() > 0) {
              <div class="flex flex-col sm:flex-row items-center justify-between mt-5 gap-4
                          px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">

                <span class="text-sm text-gray-500">
                  Mostrando
                  <strong class="text-gray-800">{{ admin.activeData().length }}</strong>
                  de
                  <strong class="text-gray-800">{{ admin.totalRegistros() }}</strong>
                  registros
                </span>

                <div class="flex items-center gap-2">
                  <button (click)="admin.paginaActual.update(p => p - 1)"
                    [disabled]="admin.paginaActual() === 1"
                    class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600
                           hover:bg-[#39A900] hover:text-white hover:border-[#39A900]
                           disabled:opacity-30 disabled:pointer-events-none transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>

                  <span class="px-4 py-1.5 text-sm font-semibold text-[#39A900]
                               bg-[#39A900]/10 rounded-lg border border-[#39A900]/20">
                    {{ admin.paginaActual() }} / {{ admin.totalPaginas() }}
                  </span>

                  <button (click)="admin.paginaActual.update(p => p + 1)"
                    [disabled]="admin.paginaActual() >= admin.totalPaginas()"
                    class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600
                           hover:bg-[#39A900] hover:text-white hover:border-[#39A900]
                           disabled:opacity-30 disabled:pointer-events-none transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </div>

    <!-- ── Modal CRUD genérico ── -->
    <app-admin-modal
      [open]="admin.modalOpen()"
      [editando]="admin.editando()"
      [labelSingular]="config[admin.activeTab()].label.slice(0,-1)"
      [columns]="admin.editableColumns()"
      [form]="admin.modalForm"
      [opciones]="admin.opcionesModal"
      [tiposCampo]="config[admin.activeTab()].tiposCampo ?? {}"
      [saving]="admin.saving()"
      [error]="admin.modalError()"
      (closed)="admin.cerrarModal()"
      (saved)="onSaved($event)"
    />

    <!-- ── Wizard Registro Rápido ── -->
    <app-registro-rapido-modal
      [isOpen]="wizardOpen()"
      [cargo]="wizardCargo()"
      (closed)="wizardOpen.set(false)"
      (success)="onWizardSuccess()"
    />

    <style>
      div::-webkit-scrollbar { display: none; }
    </style>
  `,
})
export class AdminPanelComponent implements OnInit {
  modulos         = MODULOS;
  modulosEpsas    = MODULOS_EPSAS;
  modulosPractica = MODULOS_PRACTICA;
  config          = CONFIG;

  // ── Vista activa: ERP vs Prácticas ──────────────────────────
  vista = signal<'epsas' | 'practica'>('epsas');

  modulosVista = computed(() => {
    if (!this.auth.isAdminErp()) return MODULOS_ADMIN;
    return this.vista() === 'epsas' ? MODULOS_EPSAS : MODULOS_PRACTICA;
  });

  setVista(v: 'epsas' | 'practica'): void {
    this.vista.set(v);
    // Activa la primera pestaña del grupo seleccionado
    const grupo = v === 'epsas' ? MODULOS_EPSAS : MODULOS_PRACTICA;
    if (grupo.length) this.admin.activeTab.set(grupo[0]);
  }

  // ── Wizard ──────────────────────────────────────────────────
  wizardOpen  = signal(false);
  wizardCargo = signal<'instructor' | 'aprendiz'>('instructor');

  @ViewChild('tabsEl') tabsEl!: ElementRef<HTMLDivElement>;

  scrollTabs(px: number): void {
    this.tabsEl?.nativeElement?.scrollBy({ left: px, behavior: 'smooth' });
  }

  constructor(public admin: AdminService, private msg: MessageService, public auth: AuthService) {}

  ngOnInit(): void {
    if (!this.auth.isAdminErp()) {
      // administrador: vista plana (personas → prácticas), sin toggle ERP/Prácticas
      if (MODULOS_ADMIN.length) this.admin.activeTab.set(MODULOS_ADMIN[0]);
    }
    this.admin.cargarTodos();
  }

  // ── Tabla CRUD ───────────────────────────────────────────────
  onSaved(form: Record<string, any>): void {
    this.admin.modalForm = form;
    this.admin.guardar();
  }

  // ── Wizard ──────────────────────────────────────────────────
  abrirWizard(cargo: 'instructor' | 'aprendiz'): void {
    this.wizardCargo.set(cargo);
    this.wizardOpen.set(true);
  }

  onWizardSuccess(): void {
    // Recarga personas, usuarios y credenciales para reflejar el nuevo registro
    this.admin.cargar('personas');
    this.admin.cargar('usuarios');
    this.admin.cargar('credenciales');
    this.msg.add({
      severity: 'success',
      summary: '¡Registro creado!',
      detail: `El ${this.wizardCargo() === 'instructor' ? 'instructor' : 'aprendiz'} fue registrado correctamente.`,
      life: 4000,
    });
  }
}

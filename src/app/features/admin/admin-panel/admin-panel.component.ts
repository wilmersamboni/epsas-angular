import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CONFIG, MODULOS } from '../config/admin.config';
import { AdminService } from '../services/admin.service';
import { AdminTableComponent } from '../components/admin-table.component';
import { AdminModalComponent } from '../components/admin-modal.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule, ToastModule, ConfirmDialogModule, AdminTableComponent, AdminModalComponent],
  providers: [MessageService, ConfirmationService, AdminService],
  template: `
    <p-toast position="top-right" [baseZIndex]="9999" />
    <p-confirmdialog />

    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 lg:p-8">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header mejorado -->
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39A900] to-[#2d8500] flex items-center justify-center shadow-lg shadow-[#39A900]/20">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
              <p class="text-sm text-gray-500">
                Gestión de personas, matrículas, cursos y estructura académica
              </p>
            </div>
          </div>
        </div>

        <!-- Tarjeta principal con mejor diseño -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden backdrop-blur-sm">

          <!-- Tabs mejorados con scroll horizontal suave -->
          <div class="px-6 pt-6 pb-0 border-b border-gray-200/80">
            <div class="flex gap-2 overflow-x-auto pb-px scrollbar-hide">
              @for (mod of modulos; track mod) {
                <button (click)="admin.activeTab.set(mod)"
                  class="relative px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 rounded-t-lg group"
                  [class]="admin.activeTab() === mod 
                    ? 'text-[#39A900] bg-gradient-to-b from-[#39A900]/5 to-transparent' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'">
                  
                  <span class="relative z-10">{{ config[mod].label }}</span>
                  
                  <!-- Indicador activo mejorado -->
                  @if (admin.activeTab() === mod) {
                    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#39A900] to-transparent"></div>
                  }
                  
                  <!-- Hover effect -->
                  <div class="absolute inset-0 bg-gradient-to-br from-[#39A900]/0 to-[#39A900]/0 group-hover:from-[#39A900]/5 group-hover:to-transparent rounded-t-lg transition-all duration-300"></div>
                </button>
              }
            </div>
          </div>

          <div class="p-6">
            <!-- Controles mejorados con mejor espaciado y diseño -->
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
              
              <div class="flex flex-col sm:flex-row gap-3 flex-1">
                <!-- Buscador mejorado -->
                <div class="relative flex-1 max-w-md group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400 group-focus-within:text-[#39A900] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    [(ngModel)]="admin.filtro"
                    (ngModelChange)="admin.setFiltro($event)"
                    placeholder="Buscar en registros..."
                    class="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900] 
                           focus:bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  />
                  @if (admin.filtro()) {
                    <button (click)="admin.setFiltro('')" 
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  }
                </div>

                <!-- Selector de filas mejorado -->
                <div class="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filas</span>
                  <select 
                    [ngModel]="admin.registrosPorPagina()" 
                    (ngModelChange)="admin.setRegistrosPorPagina($event)"
                    class="text-sm font-semibold bg-transparent border-none focus:ring-0 text-gray-700 cursor-pointer pr-6">
                    <option [ngValue]="10">10</option>
                    <option [ngValue]="20">20</option>
                    <option [ngValue]="50">50</option>
                    <option [ngValue]="100">100</option>
                  </select>
                </div>
              </div>

              <!-- Botón de agregar mejorado -->
              @if (config[admin.activeTab()].crear) {
                <button (click)="admin.abrirModal()"
                  class="group relative flex items-center justify-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl 
                         overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#39A900]/30
                         hover:scale-[1.02] active:scale-[0.98]"
                  style="background: linear-gradient(135deg, #39A900 0%, #2d8500 100%)">
                  
                  <!-- Efecto de brillo -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  
                  <svg class="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                  <span class="relative z-10">Agregar {{ config[admin.activeTab()].label.slice(0,-1) }}</span>
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

            <!-- Paginación mejorada -->
            @if (!admin.loading() && admin.totalRegistros() > 0) {
              <div class="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 px-5 py-4 
                          bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl border border-gray-200">
                
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <div class="w-2 h-2 rounded-full bg-[#39A900] animate-pulse"></div>
                  <span>Mostrando</span>
                  <span class="font-bold text-gray-900 px-2 py-0.5 bg-gray-100 rounded">{{ admin.activeData().length }}</span> 
                  <span>de</span>
                  <span class="font-bold text-gray-900 px-2 py-0.5 bg-gray-100 rounded">{{ admin.totalRegistros() }}</span>
                  <span>registros</span>
                </div>

                <div class="flex items-center gap-3">
                  <button (click)="admin.paginaActual.update(p => p - 1)" 
                    [disabled]="admin.paginaActual() === 1"
                    class="p-2.5 rounded-lg bg-white border border-gray-300 text-gray-600 
                           hover:bg-[#39A900] hover:text-white hover:border-[#39A900] 
                           disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 
                           shadow-sm hover:shadow-md transition-all duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>

                  <!-- Página actual destacada - Opción 4 -->
                  <div class="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-[#39A900]/20 bg-[#39A900]/5">
                    <span class="text-xs font-medium text-gray-600">Pág.</span>
                    <span class="min-w-[24px] text-center text-base font-bold text-[#39A900]">
                      {{ admin.paginaActual() }}
                    </span>
                    <span class="text-xs font-medium text-gray-400">/</span>
                    <span class="text-xs font-medium text-gray-600">{{ admin.totalPaginas() }}</span>
                  </div>

                  <button (click)="admin.paginaActual.update(p => p + 1)" 
                    [disabled]="admin.paginaActual() >= admin.totalPaginas()"
                    class="p-2.5 rounded-lg bg-white border border-gray-300 text-gray-600 
                           hover:bg-[#39A900] hover:text-white hover:border-[#39A900] 
                           disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 
                           shadow-sm hover:shadow-md transition-all duration-200">
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

      <app-admin-modal
        [open]="admin.modalOpen()"
        [editando]="admin.editando()"
        [labelSingular]="config[admin.activeTab()].label.slice(0,-1)"
        [columns]="admin.editableColumns()"
        [form]="admin.modalForm"
        [saving]="admin.saving()"
        [error]="admin.modalError()"
        (closed)="admin.cerrarModal()"
        (saved)="onSaved($event)"
      />
    </div>

    <style>
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    </style>
  `,
})
export class AdminPanelComponent implements OnInit {
  modulos = MODULOS;
  config  = CONFIG;

  constructor(public admin: AdminService) {}

  ngOnInit(): void {
    this.admin.cargarTodos();
  }

  onSaved(form: Record<string, any>): void {
    this.admin.modalForm = form;
    this.admin.guardar();
  }
}
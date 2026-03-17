import { Component, OnInit } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CONFIG, MODULOS, Modulo } from '../config/admin.config';
import { AdminService } from '../services/admin.service';
import { AdminTableComponent } from '../components/admin-table.component';
import { AdminModalComponent } from '../components/admin-modal.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [ToastModule, ConfirmDialogModule, AdminTableComponent, AdminModalComponent],
  providers: [MessageService, ConfirmationService, AdminService],
  template: `
    <p-toast position="top-right" [baseZIndex]="9999" />
    <p-confirmdialog />

    <div class="min-h-screen bg-[#EEF2F7]">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-1 h-6 rounded-full bg-[#39A900]"></div>
            <h1 class="text-xl font-semibold text-gray-800">Panel Administrativo</h1>
          </div>
          <p class="text-sm text-gray-400 mt-1 ml-4">
            Gestión de personas, matrículas, cursos y estructura académica
          </p>
        </div>

        <!-- Tabs -->
        <div class="px-6 py-4">
          <div class="flex gap-1 border-b border-gray-100 overflow-x-auto pb-px mb-6">
            @for (mod of modulos; track mod) {
              <button (click)="admin.activeTab.set(mod)"
                class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px"
                [class.border-[#39A900]]="admin.activeTab() === mod"
                [class.text-[#39A900]]="admin.activeTab() === mod"
                [class.border-transparent]="admin.activeTab() !== mod"
                [class.text-gray-500]="admin.activeTab() !== mod">
                {{ config[mod].label }}
              </button>
            }
          </div>

          <!-- Toolbar -->
          <div class="flex justify-end mb-4">
            @if (config[admin.activeTab()].crear) {
              <button (click)="admin.abrirModal()"
                class="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-lg"
                style="background-color: #39A900">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
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
        </div>
      </div>

      <!-- Modal -->
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

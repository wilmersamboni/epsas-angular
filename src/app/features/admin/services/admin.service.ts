import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CONFIG, MODULOS, Modulo } from '../config/admin.config';

@Injectable()
export class AdminService {

  // ── State ─────────────────────────────────────────────────────────────────
  activeTab  = signal<Modulo>('personas');
  data       = signal<Record<string, any[]>>({});
  loading    = signal(false);
  modalOpen  = signal(false);
  editando   = signal<any | null>(null);
  saving     = signal(false);
  modalError = signal<string | null>(null);
  modalForm: Record<string, any> = {};

  constructor(
    private http:        HttpClient,
    private msg:         MessageService,
    private confirmSvc:  ConfirmationService,
  ) {}

  // ── Computed helpers ──────────────────────────────────────────────────────
  activeData(): any[] {
    return this.data()[this.activeTab()] ?? [];
  }

  activeColumns(): string[] {
    const rows = this.activeData();
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(k =>
      !k.toLowerCase().includes('password') &&
      !k.toLowerCase().includes('contrasena')
    );
  }

  editableColumns(): string[] {
    return this.activeColumns().filter(c =>
      !c.startsWith('id_') && !c.startsWith('fk_')
    );
  }

  // ── HTTP ──────────────────────────────────────────────────────────────────
  cargarTodos(): void {
    MODULOS.forEach(mod => this.cargar(mod));
  }

  async cargar(mod: Modulo): Promise<void> {
    this.loading.set(true);
    try {
      const result: any = await firstValueFrom(this.http.get(CONFIG[mod].listar));
      const rows = Array.isArray(result) ? result : result?.data ?? [];
      this.data.update(d => ({ ...d, [mod]: rows }));
    } catch (e: any) {
      console.error(`[Admin] Error cargando ${mod}:`, e?.message);
    } finally {
      this.loading.set(false);
    }
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  abrirModal(): void {
    this.editando.set(null);
    this.modalForm = {};
    this.editableColumns().forEach(c => (this.modalForm[c] = ''));
    this.modalError.set(null);
    this.modalOpen.set(true);
  }

  editarFila(row: any): void {
    this.editando.set(row);
    this.modalForm = { ...row };
    this.modalError.set(null);
    this.modalOpen.set(true);
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
    this.editando.set(null);
    this.modalError.set(null);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  async guardar(): Promise<void> {
    const mod = this.activeTab();
    const cfg = CONFIG[mod];
    this.saving.set(true);
    this.modalError.set(null);
    try {
      const row = this.editando();
      if (row) {
        await firstValueFrom(this.http.put(cfg.actualizar!(row[cfg.idKey]), this.modalForm));
      } else {
        await firstValueFrom(this.http.post(cfg.crear!, this.modalForm));
      }
      this.cerrarModal();
      await this.cargar(mod);
      this.msg.add({
        severity: 'success',
        summary: row ? 'Actualizado' : 'Registrado',
        detail: `El registro fue ${row ? 'actualizado' : 'creado'} correctamente.`,
        life: 3000,
      });
    } catch (e: any) {
      const detail = e?.error?.mensaje ?? e?.error?.error ?? 'Error al guardar.';
      this.modalError.set(detail);
      this.msg.add({ severity: 'error', summary: 'Error', detail, life: 4000 });
    } finally {
      this.saving.set(false);
    }
  }

  eliminarFila(row: any): void {
    const mod = this.activeTab();
    const cfg = CONFIG[mod];
    this.confirmSvc.confirm({
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Sí, eliminar', severity: 'danger' },
      accept: async () => {
        try {
          await firstValueFrom(this.http.delete(cfg.eliminar!(row[cfg.idKey])));
          await this.cargar(mod);
          this.msg.add({ severity: 'success', summary: 'Eliminado', detail: 'Registro eliminado correctamente.', life: 3000 });
        } catch (e: any) {
          const detail = e?.error?.mensaje ?? e?.error?.error ?? 'No se pudo eliminar. Puede tener registros relacionados.';
          this.msg.add({ severity: 'error', summary: 'No se pudo eliminar', detail, life: 5000 });
        }
      },
      reject: () => {
        this.msg.add({ severity: 'info', summary: 'Cancelado', detail: 'Acción cancelada.', life: 2000 });
      },
    });
  }
}

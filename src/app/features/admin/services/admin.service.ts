import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CONFIG, MODULOS, Modulo } from '../config/admin.config';

@Injectable()
export class AdminService {

  // ── FILTRO ──────────────────────────────────────────────
  filtro = signal<string>('');

  // ── State ──────────────────────────────────────────────
  activeTab     = signal<Modulo>('personas');
  data          = signal<Record<string, any[]>>({});
  loading       = signal(false);
  modalOpen     = signal(false);
  editando      = signal<any | null>(null);
  saving        = signal(false);
  modalError    = signal<string | null>(null);
  modalForm:    Record<string, any> = {};

  // ── Paginación ─────────────────────────────────────────
  paginaActual       = signal(1);
  registrosPorPagina = signal(20);

  constructor(
    private http:        HttpClient,
    private msg:         MessageService,
    private confirmSvc:  ConfirmationService,
  ) {
    effect(() => {
      this.activeTab();
      this.paginaActual.set(1);
    }, { allowSignalWrites: true });
  }

  // ── DATA BASE ──────────────────────────────────────────
  private allActiveData = computed(() => 
    this.data()[this.activeTab()] ?? []
  );

  // ── FILTRADO ──────────────────────────────────────────
  private filteredData = computed(() => {
    const filtro = this.filtro().toLowerCase().trim();
    const data = this.allActiveData();

    if (!filtro) return data;

    return data.filter((item: any) =>
      Object.values(item).some(valor =>
        String(valor).toLowerCase().includes(filtro)
      )
    );
  });

  // ── DATA PAGINADA (YA FILTRADA) ───────────────────────
  activeData = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.registrosPorPagina();
    const fin = inicio + this.registrosPorPagina();

    return this.filteredData().slice(inicio, fin);
  });

  // ── COLUMNAS ──────────────────────────────────────────
 activeColumns = computed(() => {
  const mod = this.activeTab();
  const cfg = CONFIG[mod];

  // 🔥 prioridad a columnas definidas
  if (cfg.columnas) return cfg.columnas;

  const rows = this.allActiveData();
  if (!rows.length) return [];

  return Object.keys(rows[0]).filter(k => {
    const key = k.toLowerCase();
    return (
      !key.includes('password') &&
      !key.includes('token') &&
      !key.includes('secret') &&
      !key.startsWith('id_') &&
      !key.startsWith('fk_') &&
      key !== 'id'
    );
  });
});

  editableColumns = computed(() => {
    return this.activeColumns().filter(c =>
      !c.startsWith('id_') && !c.startsWith('fk_')
    );
  });

  // ── PAGINACIÓN ────────────────────────────────────────
  setRegistrosPorPagina(n: number) {
    this.registrosPorPagina.set(n);
    this.paginaActual.set(1);
  }

  totalRegistros = computed(() => this.filteredData().length);

  totalPaginas = computed(() =>
    Math.ceil(this.totalRegistros() / this.registrosPorPagina())
  );

  // ── FILTRO ────────────────────────────────────────────
  setFiltro(valor: string) {
    this.filtro.set(valor);
    this.paginaActual.set(1);
  }

  // ── HTTP ──────────────────────────────────────────────
  async cargarTodos(): Promise<void> {
  // 🔥 primero los datos base
  await this.cargar('personas');
  await this.cargar('cursos');

  // luego el resto
  for (const mod of MODULOS) {
    if (mod !== 'personas' && mod !== 'cursos') {
      await this.cargar(mod);
    }
  }
}

  async cargar(mod: Modulo): Promise<void> {
    
  this.loading.set(true);
  try {
    const result: any = await firstValueFrom(this.http.get(CONFIG[mod].listar));
    let rows = Array.isArray(result) ? result : result?.data ?? [];

    // 🔥 transformación para matriculas
    if (mod === 'matriculas') {
      const personas = this.data()['personas'] || [];
      const cursos = this.data()['cursos'] || [];

      rows = rows.map((m: any) => {
        const estudiante = personas.find(p => p.id_persona === m.fk_persona);
        const curso = cursos.find(c => c.id_curso === m.fk_curso);

        return {
          ...m,
          estudiante: estudiante?.nombre || '—',
          curso: curso?.codigo || '—',
        };
      });
    }

    this.data.update(d => ({ ...d, [mod]: rows }));

    if (mod === 'matriculas') {
  console.log('MATRICULAS RAW:', rows);
  console.log('PERSONAS:', this.data()['personas']);
  console.log('CURSOS:', this.data()['cursos']);
}

  } catch (e: any) {
    console.error(`[Admin] Error cargando ${mod}:`, e?.message);
  } finally {
    this.loading.set(false);
  }
}

  // ── MODAL ─────────────────────────────────────────────
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

  // ── CRUD ──────────────────────────────────────────────
  async guardar(): Promise<void> {
    const mod = this.activeTab();
    const cfg = CONFIG[mod];
    this.saving.set(true);
    this.modalError.set(null);

    try {
      const registroExistente = this.editando();

      if (registroExistente) {
        await firstValueFrom(
          this.http.put(cfg.actualizar!(registroExistente[cfg.idKey]), this.modalForm)
        );
      } else {
        await firstValueFrom(this.http.post(cfg.crear!, this.modalForm));
      }

      this.cerrarModal();
      await this.cargar(mod);

      this.msg.add({
        severity: 'success',
        summary: registroExistente ? 'Actualizado' : 'Registrado',
        detail: `El registro fue procesado correctamente.`,
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
      header: 'Atención',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Sí, eliminar', severity: 'danger' },
      accept: async () => {
        try {
          await firstValueFrom(this.http.delete(cfg.eliminar!(row[cfg.idKey])));
          await this.cargar(mod);
          this.msg.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Registro eliminado correctamente.',
            life: 3000
          });
        } catch (e: any) {
          const detail = e?.error?.mensaje ?? e?.error?.error ?? 'No se pudo eliminar.';
          this.msg.add({ severity: 'error', summary: 'No se pudo eliminar', detail, life: 5000 });
        }
      }
    });
  }
}
import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CONFIG, MODULOS, Modulo } from '../config/admin.config';

export interface OpcionSelect {
  label: string;
  value: any;
}

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

  /** Datos crudos sin aplanar, para usar en edición */
  private rawData = signal<Record<string, any[]>>({});

  /** Opciones de selects para el modal activo: { campo → [{label, value}] } */
  opcionesModal: Record<string, OpcionSelect[]> = {};

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
    const mod = this.activeTab();
    const cfg = CONFIG[mod];

    if (cfg.campos) return cfg.campos;

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
    await this.cargar('departamentos');
    await this.cargar('municipios');
    await this.cargar('centros');
    await this.cargar('sedes');
    await this.cargar('areas');
    await this.cargar('programas');
    await this.cargar('personas');
    await this.cargar('cursos');

    for (const mod of MODULOS) {
      const yaResueltos = ['departamentos','municipios','centros','sedes','areas','programas','personas','cursos'];
      if (!yaResueltos.includes(mod)) {
        await this.cargar(mod);
      }
    }
  }

  private aplanarFila(fila: any): any {
    const resultado: any = {};
    for (const [clave, valor] of Object.entries(fila)) {
      if (
        valor !== null &&
        typeof valor === 'object' &&
        !Array.isArray(valor) &&
        !(valor instanceof Date)
      ) {
        const obj = valor as any;
        resultado[clave] =
          obj.nombre ??
          obj.codigo ??
          obj.descripcion ??
          obj.name ??
          Object.values(obj).find(v => typeof v === 'string') ??
          '—';
      } else {
        resultado[clave] = valor;
      }
    }
    return resultado;
  }

  async cargar(mod: Modulo): Promise<void> {
    this.loading.set(true);
    try {
      const result: any = await firstValueFrom(this.http.get(CONFIG[mod].listar));
      let rows = Array.isArray(result) ? result : result?.data ?? [];

      if (mod === 'matriculas') {
        rows = rows.map((m: any) => ({
          ...m,
          estudiante: m.persona?.nombre  ?? m.persona?.name  ?? '—',
          curso:      m.curso?.codigo    ?? m.curso?.nombre  ?? '—',
        }));
      }

      if (mod === 'credenciales') {
        rows = rows.map((c: any) => ({
          ...c,
          usuario: c.usuario?.persona?.nombre ?? c.usuario?.idUsuario ?? '—',
          rol:     c.rol?.nombre              ?? c.rol?.descripcion    ?? '—',
        }));
      }

      // ✅ Guarda copia cruda ANTES de aplanar (para usar en edición)
      this.rawData.update(d => ({ ...d, [mod]: rows }));

      // Aplana para mostrar en tabla
      rows = rows.map((fila: any) => this.aplanarFila(fila));
      this.data.update(d => ({ ...d, [mod]: rows }));

    } catch (e: any) {
      console.error(`[Admin] Error cargando ${mod}:`, e?.message);
    } finally {
      this.loading.set(false);
    }
  }

  // ── SELECTORES ────────────────────────────────────────
  private buildOpciones(mod: Modulo): Record<string, OpcionSelect[]> {
    const cfg = CONFIG[mod];
    if (!cfg.selectores) return {};

    const opciones: Record<string, OpcionSelect[]> = {};
    for (const [campo, selector] of Object.entries(cfg.selectores)) {
      const items = this.data()[selector.modulo] ?? [];
      opciones[campo] = items.map(item => ({
        label: item[selector.label] ?? '—',
        value: item[selector.value],
      }));
    }
    return opciones;
  }

  // ── MODAL ─────────────────────────────────────────────
  abrirModal(): void {
    this.editando.set(null);
    this.modalForm = {};
    this.editableColumns().forEach(c => (this.modalForm[c] = ''));
    this.opcionesModal = this.buildOpciones(this.activeTab());
    this.modalError.set(null);
    this.modalOpen.set(true);
  }

  editarFila(row: any): void {
    const mod = this.activeTab();
    const cfg = CONFIG[mod];

    // ✅ Busca el registro crudo (con UUIDs reales) en lugar del aplanado
    const rawRow = this.rawData()[mod]?.find(
      r => r[cfg.idKey] === row[cfg.idKey]
    ) ?? row;

    this.editando.set(rawRow);
    this.modalForm = { ...rawRow };
    this.opcionesModal = this.buildOpciones(mod);
    this.modalError.set(null);
    this.modalOpen.set(true);
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
    this.editando.set(null);
    this.modalError.set(null);
  }

  private sanitizarForm(form: Record<string, any>): Record<string, any> {
    const resultado: Record<string, any> = {};
    for (const [clave, valor] of Object.entries(form)) {
      if (valor === '' || valor === null || valor === undefined) continue;
      if (typeof valor === 'string' && /^\d+$/.test(valor.trim())) {
        resultado[clave] = parseInt(valor.trim(), 10);
      } else {
        resultado[clave] = valor;
      }
    }
    return resultado;
  }

  // ── CRUD ──────────────────────────────────────────────
  async guardar(): Promise<void> {
    const mod = this.activeTab();
    const cfg = CONFIG[mod];
    this.saving.set(true);
    this.modalError.set(null);

    try {
      const registroExistente = this.editando();
      const formData = this.sanitizarForm(this.modalForm);

      if (registroExistente) {
        // ✅ Elimina el ID del body antes de enviarlo al backend
        const { [cfg.idKey]: _, ...body } = formData;

        await firstValueFrom(
          this.http.put(cfg.actualizar!(registroExistente[cfg.idKey]), body)
        );
      } else {
        await firstValueFrom(this.http.post(cfg.crear!, formData));
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
            life: 3000,
          });
        } catch (e: any) {
          const detail = e?.error?.mensaje ?? e?.error?.error ?? 'No se pudo eliminar.';
          this.msg.add({ severity: 'error', summary: 'No se pudo eliminar', detail, life: 5000 });
        }
      },
    });
  }
}
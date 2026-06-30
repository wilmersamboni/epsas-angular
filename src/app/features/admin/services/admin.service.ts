import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CONFIG, MODULOS, MODULOS_PRACTICA, Modulo } from '../config/admin.config';

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

    // Campos a ocultar siempre en la vista de tabla
    const SYSTEM_FIELDS = new Set([
      'id', 'centroid', 'sedeid', 'createdat', 'updatedat',
      'actas_pdf', 'ruta_archivo', 'mime_type', 'tamanio',
    ]);

    return Object.keys(rows[0]).filter(k => {
      const key = k.toLowerCase();
      return (
        !SYSTEM_FIELDS.has(key) &&
        !key.includes('password') &&
        !key.includes('token') &&
        !key.includes('secret') &&
        !key.startsWith('id_') &&
        !key.startsWith('fk_') &&
        !k.endsWith('Id')   // oculta FK crudas como municipioId, etapaId, etc.
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

  /**
   * Carga un módulo sin tocar el signal `loading` (para uso interno en cargarTodos).
   * El signal lo gestiona cargarTodos de forma centralizada para evitar
   * decenas de re-renders.
   */
  private async cargarDatos(mod: Modulo): Promise<void> {
    try {
      const result: any = await firstValueFrom(
        this.http.get(CONFIG[mod].listar, { withCredentials: true })
      );
      let rows = Array.isArray(result) ? result : result?.data ?? [];

      if (mod === 'matriculas') {
        const personasRaw: any[] = this.rawData()['personas'] ?? [];
        rows = rows.map((m: any) => {
          const personaId  = m.idPersona ?? (typeof m.persona === 'string' ? m.persona : m.persona?.idPersona) ?? '';
          const cursoId    = m.idCurso   ?? (typeof m.curso   === 'string' ? m.curso   : m.curso?.idCurso)     ?? '';
          const personaData = personasRaw.find((p: any) => p.idPersona === personaId);
          return {
            ...m,
            persona:    personaId,
            curso:      cursoId,
            // avance llega como string decimal "0.00" desde la BD → convertir a número
            avance:     m.avance != null ? parseFloat(m.avance) : m.avance,
            estudiante: personaData?.nombre ?? m.persona?.nombre ?? m.persona?.name ?? '—',
            cargo:      personaData?.cargo  ?? m.persona?.cargo  ?? '—',
          };
        });
      }

      // Etapas: añadir campo 'aprendiz' cruzando matriculaId → rawData de matrículas
      // Esto permite usar label: 'aprendiz' en el selector de etapas dentro de seguimientos.
      // Se ejecuta ANTES del rawData.update para que rawData ya lleve el campo calculado.
      if (mod === 'etapas') {
        const matriculas: any[] = this.rawData()['matriculas'] ?? [];
        rows = rows.map((e: any) => {
          const mat = matriculas.find(
            (m: any) => String(m.idMatricula ?? '').toLowerCase() === String(e.matriculaId ?? '').toLowerCase()
          );
          return {
            ...e,
            aprendiz: mat?.persona?.nombre ?? mat?.estudiante ?? '—',
          };
        });
      }

      if (mod === 'credenciales') {
        rows = rows.map((c: any) => ({
          ...c,
          usuario: c.usuario?.persona?.nombre ?? c.usuario?.idUsuario ?? '—',
          rol:     c.rol?.nombre              ?? c.rol?.descripcion    ?? '—',
        }));
      }

      // Guarda copia cruda (con UUIDs reales) para usar en edición
      this.rawData.update(d => ({ ...d, [mod]: rows }));

      // Seguimientos: añadir campo 'aprendiz' cruzando etapa → rawData de etapas (ya tienen el aprendiz calculado)
      if (mod === 'seguimientos') {
        const etapas: any[] = this.rawData()['etapas'] ?? [];
        rows = rows.map((s: any) => {
          const etapaId = s.etapa?.id ?? s.etapaId ?? s.etapa ?? '';
          const etapa = etapas.find(
            (e: any) => String(e.id ?? '').toLowerCase() === String(etapaId).toLowerCase()
          );
          return { ...s, aprendiz: etapa?.aprendiz ?? '—' };
        });
      }
      // Resolución inline de municipio en empresas:
      // 'municipio' guarda UUID del municipio como texto plano en api2.
      // Si rawData de municipios ya está disponible lo resolvemos aquí;
      // si no, hacemos un fetch puntual para garantizarlo.
      if (mod === 'empresas') {
        let municipios: any[] = this.rawData()['municipios'] ?? [];
        if (municipios.length === 0) {
          try {
            const r: any = await firstValueFrom(
              this.http.get('/api/municipios', { withCredentials: true })
            );
            municipios = Array.isArray(r) ? r : r?.data ?? [];
            this.rawData.update(d => ({ ...d, municipios }));
          } catch (err) {
            console.error('[Admin] No se pudo cargar municipios para empresas:', err);
          }
        }

        // Debug: muestra qué claves tiene el primer municipio para detectar el nombre real del PK
        if (municipios.length > 0) {
          console.log('[Admin] municipios[0] keys:', Object.keys(municipios[0]));
          console.log('[Admin] municipios sample:', municipios.slice(0, 3).map((m: any) => ({
            idMunicipio: m.idMunicipio, id_municipio: m.id_municipio, nombre: m.nombre,
          })));
        } else {
          console.warn('[Admin] rawData[municipios] está vacío — no se podrá resolver municipio en empresas');
        }

        // Primera pasada: resolver con la lista en memoria
        const unresolved: { idx: number; uuid: string }[] = [];
        rows = rows.map((e: any, idx: number) => {
          const raw  = String(e.municipio ?? '').trim().toLowerCase();
          const match = municipios.find((m: any) => {
            const pk = String(m.idMunicipio ?? m.id_municipio ?? m.id ?? '').trim().toLowerCase();
            const nombre = String(m.nombre ?? '').trim().toLowerCase();
            return pk === raw || nombre === raw;
          });
          if (match) return { ...e, municipio: match.nombre };
          // UUID no encontrado en la lista — intentar fetch individual
          if (e.municipio && /^[0-9a-f-]{36}$/i.test(String(e.municipio))) {
            unresolved.push({ idx, uuid: e.municipio });
          }
          return e; // mantiene UUID por ahora
        });

        // Segunda pasada: fetch individual para UUIDs no encontrados en la lista
        if (unresolved.length > 0) {
          const fetchResults = await Promise.allSettled(
            unresolved.map(async ({ idx, uuid }) => {
              const r: any = await firstValueFrom(
                this.http.get(`/api/municipios/${uuid}`, { withCredentials: true })
              );
              return { idx, nombre: r?.nombre ?? uuid };
            })
          );
          fetchResults.forEach((res, i) => {
            if (res.status === 'fulfilled') {
              const { idx, nombre } = res.value;
              rows[idx] = { ...rows[idx], municipio: nombre };
              // Agrega a la lista para futuros usos en esta sesión
              const uuid = unresolved[i].uuid;
              if (!municipios.some((m: any) => (m.idMunicipio ?? m.id) === uuid)) {
                municipios.push({ idMunicipio: uuid, nombre });
                this.rawData.update(d => ({ ...d, municipios: [...(d['municipios'] ?? []), { idMunicipio: uuid, nombre }] }));
              }
            } else {
              console.warn(`[Admin] municipio UUID "${unresolved[i].uuid}" no encontrado en backend-epsas`);
            }
          });
        }
      }

      // Resuelve otros FK UUIDs a nombres legibles
      rows = this.resolverSelectores(mod, rows);

      // Aplana objetos anidados para mostrar en tabla
      rows = rows.map((fila: any) => this.aplanarFila(fila));
      this.data.update(d => ({ ...d, [mod]: rows }));

    } catch (e: any) {
      const status = e?.status ?? '?';
      const detail = e?.error?.message ?? e?.error?.mensaje ?? e?.message ?? 'Error desconocido';
      console.error(`[Admin] Error cargando ${mod} (${status}):`, detail);
      this.msg.add({
        severity: 'warn',
        summary: `No se pudo cargar ${CONFIG[mod].label}`,
        detail: status === 401 ? 'Sin autorización — vuelve a iniciar sesión' : String(detail),
        life: 6000,
      });
    }
  }

  async cargarTodos(): Promise<void> {
    this.loading.set(true);
    try {
      // ── Grupo 1: catálogos puros sin dependencias entre sí ──────────────
      await Promise.all([
        this.cargarDatos('departamentos'),
        this.cargarDatos('aplicativos'),
        this.cargarDatos('roles'),
      ]);

      // ── Grupo 2: dependen de departamentos ──────────────────────────────
      await Promise.all([
        this.cargarDatos('municipios'),
        this.cargarDatos('centros'),
      ]);

      // ── Grupo 3: dependen de municipios / centros ────────────────────────
      await Promise.all([
        this.cargarDatos('sedes'),
        this.cargarDatos('personas'),
        this.cargarDatos('programas'),
      ]);

      // ── Grupo 4: dependen de sedes / personas / programas ───────────────
      await Promise.all([
        this.cargarDatos('areas'),
        this.cargarDatos('cursos'),
        this.cargarDatos('matriculas'),
        this.cargarDatos('usuarios'),
        this.cargarDatos('credenciales'),
      ]);

      // ── Grupo 5: api2 — catálogos base ──────────────────────────────────
      await Promise.all([
        this.cargarDatos('empresas'),    // resuelve municipio internamente
        this.cargarDatos('modalidades'),
      ]);

      // ── Grupo 6a: etapas y asignaciones (seguimientos depende de ellos) ──
      await Promise.all([
        this.cargarDatos('etapas'),       // calcula campo 'aprendiz' desde matriculas
        this.cargarDatos('asignaciones'), // necesario para selector en seguimientos
      ]);

      // ── Grupo 6b: módulos que dependen de etapas / asignaciones ──────────
      await Promise.all([
        this.cargarDatos('seguimientos'),  // usa rawData['etapas'] para campo 'aprendiz'
        this.cargarDatos('bitacoras'),
        this.cargarDatos('observaciones'),
        this.cargarDatos('formatos'),
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Para cada selector definido en el módulo, reemplaza el campo FK UUID
   * por un campo con nombre legible, p.ej. municipioId → municipio: 'Bogotá'.
   * Opera sobre los datos de display (no modifica rawData).
   */
  /**
   * Para cada selector definido en el módulo, reemplaza el campo FK UUID
   * por un campo con nombre legible, p.ej. municipioId → municipio: 'Bogotá'.
   * Si el campo FK no existe en la fila (el backend ya devuelve un objeto anidado),
   * se omite sin tocar el dato original para que aplanarFila lo procese.
   */
  private resolverSelectores(mod: Modulo, rows: any[]): any[] {
    const cfg = CONFIG[mod];
    if (!cfg.selectores) return rows;

    return rows.map(row => {
      const display: any = { ...row };
      for (const [campo, selector] of Object.entries(cfg.selectores!)) {
        let fkVal = row[campo];
        // Si el backend devuelve un objeto anidado { id: '...' }, extraemos el UUID
        if (fkVal !== null && typeof fkVal === 'object' && !Array.isArray(fkVal)) {
          fkVal = fkVal['id'] ?? fkVal['uuid'] ?? null;
        }
        // Si el campo no existe como FK plana, lo salta para que aplanarFila lo procese.
        if (fkVal === null || fkVal === undefined) continue;

        // Nombre de clave para mostrar: quita el sufijo 'Id' si existe
        const displayKey = campo.endsWith('Id') ? campo.slice(0, -2) : campo;
        const relItems: any[] = this.rawData()[selector.modulo] ?? [];
        const fkStr = String(fkVal).trim().toLowerCase();
        const match = relItems.find((item: any) => {
          // intenta con el value configurado, luego con variantes snake/camel del PK
          const primary = String(item[selector.value] ?? '').trim().toLowerCase();
          if (primary === fkStr) return true;
          // fallback: prueba id_municipio, idMunicipio, id, etc.
          const alt = String(item['id_municipio'] ?? item['idMunicipio'] ?? item['id'] ?? '').trim().toLowerCase();
          return alt === fkStr;
        });
        display[displayKey] = match
          ? (match[selector.label] ?? String(fkVal))
          : String(fkVal);
        // Elimina el campo crudo UUID de la vista (queda solo en rawData)
        if (displayKey !== campo) delete display[campo];
      }
      return display;
    });
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

  /** Recarga un módulo individual (muestra spinner durante la operación). */
  async cargar(mod: Modulo): Promise<void> {
    this.loading.set(true);
    await this.cargarDatos(mod);
    this.loading.set(false);
  }

  // ── SELECTORES ────────────────────────────────────────
  private buildOpciones(mod: Modulo): Record<string, OpcionSelect[]> {
    const cfg = CONFIG[mod];
    const opciones: Record<string, OpcionSelect[]> = {};

    for (const [campo, selector] of Object.entries(cfg.selectores ?? {})) {
      let items: any[] = this.data()[selector.modulo] ?? [];

      // Aplica filtro si está definido en el selector (p.ej. { cargo: 'aprendiz' })
      if (selector.filtro) {
        items = items.filter((item: any) =>
          Object.entries(selector.filtro!).every(([k, v]) => item[k] === v)
        );
      }

      opciones[campo] = items.map(item => ({
      label: item[selector.label] ?? '—',
      value: item[selector.value],
    }));
    }
    // Opciones estáticas
        const staticOpts = cfg.opcionesEstaticas ?? {};
        for (const [campo, opts] of Object.entries(staticOpts)) {
          opciones[campo] = opts;
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
    const mod = this.activeTab();
    const tiposCampo = CONFIG[mod]?.tiposCampo ?? {};
    const resultado: Record<string, any> = {};
    for (const [clave, valor] of Object.entries(form)) {
      if (valor === '' || valor === null || valor === undefined) continue;

      if (tiposCampo[clave] === 'number') {
        // Campo explícitamente numérico: convertir string a número si es necesario
        if (typeof valor === 'string' && valor.trim() !== '') {
          const num = Number(valor.trim());
          resultado[clave] = isNaN(num) ? valor : num;
        } else {
          resultado[clave] = valor; // ya es número (desde input type="number")
        }
      } else {
        // Campo NO numérico: si el API devolvió un number (p.ej. nit como int en DB),
        // lo convertimos a string porque el DTO del backend espera @IsString().
        resultado[clave] = typeof valor === 'number' ? String(valor) : valor;
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
    let formData = this.sanitizarForm(this.modalForm);

    // --- NUEVA LÓGICA DE FILTRADO ---
    // Si el módulo tiene una lista de 'campos' definida, eliminamos todo lo que no esté en ella.
    if (cfg.campos) {
      const bodyFiltrado: Record<string, any> = {};
      cfg.campos.forEach(campo => {
        if (formData.hasOwnProperty(campo)) {
          bodyFiltrado[campo] = formData[campo];
        }
      });
      formData = bodyFiltrado;
    }
    // --------------------------------

    const opts = { withCredentials: true };

    if (registroExistente) {
      // Eliminamos el ID por si acaso no estaba en 'campos' pero sí en formData
      const { [cfg.idKey]: _, ...body } = formData;
      const url = cfg.actualizar!(registroExistente[cfg.idKey]);

      await firstValueFrom(
        cfg.usePatch
          ? this.http.patch(url, body, opts)
          : this.http.put(url, body, opts)
      );
    } else {
      await firstValueFrom(this.http.post(cfg.crear!, formData, opts));
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
          await firstValueFrom(this.http.delete(cfg.eliminar!(row[cfg.idKey]), { withCredentials: true }));
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
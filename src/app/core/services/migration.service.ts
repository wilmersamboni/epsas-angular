import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  MigrationRow,
  MigrationResult,
  MigrationSummary,
  MigrationState,
  MigrationConfig,
  DEFAULT_MIGRATION_CONFIG,
  EntityType,
  Persona,
  Ficha,
  EtapaPractica,
  MigrationLogEntry,
  Matricula
} from '../../features/migracion/models/migration.models';
import { ExcelParserService, ParsedSheets } from './excel-parser.service';

// ─────────────────────────────────────────────────────────
// Respuesta genérica de la API
// ─────────────────────────────────────────────────────────
interface ApiResponse<T = unknown> {
  data?: T;
  exists?: boolean;
  updated?: boolean;
  created?: boolean;
  changes?: Record<string, { old: unknown; new: unknown }>;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class MigrationService {

  // ── Estado reactivo (Angular 21 Signals) ──
  private _state = signal<MigrationState>({
    status:     'idle',
    currentRow: 0,
    totalRows:  0,
    percentage: 0,
    logs:       []
  });

  readonly state    = this._state.asReadonly();
  readonly isRunning = computed(() => this._state().status === 'running');
  readonly isPaused  = computed(() => this._state().status === 'paused');
  readonly isDone    = computed(() => ['completed', 'error'].includes(this._state().status));

  private config: MigrationConfig = { ...DEFAULT_MIGRATION_CONFIG };
  private _paused   = false;
  private _stopped  = false;
  private _sheets?: ParsedSheets;

  constructor(
    private readonly http: HttpClient,
    private readonly parser: ExcelParserService
  ) {}

  // ──────────────────────────────────────────────────────────
  // Configuración
  // ──────────────────────────────────────────────────────────
  setConfig(cfg: Partial<MigrationConfig>): void {
    this.config = { ...this.config, ...cfg };
  }

  getConfig(): MigrationConfig {
    return { ...this.config };
  }

  // ──────────────────────────────────────────────────────────
  // Cargar y parsear archivo Excel
  // ──────────────────────────────────────────────────────────
  async loadFile(file: File): Promise<ParsedSheets> {
    this.patchState({ status: 'parsing' });
    this.log('info', `Analizando archivo: ${file.name}`);

    const sheets = await this.parser.parseFile(file);
    this._sheets = sheets;

    const total =
      sheets.yamboro.length +
      sheets.deportes.length +
      sheets.cancelados.length +
      sheets.acumulado.length +
      sheets.aprendices2025.length +
      sheets.aprendices2025111.length +
      sheets.instructores.length;

    this.log('info',
      `Archivo cargado. ${total} registros encontrados en ${Object.keys(sheets).length} hojas.`
    );
    this.patchState({ status: 'idle', totalRows: total });
    return sheets;
  }

  // ──────────────────────────────────────────────────────────
  // Iniciar migración completa
  // ──────────────────────────────────────────────────────────
  async startMigration(sheets?: ParsedSheets): Promise<MigrationSummary> {
    const data = sheets || this._sheets;
    if (!data) throw new Error('No hay datos cargados. Carga un archivo Excel primero.');

    this._paused  = false;
    this._stopped = false;

    const summary: MigrationSummary = {
      total:    0,
      created:  0,
      updated:  0,
      skipped:  0,
      errors:   0,
      startTime: new Date(),
      results: [],
      entityBreakdown: {
        persona:        { created: 0, updated: 0, skipped: 0, errors: 0 },
        programa:       { created: 0, updated: 0, skipped: 0, errors: 0 },
        ficha:          { created: 0, updated: 0, skipped: 0, errors: 0 },
        matricula:      { created: 0, updated: 0, skipped: 0, errors: 0 },
        etapa_practica: { created: 0, updated: 0, skipped: 0, errors: 0 },
        instructor:     { created: 0, updated: 0, skipped: 0, errors: 0 }
      }
    };

    const allRows = [
      ...data.yamboro,
      ...data.deportes,
      ...data.cancelados,
      ...data.acumulado,
      ...data.aprendices2025,
      ...data.aprendices2025111
    ];

    const totalRows = allRows.length + data.instructores.length;
    this.patchState({
      status: 'running',
      totalRows,
      currentRow: 0,
      percentage: 0,
      summary
    });
    this.log('info', `Iniciando migración de ${totalRows} registros…`);

    // ── 1. Instructores ──────────────────────────────────────
    if (!this._stopped) {
      this.log('info', 'Procesando instructores…');
      for (let i = 0; i < data.instructores.length; i++) {
        await this.waitIfPaused();
        if (this._stopped) break;

        const instructor = data.instructores[i];
        const result = await this.upsertInstructor(instructor, summary.total + i);
        this.accumulateResult(result, summary);
      }
      summary.total += data.instructores.length;
    }

    // ── 2. Aprendices (personas + fichas + matrículas + etapas) ─
    if (!this._stopped) {
      this.log('info', 'Procesando aprendices…');
      for (let i = 0; i < allRows.length; i++) {
        await this.waitIfPaused();
        if (this._stopped) break;

        const row = allRows[i];
        const results = await this.migrateAprendizRow(row, summary.total + i);
        for (const r of results) this.accumulateResult(r, summary);

        summary.total++;

        this.patchState({
          currentRow: summary.total,
          percentage: Math.round((summary.total / totalRows) * 100),
          summary: { ...summary }
        });

        // Batch delay
        if (i > 0 && i % this.config.batchSize === 0) {
          await this.delay(this.config.delayBetweenBatches);
        }

        if (this.config.stopOnError && summary.errors > 0) {
          this.log('warning', 'Se detuvo la migración por errores (stopOnError=true).');
          this._stopped = true;
          break;
        }
      }
    }

    // ── Finalizar ──────────────────────────────────────────
    summary.endTime    = new Date();
    summary.durationMs = summary.endTime.getTime() - summary.startTime.getTime();

    this.patchState({
      status:    this._stopped ? 'error' : 'completed',
      percentage: 100,
      summary: { ...summary }
    });

    this.log('success',
      `Migración completada. Creados: ${summary.created} | Actualizados: ${summary.updated} | ` +
      `Omitidos: ${summary.skipped} | Errores: ${summary.errors}`
    );

    return summary;
  }

  // ──────────────────────────────────────────────────────────
  // Control de flujo
  // ──────────────────────────────────────────────────────────
  pause():  void { this._paused = true;  this.patchState({ status: 'paused' }); }
  resume(): void { this._paused = false; this.patchState({ status: 'running' }); }
  stop():   void { this._stopped = true; this._paused = false; }

  reset(): void {
    this._sheets  = undefined;
    this._paused  = false;
    this._stopped = false;
    this._state.set({
      status: 'idle', currentRow: 0, totalRows: 0, percentage: 0, logs: []
    });
  }

  // ──────────────────────────────────────────────────────────
  // Migrar una fila completa de aprendiz
  // ──────────────────────────────────────────────────────────
  private async migrateAprendizRow(row: MigrationRow, rowIndex: number): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    // 1. Persona
    const personaData = this.parser.rowToPersona(row);
    
    const personaResult = await this.upsertEntity<Persona & Record<string, unknown>>(
      'persona',
      {
        ...personaData,
        numeroDocumento: personaData.numeroDocumento
      } as Persona & Record<string, unknown>,
      { 
        identificacion: personaData.numeroDocumento
      },
      rowIndex
    );
    results.push(personaResult);

    if (personaResult.action === 'error') return results;

    // 2. Ficha
    if (row.ficha) {
  const fichaData = this.parser.rowToFicha(row) as any;
  const fichaResult = await this.upsertEntity(
    'ficha', // TypeScript está feliz
    fichaData,
    { codigo: row.ficha }, // Pero enviamos 'codigo' que es lo que espera la tabla curso
    rowIndex
  );
  results.push(fichaResult);
      // 3. Matrícula (persona + ficha)
      const matriculaData = this.parser.rowToMatricula(row) as Matricula & Record<string, unknown>;
      const matriculaResult = await this.upsertEntity<Matricula & Record<string, unknown>>(
        'matricula',
        matriculaData,
        { numeroDocumento: row.numeroDocumento, fichaNumero: row.ficha },
        rowIndex
      );
      results.push(matriculaResult);

      // 4. Etapa práctica (solo si tiene empresa o tipo de alternativa)
      if (row.empresa || row.tipoAlternativa) {
        const etapaData = this.parser.rowToEtapaPractica(row) as EtapaPractica & Record<string, unknown>;
        const etapaResult = await this.upsertEntity<EtapaPractica & Record<string, unknown>>(
          'etapa_practica',
          etapaData,
          { numeroDocumento: row.numeroDocumento, fichaNumero: row.ficha },
          rowIndex
        );
        results.push(etapaResult);
      }
    }

    return results;
  }

  // ──────────────────────────────────────────────────────────
  // Upsert genérico de entidades
  // ──────────────────────────────────────────────────────────
  private async upsertEntity<T extends Record<string, unknown>>(
  entity: EntityType, // Aquí sigue llegando 'ficha'
  data: T,
  searchKeys: Record<string, unknown>,
  rowIndex: number
): Promise<MigrationResult> {
  
  // 🌉 EL PUENTE: Si la entidad es 'ficha', la API la busca como 'curso'
  const apiEndpoint = entity === 'ficha' ? 'curso' : entity;
  
  const identifier = Object.values(searchKeys).filter(Boolean).join(' / ');
  const t0 = Date.now();

  // ... (código intermedio de dryRun)

  try {
    const params = new URLSearchParams();
    Object.entries(searchKeys).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });

    // 2. VERIFICAR SI EXISTE (Usando apiEndpoint)
    const checkRes = await firstValueFrom(
      this.http.get<ApiResponse<any>>(
        `${this.config.apiBaseUrl}/${apiEndpoint}/exists?${params.toString()}`
      )
    );

    if (checkRes?.exists && checkRes.data) {
      const existing = checkRes.data;
      const changes = this.detectChanges(existing, data);

      if (Object.keys(changes).length === 0 || !this.config.updateOnConflict) {
        return { rowIndex, entity, action: 'skipped', identifier, duration: Date.now() - t0 };
      }

      // 3. ACTUALIZAR (Usando apiEndpoint e id_curso)
      // Ojo: En la DB de curso, el ID probablemente se llama id_curso o id
      const realId = existing.id_curso || existing.id_persona || existing.id;

      await firstValueFrom(
        this.http.put<ApiResponse<T>>(
          `${this.config.apiBaseUrl}/${apiEndpoint}/${realId}`,
          data
        )
      );

      return { rowIndex, entity, action: 'updated', identifier, changes, duration: Date.now() - t0 };
    }

    // 4. CREAR (Usando apiEndpoint)
    await firstValueFrom(
      this.http.post<ApiResponse<T>>(`${this.config.apiBaseUrl}/${apiEndpoint}`, data)
    );

    return { rowIndex, entity, action: 'created', identifier, duration: Date.now() - t0 };

  } catch (err) {
      const msg = err instanceof HttpErrorResponse
        ? `HTTP ${err.status}: ${err.error?.message ?? err.statusText}`
        : String(err);

      this.log('error', `Error en ${entity} (${identifier}): ${msg}`);

      return {
        rowIndex, entity, action: 'error',
        identifier, error: msg, duration: Date.now() - t0
      };
    }
  }

  // ──────────────────────────────────────────────────────────
  // Detección de cambios mejorada
  // ──────────────────────────────────────────────────────────
  private detectChanges(
    existing: Record<string, any>,
    incoming: Record<string, any>
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    for (const [key, newVal] of Object.entries(incoming)) {
      if (newVal === undefined || newVal === null) continue;
      // Ignoramos campos de ID en la comparación
      if (['id', 'id_persona', 'id_ficha', 'id_matricula'].includes(key)) continue;

      const oldVal = existing[key];
      
      // Normalizamos a string minúsculas para comparar (evita updates falsos por "Activo" vs "activo")
      const oldStr = String(oldVal ?? '').trim().toLowerCase();
      const newStr = String(newVal ?? '').trim().toLowerCase();

      if (oldStr !== newStr) {
        changes[key] = { old: oldVal, new: newVal };
      }
    }

    return changes;
  }

  // ──────────────────────────────────────────────────────────
  // Upsert para instructores
  // ──────────────────────────────────────────────────────────
  private async upsertInstructor(
    instructor: { nombre: string; area?: string; celular?: string; correo?: string },
    rowIndex: number
  ): Promise<MigrationResult> {
    return this.upsertEntity(
      'instructor',
      instructor as Record<string, unknown>,
      { nombre: instructor.nombre },
      rowIndex
    );
  }

  // ──────────────────────────────────────────────────────────
  // Detección de cambios (campo a campo)
  // ──────────────────────────────────────────────────────────
  // private detectChanges(
  //   existing: Record<string, unknown>,
  //   incoming: Record<string, unknown>
  // ): Record<string, { old: unknown; new: unknown }> {
  //   const changes: Record<string, { old: unknown; new: unknown }> = {};

  //   for (const [key, newVal] of Object.entries(incoming)) {
  //     if (newVal === undefined || newVal === null) continue;
  //     if (key === 'id') continue;

  //     const oldVal = existing[key];
  //     const oldStr = oldVal !== undefined && oldVal !== null ? String(oldVal).trim() : '';
  //     const newStr = String(newVal).trim();

  //     if (oldStr !== newStr) {
  //       changes[key] = { old: oldVal, new: newVal };
  //     }
  //   }

  //   return changes;
  // }

  // ──────────────────────────────────────────────────────────
  // Helpers internos
  // ──────────────────────────────────────────────────────────

  private accumulateResult(result: MigrationResult, summary: MigrationSummary): void {
    summary.results.push(result);

    const eb = summary.entityBreakdown[result.entity];
    switch (result.action) {
      case 'created': summary.created++; eb.created++; break;
      case 'updated': summary.updated++; eb.updated++; break;
      case 'skipped': summary.skipped++; eb.skipped++; break;
      case 'error':   summary.errors++;  eb.errors++;  break;
    }
  }

  public patchState(partial: Partial<MigrationState>): void {
    this._state.update(s => ({ ...s, ...partial }));
  }

  private log(level: MigrationLogEntry['level'], message: string, details?: string): void {
    const entry: MigrationLogEntry = { timestamp: new Date(), level, message, details };
    this._state.update(s => ({
      ...s,
      logs: [...s.logs.slice(-499), entry]
    }));
  }

  private waitIfPaused(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (!this._paused) return resolve();
        setTimeout(check, 200);
      };
      check();
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));


  }

  uploadExcel(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post(
    `${this.config.apiBaseUrl}/migrar/personas`,
    formData
  );
}
}
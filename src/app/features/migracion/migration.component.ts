import {
  Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpClientModule }       from '@angular/common/http';
import { MigrationService }       from '../../core/services/migration.service';
import { ExcelParserService, ParsedSheets } from '../../core/services/excel-parser.service';
import {
  MigrationConfig, MigrationLogEntry, MigrationSummary,
  EntityType, DEFAULT_MIGRATION_CONFIG
} from '../../features/migracion/models/migration.models';

@Component({
  selector:    'app-migration',
  standalone:  true,
  imports:     [CommonModule, FormsModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">

  <!-- Header -->
  <header class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Migración de Base de Datos</h1>
          <p class="text-xs text-gray-500">SENA – Centro Yamboró</p>
        </div>
      </div>
      <span class="px-3 py-1.5 rounded-full text-xs font-semibold"
        [ngClass]="{
          'bg-gray-100 text-gray-600': state().status === 'idle',
          'bg-blue-100 text-blue-700': state().status === 'parsing',
          'bg-blue-600 text-white animate-pulse': state().status === 'running',
          'bg-yellow-100 text-yellow-700': state().status === 'paused',
          'bg-green-100 text-green-700': state().status === 'completed',
          'bg-red-100 text-red-700': state().status === 'error'
        }">
        {{ statusLabel[state().status] }}
      </span>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-6 py-8 space-y-6">

    <!-- Sección 1: Cargar archivo -->
    <section class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Cargar archivo Excel</h2>

      <div 
        class="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
        [ngClass]="{
          'border-blue-400 bg-blue-50': dragging(),
          'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50': !dragging()
        }"
        (click)="fileInput.click()"
        (dragover)="$event.preventDefault(); dragging.set(true)"
        (dragleave)="dragging.set(false)"
        (drop)="onDrop($event)">
        
        <input #fileInput type="file" accept=".xlsx,.xls" (change)="onFileChange($event)" hidden>

        @if (!selectedFile()) {
          <div class="space-y-3">
            <div class="text-5xl">📂</div>
            <div>
              <p class="text-base text-gray-700 font-medium">
                Arrastra el archivo Excel aquí o <span class="text-blue-600 font-bold">haz clic para seleccionar</span>
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Soporta: Base_de_datos_Aprendices_SENA_Yamboro.xlsx
              </p>
            </div>
          </div>
        } @else {
          <div class="flex items-center justify-center gap-4">
            <div class="text-5xl">📊</div>
            <div class="text-left">
              <p class="font-bold text-gray-900">{{ selectedFile()!.name }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ (selectedFile()!.size / 1024 / 1024).toFixed(2) }} MB · Clic para cambiar
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Resumen de hojas -->
      @if (sheets()) {
        <div class="mt-6">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Hojas detectadas</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            @for (s of sheetStats(); track s.name) {
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3 text-center">
                <div class="text-2xl font-bold text-blue-600">{{ s.count }}</div>
                <div class="text-xs text-gray-600 mt-1">{{ s.name }}</div>
              </div>
            }
          </div>
          <p class="text-sm text-gray-600 mt-4">
            Total: <span class="font-bold text-gray-900">{{ totalRows() }} registros</span>
          </p>
        </div>
      }
    </section>

    <!-- Indicador de carga grande (mientras procesa) -->
    @if (state().status === 'running' && state().percentage < 5) {
      <section class="bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
        <div class="flex flex-col items-center justify-center space-y-6">
          <div class="relative">
            <div class="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
          </div>
          <div class="text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Procesando archivo...</h3>
            <p class="text-sm text-gray-600">
              Analizando datos y preparando migración
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </section>
    }

    <!-- Sección 2: Progreso -->
    @if (state().status === 'running' && state().percentage >= 5 || state().status === 'paused' || state().status === 'completed' || state().status === 'error') {
      <section class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Progreso de migración</h2>

        <!-- Barra de progreso -->
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-300"
              [ngClass]="state().status === 'completed' ? 'bg-green-500' : 'bg-blue-600'"
              [style.width.%]="state().percentage">
            </div>
          </div>
          <span class="text-sm font-bold text-gray-900 min-w-[45px] text-right">
            {{ state().percentage }}%
          </span>
        </div>

        <p class="text-sm text-gray-600 mb-6">
          Fila {{ state().currentRow }} de {{ state().totalRows }}
          @if (state().currentEntity) {
            · procesando <span class="font-medium text-gray-900">{{ state().currentEntity }}</span>
          }
        </p>

        <!-- Métricas -->
        @if (state().summary) {
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="bg-green-50 border border-green-200 rounded-xl p-4">
              <div class="text-3xl font-bold text-green-600">{{ state().summary!.created }}</div>
              <div class="text-xs text-green-700 font-medium uppercase tracking-wide mt-1">Creados</div>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div class="text-3xl font-bold text-blue-600">{{ state().summary!.updated }}</div>
              <div class="text-xs text-blue-700 font-medium uppercase tracking-wide mt-1">Actualizados</div>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div class="text-3xl font-bold text-gray-600">{{ state().summary!.skipped }}</div>
              <div class="text-xs text-gray-700 font-medium uppercase tracking-wide mt-1">Omitidos</div>
            </div>
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
              <div class="text-3xl font-bold text-red-600">{{ state().summary!.errors }}</div>
              <div class="text-xs text-red-700 font-medium uppercase tracking-wide mt-1">Errores</div>
            </div>
          </div>

          <!-- Desglose por entidad -->
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Desglose por entidad</h3>
          <div class="space-y-2">
            @for (entry of entityBreakdown(); track entry.entity) {
              <div class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <span class="text-sm font-medium text-gray-900 capitalize min-w-[140px]">{{ entry.entity }}</span>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    +{{ entry.created }}
                  </span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    ≈{{ entry.updated }}
                  </span>
                  <span class="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                    –{{ entry.skipped }}
                  </span>
                  @if (entry.errors > 0) {
                    <span class="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      ✗{{ entry.errors }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Duración -->
        @if (state().summary?.durationMs) {
          <p class="text-sm text-gray-600 mt-4">
            Tiempo total: <span class="font-bold text-gray-900">{{ formatDuration(state().summary!.durationMs!) }}</span>
          </p>
        }
      </section>
    }

    <!-- Sección 3: Log -->
    @if (state().logs.length > 0) {
      <section class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">Registro de actividad</h2>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="autoScroll" 
                class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
              <span class="text-xs text-gray-600">Auto-scroll</span>
            </label>
            <button (click)="clearLogs()" 
              class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Limpiar
            </button>
          </div>
        </div>

        <div class="h-64 overflow-y-auto bg-gray-900 font-mono text-xs leading-relaxed p-4 space-y-1" #logBox>
          @for (entry of visibleLogs(); track $index) {
            <div class="flex items-baseline gap-2">
              <span class="text-gray-500 min-w-[70px] flex-shrink-0">
                {{ entry.timestamp | date:'HH:mm:ss' }}
              </span>
              <span class="min-w-[16px]">
                {{ logIcons[entry.level] }}
              </span>
              <span class="flex-1"
                [ngClass]="{
                  'text-gray-300': entry.level === 'info',
                  'text-green-400': entry.level === 'success',
                  'text-yellow-400': entry.level === 'warning',
                  'text-red-400': entry.level === 'error'
                }">
                {{ entry.message }}
              </span>
              @if (entry.details) {
                <span class="text-gray-500 text-[11px]">{{ entry.details }}</span>
              }
            </div>
          }
        </div>

        @if (state().logs.length > 100) {
          <p class="text-xs text-gray-500 text-center py-2 border-t border-gray-200">
            Mostrando los últimos 100 de {{ state().logs.length }} entradas
          </p>
        }
      </section>
    }

    <!-- Sección 4: Errores -->
    @if (errorResults().length > 0) {
      <section class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">
          Registros con errores ({{ errorResults().length }})
        </h2>
        
        <div class="overflow-x-auto rounded-lg border border-gray-200 mb-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fila</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Entidad</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Identificador</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Error</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (r of errorResults().slice(0, 50); track $index) {
                <tr class="hover:bg-red-50 transition-colors">
                  <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ r.rowIndex + 1 }}</td>
                  <td class="px-4 py-3 text-sm">
                    <code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                      {{ r.entity }}
                    </code>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ r.identifier }}</td>
                  <td class="px-4 py-3 text-sm text-red-600 max-w-md">{{ r.error }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (errorResults().length > 50) {
          <p class="text-xs text-gray-500 mb-4">
            … y {{ errorResults().length - 50 }} más. Exporta el informe para ver todos.
          </p>
        }

        <button (click)="exportErrors()" 
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Exportar errores como CSV
        </button>
      </section>
    }

  </main>

  <!-- Footer / Acciones -->
  <footer class="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-end gap-3">

      @if (state().status === 'idle' || state().status === 'parsing') {
        <button 
  [disabled]="!sheets() || state().status === 'parsing'"
  (click)="start()"
  class="group relative flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
  [style.background]="'linear-gradient(to right, #2563eb, #1d4ed8)'">
  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
  <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
  <span class="relative z-10">Iniciar migración</span>
</button>
      }

      @if (state().status === 'running') {
        <button (click)="pause()" 
          class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg">
          ⏸ Pausar
        </button>
        <button (click)="stop()" 
          class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg">
          ⏹ Detener
        </button>
      }

      @if (state().status === 'paused') {
        <button (click)="resume()" 
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg">
          ▶ Reanudar
        </button>
        <button (click)="stop()" 
          class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg">
          ⏹ Detener
        </button>
      }

      @if (state().status === 'completed' || state().status === 'error') {
        <button (click)="reset()" 
          class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-bold rounded-xl transition-colors border border-gray-300">
          🔄 Nueva migración
        </button>
        <button (click)="exportReport()" 
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-colors shadow-lg">
          📊 Exportar informe
        </button>
      }

    </div>
  </footer>

</div>
  `
})
export class MigrationComponent implements OnInit, OnDestroy {

  // ── Signals de la UI ──
  readonly selectedFile = signal<File | null>(null);
  readonly sheets       = signal<ParsedSheets | null>(null);
  readonly dragging     = signal(false);

  // ── Config por defecto (sin modificaciones del usuario) ──
  private readonly cfg: MigrationConfig = { ...DEFAULT_MIGRATION_CONFIG };

  autoScroll = true;

  // ── Inyección del servicio (expone el estado) ──
  get state() { return this.migrationSvc.state; }

  // ── Labels / iconos ──
  readonly statusLabel: Record<string, string> = {
    idle: 'Listo', parsing: 'Analizando',
    running: 'En proceso', paused: 'Pausado',
    completed: 'Completado', error: 'Con errores'
  };
  readonly logIcons: Record<MigrationLogEntry['level'], string> = {
    info: '·', success: '✓', warning: '⚠', error: '✗'
  };

  // ── Computed ──
  readonly totalRows = computed(() => {
    const s = this.sheets();
    if (!s) return 0;
    return s.yamboro.length + s.deportes.length + s.cancelados.length +
           s.acumulado.length + s.aprendices2025.length +
           s.aprendices2025111.length + s.instructores.length;
  });

  readonly sheetStats = computed(() => {
    const s = this.sheets();
    if (!s) return [];
    return [
      { name: 'Yamboró',      count: s.yamboro.length },
      { name: 'Deportes',     count: s.deportes.length },
      { name: 'Cancelados',   count: s.cancelados.length },
      { name: 'Acumulado',    count: s.acumulado.length },
      { name: '2025 v1',      count: s.aprendices2025.length },
      { name: '2025 v2',      count: s.aprendices2025111.length },
      { name: 'Instructores', count: s.instructores.length }
    ];
  });

  readonly visibleLogs = computed(() =>
    this.state().logs.slice(-100)
  );

  readonly errorResults = computed(() =>
    this.state().summary?.results.filter(r => r.action === 'error') ?? []
  );

  readonly entityBreakdown = computed(() => {
    const eb = this.state().summary?.entityBreakdown;
    if (!eb) return [];
    return Object.entries(eb).map(([entity, counts]) => ({
      entity: entity as EntityType, ...counts
    }));
  });

  constructor(
    private readonly migrationSvc: MigrationService,
    private readonly parser: ExcelParserService
  ) {}

  ngOnInit(): void {}
  ngOnDestroy(): void { this.migrationSvc.stop(); }

  // ── Manejo de archivo ──
  onFileChange(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) this.loadFile(f);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const f = event.dataTransfer?.files?.[0];
    if (f) this.loadFile(f);
  }

  private async loadFile(file: File): Promise<void> {
    this.selectedFile.set(file);
    const sheets = await this.migrationSvc.loadFile(file);
    this.sheets.set(sheets);
  }

  // ── Acciones ──
  async start(): Promise<void> {
  const file = this.selectedFile();
  if (!file) return;

  try {
    // 1. Cambiamos el estado a 'parsing' (Analizando Excel)
    this.migrationSvc.patchState({ 
      status: 'parsing', 
      percentage: 0, 
      currentRow: 0 
    });

    // 2. El ExcelParserService lee el archivo y lo convierte en objetos JSON
    const sheets = await this.migrationSvc.loadFile(file);

    // 3. Iniciamos la "Orquesta": startMigration recorre el array
    // y hace peticiones individuales por cada aprendiz/instructor.
    // ESTO es lo que mueve la barra de 0 a 100.
    await this.migrationSvc.startMigration(sheets);

    console.log('✅ Proceso finalizado');

  } catch (error) {
    this.migrationSvc.patchState({ status: 'error' });
    console.error('❌ Error crítico:', error);
  }
}

  pause():  void { this.migrationSvc.pause(); }
  resume(): void { this.migrationSvc.resume(); }
  stop():   void { this.migrationSvc.stop(); }

  reset(): void {
    this.selectedFile.set(null);
    this.sheets.set(null);
    this.migrationSvc.reset();
  }

  clearLogs(): void {
    // Implementar método en el servicio si es necesario
  }

  // ── Exportar informe de errores como CSV ──
  exportErrors(): void {
    const rows = this.errorResults();
    if (!rows.length) return;

    const header = 'Fila,Entidad,Identificador,Error\n';
    const csv    = rows.map(r =>
      `${r.rowIndex + 1},"${r.entity}","${r.identifier}","${(r.error ?? '').replace(/"/g, '""')}"`
    ).join('\n');

    this.downloadCsv('errores_migracion.csv', header + csv);
  }

  exportReport(): void {
    const s = this.state().summary;
    if (!s) return;

    const header = 'Fila,Entidad,Accion,Identificador,Duracion_ms,Error\n';
    const csv    = s.results.map(r =>
      `${r.rowIndex + 1},"${r.entity}","${r.action}","${r.identifier}",${r.duration ?? ''},"${(r.error ?? '').replace(/"/g, '""')}"`
    ).join('\n');

    this.downloadCsv('informe_migracion.csv', header + csv);
  }

  private downloadCsv(filename: string, content: string): void {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ──
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const m = Math.floor(ms / 60000);
    const s = Math.round((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  }
}
// ─────────────────────────────────────────────────────────
// Tipos de entidades
// ─────────────────────────────────────────────────────────
export type EntityType = 
  | 'persona'
  | 'programa'
  | 'ficha'
  | 'matricula'
  | 'etapa_practica'
  | 'instructor';

export type MigrationAction = 'created' | 'updated' | 'skipped' | 'error';
export type MigrationStatus = 'idle' | 'parsing' | 'running' | 'paused' | 'completed' | 'error';

// ─────────────────────────────────────────────────────────
// Modelos de dominio
// ─────────────────────────────────────────────────────────
export interface Persona {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono?: string;
  correo?: string;
  municipio?: string;
  estado: string;
}

export interface Ficha {
  idFicha: string;
  nombrePrograma?: string;
  nivel?: string;
  fechaInicioFicha?: string;
  fechaFinLectiva?: string;
  fechaFin?: string;
  estadoCurso?: string;
  sede?: string;
}

export interface Matricula {
  fichaNumero: string;
  estado?: string;
  promover?: number;
  productiva?: number;
  ingles?: number;
  tecnico?: number;
  totalRap?: number;
  totPromover?: number;
  totProductiva?: number;
  totIngles?: number;
  totTecnico?: number;
  totalRaps?: number;
  totalRapsPrograma?: number;
  porcentajeEjecucion?: number;
  fechaReporte?: string;
}

export interface EtapaPractica {
  tipoAlternativa?: string;
  empresa?: string;
  direccionEmpresa?: string;
  telefonoEmpresa?: string;
  ciudadEmpresa?: string;
  correoEmpresa?: string;
  fechaInicio?: string;
  fechaFin?: string;
  novedades?: string;
  instructorAsignado?: string;
  cumpleEP?: string;
  estadoAprendiz?: string;
  proyecto?: string;
}

export interface Instructor {
  nombre: string;
  area?: string;
  celular?: string;
  correo?: string;
}

// ─────────────────────────────────────────────────────────
// Fila parseada del Excel
// ─────────────────────────────────────────────────────────
export interface MigrationRow {
  instructorAsignado?: string;
  estado?: string;
  nombreAprendiz?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  ficha?: string;
  nivel?: string;
  titulado?: string;
  telefonoAprendiz?: string;
  correo?: string;
  municipioResidencia?: string;
  tipoAlternativa?: string;
  empresa?: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  correoEmpresa?: string;
  fechaInicio?: string;
  fechaFin?: string;
  novedades?: string;
  instructorSeguimiento?: string;
  cumpleEP?: string;
  estadoAprendiz?: string;
  proyecto?: string;
  fechaReporte?: string;
  rapPromover?: number;
  rapProductiva?: number;
  rapIngles?: number;
  rapTecnico?: number;
  totalRaps?: number;
  fechaInicioTitulado?: string;
  fechaFinLectiva?: string;
  fechaFinTitulado?: string;
  fechaCon18Meses?: string;
  estadoFichaTerminada?: string;
  estadoFicha?: string;
  sede?: string;
  nombre?: string;
  apellidos?: string;
  promover?: number;
  productiva?: number;
  ingles?: number;
  tecnico?: number;
  totaraps?: number;
  totProm?: number;
  totProd?: number;
  totIngle?: number;
  totTecnico?: number;
  totalRapsPrograma?: number;
  porcentajeEjecucion?: number;
}

// ─────────────────────────────────────────────────────────
// Resultados de migración
// ─────────────────────────────────────────────────────────
export interface MigrationResult {
  rowIndex: number;
  entity: EntityType;
  action: MigrationAction;
  identifier: string;
  error?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  duration: number;
}

export interface EntityStats {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface MigrationSummary {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  results: MigrationResult[];
  entityBreakdown: {
    persona: EntityStats;
    programa: EntityStats;
    ficha: EntityStats;
    matricula: EntityStats;
    etapa_practica: EntityStats;
    instructor: EntityStats;
  };
}

// ─────────────────────────────────────────────────────────
// Estado de la migración
// ─────────────────────────────────────────────────────────
export interface MigrationLogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
}

export interface MigrationState {
  status: MigrationStatus;
  currentRow: number;
  totalRows: number;
  percentage: number;
  logs: MigrationLogEntry[];
  currentEntity?: string;
  summary?: MigrationSummary;
}

// ─────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────
export interface MigrationConfig {
  apiBaseUrl: string;
  batchSize: number;
  delayBetweenBatches: number;
  stopOnError: boolean;
  updateOnConflict: boolean;
  skipDuplicates: boolean;
  dryRun: boolean;
}

export const DEFAULT_MIGRATION_CONFIG: MigrationConfig = {
  apiBaseUrl: '/api',
  batchSize: 50,
  delayBetweenBatches: 100,
  stopOnError: false,
  updateOnConflict: true,
  skipDuplicates: true,
  dryRun: false
};
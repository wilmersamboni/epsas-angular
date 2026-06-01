const BASE  = '/api';
const BASE2 = '/api2';

export type Modulo =
  // ── backend-epsas (api) ────────────────────────────────
  | 'personas' | 'matriculas' | 'cursos' | 'programas' | 'areas'
  | 'usuarios' | 'credenciales'
  // ── catálogos internos (no pestaña) ───────────────────
  | 'sedes' | 'centros' | 'roles' | 'municipios' | 'aplicativos' | 'departamentos'
  // ── backend-practica-hexagonal (api2) ─────────────────
  | 'empresas' | 'modalidades' | 'etapas' | 'asignaciones'
  | 'seguimientos' | 'bitacoras' | 'observaciones' | 'formatos';

export interface Selector {
  /** Módulo del que se cargan las opciones */
  modulo: Modulo;
  /** Campo a mostrar como etiqueta en el <select> */
  label: string;
  /** Campo a usar como valor (el FK que se envía al backend) */
  value: string;
  /**
   * Filtro opcional: solo incluye items donde item[campo] === valor.
   * Útil para filtrar personas por cargo, etc.
   * Ejemplo: { cargo: 'aprendiz' }
   */
  filtro?: Record<string, any>;
}

export interface ModuloConfig {
  label:      string;
  idKey:      string;
  listar:     string;
  crear:      string | null;
  actualizar: ((id: string) => string) | null;
  eliminar:   ((id: string) => string) | null;
  columnas?: string[];
  campos?: string[];
  selectores?: Record<string, Selector>;
  tiposCampo?: Record<string, 'date' | 'number' | 'email' | 'text'>;
  usePatch?: boolean;
  grupo?: 'epsas' | 'practica';
  /** Opciones estáticas para dropdowns sin módulo externo */
  opcionesEstaticas?: Record<string, { label: string; value: string }[]>;
}
export const CONFIG: Record<Modulo, ModuloConfig> = {

  // ── Catálogos (algunos visibles como pestaña) ──────────────────────────

  departamentos: {
    label: 'Departamentos', idKey: 'idDepartamento',
    listar: `${BASE}/departamentos`,
    crear: null, actualizar: null, eliminar: null,
    grupo: 'epsas',
    columnas: ['nombre'],
  },

  sedes: {
    label: 'Sedes', idKey: 'idSede',
    listar: `${BASE}/sedes`, crear: `${BASE}/sedes`,
    actualizar: id => `${BASE}/sede/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/sede/eliminar_jwsv/${id}`,
    campos: ['nombre', 'centroFormacionId'],
    selectores: {
      centroFormacionId: { modulo: 'centros', label: 'nombre', value: 'idCentro' },
    },
  },

  centros: {
    label: 'Centros', idKey: 'idCentro',
    listar: `${BASE}/centro-formacion`, crear: `${BASE}/centro-formacion`,
    actualizar: id => `${BASE}/centro/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/centro/elimimar_jwsv/${id}`,
    campos: ['nombre', 'direccion', 'municipioId'],
    selectores: {
      municipioId: { modulo: 'municipios', label: 'nombre', value: 'idMunicipio' },
    },
  },

  roles: {
    label: 'Roles', idKey: 'idRol',
    listar: `${BASE}/roles`, crear: `${BASE}/roles`,
    actualizar: id => `${BASE}/rol/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/rol/eliminar_jwsv/${id}`,
    columnas: ['nombre', 'aplicativo'],
    campos: ['nombre', 'aplicativoId'],
    selectores: {
      aplicativoId: { modulo: 'aplicativos', label: 'nombre', value: 'idAplicativo' },
    },
  },

  municipios: {
    label: 'Municipios', idKey: 'idMunicipio',
    listar: `${BASE}/municipios`, crear: `${BASE}/municipio/registrar_jwsv`,
    actualizar: id => `${BASE}/municipio/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/municipio/eliminar_jwsv/${id}`,
    grupo: 'epsas',
    columnas: ['nombre', 'departamento'],
    campos: ['nombre', 'departamentoId'],
    selectores: {
      departamentoId: { modulo: 'departamentos', label: 'nombre', value: 'idDepartamento' },
    },
  },

  aplicativos: {
    label: 'Aplicativos', idKey: 'idAplicativo',
    listar: `${BASE}/aplicativos`, crear: `${BASE}/aplicativo/registrar_jwsv`,
    actualizar: id => `${BASE}/aplicativo/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/aplicativo/eliminar_jwsv/${id}`,
    campos: ['nombre'],
  },

  // ── Módulos api (backend-epsas) ───────────────────────────────────────

  personas: {
    label: 'Personas', idKey: 'idPersona',
    listar: `${BASE}/personas`, crear: `${BASE}/personas`,
    actualizar: id => `${BASE}/personas/${id}`,
    eliminar:   id => `${BASE}/personas/${id}`,
    grupo: 'epsas',
    campos: ['nombre', 'cedula', 'telefono', 'municipioId', 'direccion', 'correo', 'genero', 'cargo', 'estado'],
    selectores: {
      municipioId: { modulo: 'municipios', label: 'nombre', value: 'idMunicipio' },
    },
    tiposCampo: {
      cedula:   'number',
      telefono: 'number',
      correo:   'email',
    },
  },

  matriculas: {
    label: 'Matrículas', idKey: 'idMatricula',
    listar: `${BASE}/matriculas`, crear: `${BASE}/matriculas`,
    actualizar: id => `${BASE}/matriculas/${id}`,
    eliminar:   id => `${BASE}/matriculas/${id}`,
    grupo: 'epsas',
    columnas: ['estudiante', 'curso'],
    campos: ['persona', 'curso'],
    selectores: {
      persona: { modulo: 'personas', label: 'nombre', value: 'idPersona' },
      curso:   { modulo: 'cursos',   label: 'codigo', value: 'idCurso'  },
    },
  },

  cursos: {
    label: 'Cursos', idKey: 'idCurso',
    listar: `${BASE}/cursos`, crear: `${BASE}/cursos`,
    actualizar: id => `${BASE}/curso/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/curso/eliminar_jwsv/${id}`,
    grupo: 'epsas',
    // area, programa y lider vienen como objetos anidados (eager); aplanarFila extrae 'nombre'
    columnas: ['codigo', 'area', 'programa', 'lider', 'fechaInicio', 'fechaFin'],
    campos: ['codigo', 'fechaInicio', 'fechaFin', 'finLectiva', 'areaId', 'programaId', 'liderId'],
    selectores: {
      areaId:     { modulo: 'areas',     label: 'nombre', value: 'idArea'     },
      programaId: { modulo: 'programas', label: 'nombre', value: 'idPrograma' },
      liderId:    { modulo: 'personas',  label: 'nombre', value: 'idPersona'  },
    },
    tiposCampo: {
      fechaInicio: 'date',
      fechaFin:    'date',
      finLectiva:  'date',
    },
  },

  programas: {
    label: 'Programas', idKey: 'idPrograma',
    listar: `${BASE}/programas`, crear: `${BASE}/programas`,
    actualizar: id => `${BASE}/programas/${id}`,
    eliminar:   id => `${BASE}/programas/${id}`,
    grupo: 'epsas',
    usePatch: true,
    columnas: ['nombre', 'tipo'],
    campos: ['nombre', 'tipo'],
  },

  areas: {
    label: 'Áreas', idKey: 'idArea',
    listar: `${BASE}/areas`, crear: `${BASE}/areas`,
    actualizar: id => `${BASE}/areas/${id}`,
    eliminar:   id => `${BASE}/areas/${id}`,
    grupo: 'epsas',
    // sede viene como objeto anidado (eager); aplanarFila extrae 'nombre'
    columnas: ['nombre', 'sede'],
    campos: ['nombre', 'sedeId'],
    selectores: {
      sedeId: { modulo: 'sedes', label: 'nombre', value: 'idSede' },
    },
  },

  usuarios: {
    label: 'Usuarios', idKey: 'idUsuario',
    listar: `${BASE}/usuarios`, crear: `${BASE}/usuarios`,
    actualizar: id => `${BASE}/usuarios/${id}`,
    eliminar:   id => `${BASE}/usuarios/${id}`,
    grupo: 'epsas',
    columnas: ['persona', 'aplicativo'],
    campos: ['personaId', 'aplicativoId'],
    selectores: {
      personaId:    { modulo: 'personas',    label: 'nombre', value: 'idPersona'    },
      aplicativoId: { modulo: 'aplicativos', label: 'nombre', value: 'idAplicativo' },
    },
  },

  credenciales: {
    label: 'Credenciales', idKey: 'idCredencial',
    listar: `${BASE}/credenciales`, crear: `${BASE}/credenciales`,
    actualizar: id => `${BASE}/credenciales/${id}`,
    eliminar:   id => `${BASE}/credenciales/${id}`,
    grupo: 'epsas',
    usePatch: true,
    columnas: ['login', 'rol', 'usuario'],
    campos: ['login', 'password', 'rolId', 'usuarioId'],
    selectores: {
      rolId:     { modulo: 'roles',    label: 'nombre',  value: 'idRol'     },
      usuarioId: { modulo: 'usuarios', label: 'persona', value: 'idUsuario' },
    },
  },

  // ── Módulos api2 (backend-practica-hexagonal) ────────────────────────

 empresas: {
    label: 'Empresas', idKey: 'id',
    listar: `${BASE2}/empresas`, crear: `${BASE2}/empresas`,
    actualizar: id => `${BASE2}/empresas/${id}`,
    eliminar:   id => `${BASE2}/empresas/${id}`,
    grupo: 'practica',
    usePatch: true,
    columnas: ['nit', 'nombre', 'municipio', 'telefono', 'correo', 'estado'],
    campos: ['nit', 'nombre', 'direccion', 'telefono', 'correo', 'municipio', 'estado', 'tipo', 'longitud', 'latitud'],
    selectores: {
      municipio: { modulo: 'municipios', label: 'nombre', value: 'idMunicipio' },
    },
    tiposCampo: {
      correo:   'email',
      longitud: 'text',
      latitud:  'text',
    },
  },
  
  modalidades: {
    label: 'Modalidades', idKey: 'id',
    listar: `${BASE2}/modalidad`, crear: `${BASE2}/modalidad`,
    actualizar: id => `${BASE2}/modalidad/${id}`,
    eliminar:   id => `${BASE2}/modalidad/${id}`,
    grupo: 'practica',
    usePatch: true,
    campos: ['nombre'],
  },

 etapas: {
    label: 'Etapas Prácticas', idKey: 'id',
    listar: `${BASE2}/etapa-practica`, crear: `${BASE2}/etapa-practica`,
    actualizar: id => `${BASE2}/etapa-practica/${id}`,
    eliminar:   id => `${BASE2}/etapa-practica/${id}`,
    grupo: 'practica',
    usePatch: true,
    columnas: ['empresa', 'modalidad', 'estado', 'fecha_inicio', 'fecha_fin', 'avance'],
    campos: ['empresaId', 'modalidadId', 'matriculaId', 'fecha_inicio', 'fecha_fin', 'estado', 'observacion'],
    selectores: {
      empresaId:   { modulo: 'empresas',    label: 'nombre',     value: 'id' },
      modalidadId: { modulo: 'modalidades', label: 'nombre',     value: 'id' },
      matriculaId: { modulo: 'matriculas',  label: 'estudiante', value: 'idMatricula', filtro: { cargo: 'aprendiz' } },
    },
    opcionesEstaticas: {
      estado: [
        { label: 'Activo',   value: 'activo'   },
        { label: 'Inactivo', value: 'inactivo' },
      ],
    },
    tiposCampo: {
      fecha_inicio: 'date',
      fecha_fin:    'date',
    },
  },

  asignaciones: {
    label: 'Asignaciones', idKey: 'id',
    listar: `${BASE2}/asignaciones`, crear: `${BASE2}/asignaciones`,
    actualizar: id => `${BASE2}/asignaciones/${id}`,
    eliminar:   id => `${BASE2}/asignaciones/${id}`,
    grupo: 'practica',
    usePatch: true,
    columnas: ['instructor', 'fecha_inicio', 'fecha_fin', 'estado', 'horas'],
    campos: ['etapaId', 'instructor', 'fecha_inicio', 'fecha_fin', 'estado', 'horas'],
    selectores: {
      etapaId:    { modulo: 'etapas',   label: 'aprendiz', value: 'id' },
      instructor: { modulo: 'personas', label: 'nombre',   value: 'idPersona', filtro: { cargo: 'instructor' } },
    },
    opcionesEstaticas: {
      estado: [
        { label: 'Activo',   value: 'activo'   },
        { label: 'Inactivo', value: 'inactivo' },
      ],
    },
    tiposCampo: {
      fecha_inicio: 'date',
      fecha_fin:    'date',
      horas:        'number',
    },
  },

  seguimientos: {
      label: 'Seguimientos', idKey: 'id',
      listar: `${BASE2}/seguimientos`, crear: `${BASE2}/seguimientos`,
      actualizar: id => `${BASE2}/seguimientos/${id}`,
      eliminar:   id => `${BASE2}/seguimientos/${id}`,
      grupo: 'practica',
      usePatch: true,
      columnas: ['aprendiz', 'estado', 'observacion', 'fecha_inicio', 'fecha_fin'],
      campos: ['etapaId', 'asignacionId', 'observacion', 'fecha_inicio', 'fecha_fin', 'estado'],
      selectores: {
        etapaId:      { modulo: 'etapas',       label: 'aprendiz',   value: 'id' },
        asignacionId: { modulo: 'asignaciones', label: 'instructor', value: 'id' },
      },
      opcionesEstaticas: {
        estado: [
          { label: 'Activo',   value: 'activo'   },
          { label: 'Inactivo', value: 'inactivo' },
        ],
      },
      tiposCampo: {
        fecha_inicio: 'date',
        fecha_fin:    'date',
    },
  },

  bitacoras: {
    label: 'Bitácoras', idKey: 'id',
    listar: `${BASE2}/bitacoras`, crear: `${BASE2}/bitacoras`,
    actualizar: id => `${BASE2}/bitacoras/${id}`,
    eliminar:   id => `${BASE2}/bitacoras/${id}`,
    grupo: 'practica',
    usePatch: true,
    // seguimiento llega como objeto anidado → ocultar con columnas explícitas
    columnas: ['fecha', 'estado', 'bitacora_pdf'],
    campos: ['seguimientoId', 'fecha', 'bitacora_pdf', 'estado'],
    tiposCampo: {
      fecha: 'date',
    },
  },

  observaciones: {
    label: 'Observaciones', idKey: 'id',
    listar: `${BASE2}/observaciones`, crear: `${BASE2}/observaciones`,
    actualizar: id => `${BASE2}/observaciones/${id}`,
    eliminar:   id => `${BASE2}/observaciones/${id}`,
    grupo: 'practica',
    usePatch: true,
    // 'persona' guarda un UUID de la tabla personas → el selector lo resuelve al nombre
    columnas: ['fecha', 'descripcion', 'persona', 'evidencia_foto'],
    campos: ['seguimientoId', 'fecha', 'descripcion', 'persona', 'evidencia_foto'],
    selectores: {
      persona: { modulo: 'personas', label: 'nombre', value: 'idPersona' },
    },
    tiposCampo: {
      fecha: 'date',
    },
  },

  formatos: {
    label: 'Formatos', idKey: 'id',
    listar: `${BASE2}/formatos`, crear: null,
    actualizar: id => `${BASE2}/formatos/${id}`,
    eliminar:   id => `${BASE2}/formatos/${id}`,
    grupo: 'practica',
    usePatch: true,
    columnas: ['tipo', 'nombre_original', 'mime_type', 'estado'],
    campos: ['tipo', 'nombre'],
  },

};


/** Módulos que NO aparecen como pestañas (catálogos internos / de referencia) */
const OCULTOS: Modulo[] = [
  'sedes', 'centros', 'roles', 'aplicativos',
];

/** Solo los módulos que aparecen como pestañas en el panel */
export const MODULOS = (Object.keys(CONFIG) as Modulo[]).filter(
  m => !OCULTOS.includes(m)
);

/** Módulos del grupo epsas (backend-epsas / api) */
export const MODULOS_EPSAS = MODULOS.filter(m => CONFIG[m].grupo === 'epsas');

/** Módulos del grupo practica (backend-practica-hexagonal / api2) */
export const MODULOS_PRACTICA = MODULOS.filter(m => CONFIG[m].grupo === 'practica');

const BASE = '/api';

export type Modulo =
  | 'personas' | 'matriculas' | 'cursos' | 'programas'
  | 'areas' | 'sedes' | 'centros'
  | 'usuarios' | 'credenciales' | 'roles'
  | 'municipios' | 'aplicativos'
  | 'departamentos'; // catálogo interno, no aparece como pestaña

export interface Selector {
  /** Módulo del que se cargan las opciones */
  modulo: Modulo;
  /** Campo a mostrar como etiqueta en el <select> */
  label: string;
  /** Campo a usar como valor (el FK que se envía al backend) */
  value: string;
}

export interface ModuloConfig {
  label:      string;
  idKey:      string;
  listar:     string;
  crear:      string | null;
  actualizar: ((id: string) => string) | null;
  eliminar:   ((id: string) => string) | null;

  /** Columnas a mostrar en la tabla (si no se define, se derivan de los datos) */
  columnas?: string[];

  /** Campos del formulario de creación/edición (independiente de los datos cargados) */
  campos?: string[];

  /**
   * Campos FK que deben renderizarse como <select>.
   * Clave: nombre del campo en el form. Valor: de dónde cargar las opciones.
   */
  selectores?: Record<string, Selector>;

  /**
   * Tipo de input HTML por campo. Por defecto 'text'.
   * Ejemplo: { fechaInicio: 'date', cedula: 'number', correo: 'email' }
   */
  tiposCampo?: Record<string, 'date' | 'number' | 'email' | 'text'>;
}

export const CONFIG: Record<Modulo, ModuloConfig> = {

  // ── Catálogo interno (no pestaña) ────────────────────────────
  departamentos: {
    label: 'Departamentos', idKey: 'idDepartamento',
    listar: `${BASE}/departamentos`,
    crear: null, actualizar: null, eliminar: null,
  },

  // ── Módulos con pestañas ──────────────────────────────────────
  personas: {
    label: 'Personas', idKey: 'idPersona',
    listar: `${BASE}/personas`, crear: `${BASE}/persona/registrar_jwsv`,
    actualizar: id => `${BASE}/persona/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/persona/eliminar_jwsv/${id}`,
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
    actualizar: id => `${BASE}/programa/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/programas/${id}`,
    campos: ['nombre', 'tipo'],
  },

  areas: {
    label: 'Áreas', idKey: 'idArea',
    listar: `${BASE}/areas`, crear: `${BASE}/areas`,
    actualizar: id => `${BASE}/area/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/area/eliminar_jwsv/${id}`,
    campos: ['nombre', 'sedeId'],
    selectores: {
      sedeId: { modulo: 'sedes', label: 'nombre', value: 'idSede' },
    },
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

  usuarios: {
    label: 'Usuarios', idKey: 'idUsuario',
    listar: `${BASE}/usuarios`, crear: `${BASE}/usuario/registrar_jwsv`,
    actualizar: id => `${BASE}/usuario/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/usuario/eliminar_jwsv/${id}`,
  },

  credenciales: {
    label: 'Credenciales', idKey: 'idCredencial',
    listar: `${BASE}/credenciales`, crear: `${BASE}/credencial/registrar_jwsv`,
    actualizar: id => `${BASE}/credencial/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/credencial/eliminar_jwsv/${id}`,
  },

  roles: {
    label: 'Roles', idKey: 'idRol',
    listar: `${BASE}/roles`, crear: `${BASE}/rol/registrar_jwsv`,
    actualizar: id => `${BASE}/rol/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/rol/eliminar_jwsv/${id}`,
  },

  municipios: {
    label: 'Municipios', idKey: 'idMunicipio',
    listar: `${BASE}/municipios`, crear: `${BASE}/municipio/registrar_jwsv`,
    actualizar: id => `${BASE}/municipio/actualizar_jwsv/${id}`,
    eliminar:   id => `${BASE}/municipio/eliminar_jwsv/${id}`,
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
};

/** Solo los módulos que aparecen como pestañas (excluye catálogos internos) */
export const MODULOS = (Object.keys(CONFIG) as Modulo[]).filter(
  m => m !== 'departamentos'
);

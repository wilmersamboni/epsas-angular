const BASE = '/api';

export type Modulo =
  | 'personas' | 'matriculas' | 'cursos' | 'programas'
  | 'areas' | 'sedes' | 'centros'
  | 'usuarios' | 'credenciales' | 'roles'
  | 'municipios' | 'aplicativos';

export interface ModuloConfig {
  label:      string;
  idKey:      string;
  listar:     string;
  crear:      string | null;
  actualizar: ((id: number) => string) | null;
  eliminar:   ((id: number) => string) | null;

   columnas?: string[];
}

export const CONFIG: Record<Modulo, ModuloConfig> = {
  personas:    { label: 'Personas',     idKey: 'id_persona',    listar: `${BASE}/persona/listar_jwsv`,     crear: `${BASE}/persona/registrar_jwsv`,     actualizar: id => `${BASE}/persona/actualizar_jwsv/${id}`,     eliminar: id => `${BASE}/persona/eliminar_jwsv/${id}`     },
  matriculas:  { label: 'Matrículas',idKey: 'id_matricula',listar: `${BASE}/matricula/listar_jwsv`,crear: `${BASE}/matricula/registrar_jwsv`,actualizar: id => `${BASE}/matricula/actualizar_jwsv/${id}`,eliminar: id => `${BASE}/matricula/eliminar_jwsv/${id}`,columnas: ['estudiante', 'curso']},
  cursos:      { label: 'Cursos',       idKey: 'id_curso',      listar: `${BASE}/curso/listar_jwsv`,       crear: `${BASE}/curso/registrar_jwsv`,       actualizar: id => `${BASE}/curso/actualizar_jwsv/${id}`,       eliminar: id => `${BASE}/curso/eliminar_jwsv/${id}`       },
  programas:   { label: 'Programas',    idKey: 'id_programa',   listar: `${BASE}/programa/listar_jwsv`,    crear: `${BASE}/programa/registrar_jwsv`,    actualizar: id => `${BASE}/programa/actualizar_jwsv/${id}`,    eliminar: id => `${BASE}/programa/eliminar_jwsv/${id}`    },
  areas:       { label: 'Áreas',        idKey: 'id_area',       listar: `${BASE}/area/listar_jwsv`,        crear: `${BASE}/area/registrar_jwsv`,        actualizar: id => `${BASE}/area/actualizar_jwsv/${id}`,        eliminar: id => `${BASE}/area/eliminar_jwsv/${id}`        },
  sedes:       { label: 'Sedes',        idKey: 'id_sede',       listar: `${BASE}/sede/listar_jwsv`,        crear: `${BASE}/sede/registrar_jwsv`,        actualizar: id => `${BASE}/sede/actualizar_jwsv/${id}`,        eliminar: id => `${BASE}/sede/eliminar_jwsv/${id}`        },
  centros:     { label: 'Centros',      idKey: 'id_centro',     listar: `${BASE}/centro/listar_jwsv`,      crear: `${BASE}/centro/registrar_jwsv`,      actualizar: id => `${BASE}/centro/actualizar_jwsv/${id}`,      eliminar: id => `${BASE}/centro/elimimar_jwsv/${id}`      },
  usuarios:    { label: 'Usuarios',     idKey: 'id_usuario',    listar: `${BASE}/usuario/listar_jwsv`,     crear: `${BASE}/usuario/registrar_jwsv`,     actualizar: id => `${BASE}/usuario/actualizar_jwsv/${id}`,     eliminar: id => `${BASE}/usuario/eliminar_jwsv/${id}`     },
  credenciales:{ label: 'Credenciales', idKey: 'id_credencial', listar: `${BASE}/credencial/listar_jwsv`,  crear: `${BASE}/credencial/registrar_jwsv`,  actualizar: id => `${BASE}/credencial/actualizar_jwsv/${id}`,  eliminar: id => `${BASE}/credencial/eliminar_jwsv/${id}`  },
  roles:       { label: 'Roles',        idKey: 'id_rol',        listar: `${BASE}/rol/listar_jwsv`,         crear: `${BASE}/rol/registrar_jwsv`,         actualizar: id => `${BASE}/rol/actualizar_jwsv/${id}`,         eliminar: id => `${BASE}/rol/eliminar_jwsv/${id}`         },
  municipios:  { label: 'Municipios',   idKey: 'id_municipio',  listar: `${BASE}/municipio/listar_jwsv`,   crear: `${BASE}/municipio/registrar_jwsv`,   actualizar: id => `${BASE}/municipio/actualizar_jwsv/${id}`,   eliminar: id => `${BASE}/municipio/eliminar_jwsv/${id}`   },
  aplicativos: { label: 'Aplicativos',  idKey: 'id_aplicativo', listar: `${BASE}/aplicativo/listar_jwsv`,  crear: `${BASE}/aplicativo/registrar_jwsv`,  actualizar: id => `${BASE}/aplicativo/actualizar_jwsv/${id}`,  eliminar: id => `${BASE}/aplicativo/eliminar_jwsv/${id}`  },

};

export const MODULOS = Object.keys(CONFIG) as Modulo[];

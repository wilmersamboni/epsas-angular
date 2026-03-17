// ── Autenticación ─────────────────────────────────────────────────────────────
export interface Usuario {
  nombre?: string;
  cargo?: string;
  correo?: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  accion: string;
  mensaje: string;
}

// ── Áreas ─────────────────────────────────────────────────────────────────────
export interface Area {
  id_area: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
}

// ── Cursos ────────────────────────────────────────────────────────────────────
export interface Curso {
  id_curso: number;
  codigo?: string;
  nombre?: string;
  estado?: string;
  fk_area?: number;
}

// ── Formatos ──────────────────────────────────────────────────────────────────
export interface Formato {
  id_formatos: number;
  nombre: string;
  formato_pdf: string;
}

// ── Persona ───────────────────────────────────────────────────────────────────
export interface Persona {
  id_persona?: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  genero?: string;
  fk_municipio?: number;
  cargo?: string;
  estado?: string;
}

// ── Respuesta genérica de listado ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  mensaje?: string;
}

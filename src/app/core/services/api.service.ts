import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Area, Curso, Formato, Persona } from '../../shared/models';

// /api  → proxy → http://localhost:3000  (backend-epsas)
// /api2 → proxy → http://localhost:3001  (epsas-bac-peq)
const BASE  = '/api';
const BASE2 = '/api2';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ── Áreas ─────────────────────────────────────────────────────────────────
  async listarAreas(params?: any): Promise<Area[]> {
    const resp: any = await firstValueFrom(this.http.get(`${BASE}/areas`, { params }));
    if (Array.isArray(resp)) return resp;
    if (resp?.data  && Array.isArray(resp.data))  return resp.data;
    if (resp?.areas && Array.isArray(resp.areas)) return resp.areas;
    return [];
  }
  async crearArea(data: Partial<Area>): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/areas`, data));
    // ✅ CORREGIDO: era POST /api/area/registrar_jwsv
  }
  async editarArea(id: number, data: Partial<Area>): Promise<any> {
    return firstValueFrom(this.http.patch(`${BASE}/areas/${id}`, data));
    // ✅ CORREGIDO: era PUT /api/area/actualizar_jwsv/:id
  }
  async eliminarArea(id: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${BASE}/areas/${id}`));
    // ✅ CORREGIDO: era DELETE /api/area/eliminar_jwsv/:id
  }

  // ── Cursos ────────────────────────────────────────────────────────────────
  async listarCursosArea(idArea: number): Promise<Curso[]> {
    return firstValueFrom(this.http.get<Curso[]>(`${BASE}/cursos/area/${idArea}`));
    // ✅ CORREGIDO: era GET /api/curso/listar_jwsv/:id
  }
  async listarCursos(): Promise<Curso[]> {
    return firstValueFrom(this.http.get<Curso[]>(`${BASE}/cursos`));
  }
  async crearCurso(data: Partial<Curso>): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/cursos`, data));
    // ✅ CORREGIDO: era POST /api/curso/registrar_jwsv
  }
  async editarCurso(id: number, data: Partial<Curso>): Promise<any> {
    return firstValueFrom(this.http.patch(`${BASE}/cursos/${id}`, data));
    // ✅ CORREGIDO: era PUT /api/curso/actualizar_jwsv/:id
  }
  async eliminarCurso(id: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${BASE}/cursos/${id}`));
    // ✅ CORREGIDO: era DELETE /api/curso/eliminar_jwsv/:id
  }

  // ── Formatos ──────────────────────────────────────────────────────────────
  // ⚠️ El backend actual NO tiene módulo de formatos. Estas rutas fallarán
  //    hasta que se implemente. Se mantienen para no romper el resto del código.
  async listarFormatos(): Promise<Formato[]> {
    return firstValueFrom(this.http.get<Formato[]>(`${BASE}/formatos`));
  }
  async subirFormato(nombre: string, file: File): Promise<any> {
    const fd = new FormData();
    fd.append('nombre', nombre);
    fd.append('archivo', file);
    return firstValueFrom(this.http.post(`${BASE}/formatos`, fd));
  }
  async eliminarFormato(id: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${BASE}/formatos/${id}`));
  }

  // ── Personas ──────────────────────────────────────────────────────────────
  async listarAprendices(): Promise<any[]> {
    const resp: any = await firstValueFrom(this.http.get(`${BASE}/personas`));
    if (Array.isArray(resp)) return resp;
    if (resp?.data       && Array.isArray(resp.data))       return resp.data;
    if (resp?.aprendices && Array.isArray(resp.aprendices)) return resp.aprendices;
    if (resp?.personas   && Array.isArray(resp.personas))   return resp.personas;
    return [];
  }
  async buscarPersona(id: number): Promise<Persona> {
    return firstValueFrom(this.http.get<Persona>(`${BASE}/personas/${id}`));
    // ✅ CORREGIDO: era GET /api/persona/buscar_jwsv/:id
  }
  async buscarPersonaPorCedula(cedula: number): Promise<any> {
    return firstValueFrom(this.http.get(`${BASE}/personas/cedula/${cedula}`));
  }
  async actualizarPersona(id: number, data: Partial<Persona>): Promise<any> {
    return firstValueFrom(this.http.patch(`${BASE}/personas/${id}`, data));
    // ✅ CORREGIDO: era PUT /api/persona/actualizar_jwsv/:id
  }
  async crearPersona(data: Partial<Persona>): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/personas`, data));
    // ✅ CORREGIDO: era POST /api/persona/registrar_jwsv
  }

  // ── Matrículas ────────────────────────────────────────────────────────────
  async listarMatriculasPorAlumno(idAlumno: number): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(
        this.http.get(`${BASE}/matriculas/persona/${idAlumno}`)
        // ✅ CORREGIDO: era GET /api/matricula/por-alumno/:id
      );
      if (Array.isArray(resp)) return resp;
      if (resp?.data       && Array.isArray(resp.data))       return resp.data;
      if (resp?.matriculas && Array.isArray(resp.matriculas)) return resp.matriculas;
      return [];
    } catch { return []; }
  }
  async listarTodasMatriculas(): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(
        this.http.get(`${BASE}/matriculas`)
        // ✅ CORREGIDO: era GET /api/matricula/todas
      );
      if (Array.isArray(resp)) return resp;
      if (resp?.data       && Array.isArray(resp.data))       return resp.data;
      if (resp?.matriculas && Array.isArray(resp.matriculas)) return resp.matriculas;
      return [];
    } catch (error) {
      console.error('Error listando todas las matrículas:', error);
      return [];
    }
  }

  // ── Prácticas / Etapa práctica (backend peq puerto 3001) ──────────────────
  async listarPracticas(): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(
        this.http.get(`${BASE2}/api/etapa-practica`)
        // ✅ CORREGIDO: era GET /api2/practica/listar
      );
      if (Array.isArray(resp)) return resp;
      if (resp?.data      && Array.isArray(resp.data))      return resp.data;
      if (resp?.practicas && Array.isArray(resp.practicas)) return resp.practicas;
      return [];
    } catch { return []; }
  }
  async listarPracticasPorMatricula(matriculaId: number): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(
        this.http.get(`${BASE2}/api/etapa-practica/matricula/${matriculaId}`)
      );
      if (Array.isArray(resp)) return resp;
      if (resp?.data && Array.isArray(resp.data)) return resp.data;
      return [];
    } catch { return []; }
  }
  async crearPractica(datos: {
    fk_matricula: number; fk_modalidad: number;
    fecha_inicio: string; fecha_fin: string;
    fk_empresa: number; estado: string; observacion: string;
  }): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE2}/api/etapa-practica`, datos)
      // ✅ CORREGIDO: era POST /api2/practica/registrar
    );
  }
  async actualizarObservacion(idPractica: number, observacion: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${BASE2}/api/etapa-practica/${idPractica}/observacion`, { observacion })
      // ✅ CORREGIDO: era PATCH /api2/practica/observacion/:id
    );
  }

  // ── Seguimientos (backend peq puerto 3001) ────────────────────────────────
  async obtenerSeguimientos(idAlumno: number): Promise<any[]> {
    const resp: any = await firstValueFrom(
      this.http.get(`${BASE2}/api/seguimientos/alumno/${idAlumno}`)
      // ✅ CORREGIDO: era GET /api2/seguimiento/listar/:id
    );
    if (Array.isArray(resp)) return resp;
    if (resp?.data         && Array.isArray(resp.data))         return resp.data;
    if (resp?.seguimientos && Array.isArray(resp.seguimientos)) return resp.seguimientos;
    return [];
  }
  async actualizarSeguimiento(id: number, datos: { observacion: string }): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${BASE2}/api/seguimientos/${id}`, datos)
      // ✅ CORREGIDO: era PUT /api2/seguimiento/actualizar/:id
    );
  }
  async subirActa(id: number, file: File): Promise<any> {
    const fd = new FormData();
    fd.append('acta', file);
    return firstValueFrom(
      this.http.patch(`${BASE2}/api/seguimientos/${id}`, fd)
      // ✅ CORREGIDO: era PUT /api2/seguimiento/acta/:id
    );
  }

  // ── Bitácoras (backend peq puerto 3001) ───────────────────────────────────
  async obtenerBitacoras(idSeguimiento: number): Promise<any[]> {
    const resp: any = await firstValueFrom(
      this.http.get(`${BASE2}/api/bitacoras/${idSeguimiento}`)
      // ✅ CORREGIDO: era GET /api2/bitacora/listar/:id
    );
    if (Array.isArray(resp)) return resp;
    if (resp?.data      && Array.isArray(resp.data))      return resp.data;
    if (resp?.bitacoras && Array.isArray(resp.bitacoras)) return resp.bitacoras;
    return [];
  }
  async actualizarEstadoBitacora(idBitacora: number, estado: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${BASE2}/api/bitacoras/${idBitacora}`, { estado })
      // ✅ CORREGIDO: era PUT /api2/bitacora/estado/:id
    );
  }
  async crearBitacoraArchivo(formData: FormData): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE2}/api/bitacoras`, formData)
      // ✅ CORREGIDO: era POST /api2/bitacora/registrar_archivo
    );
  }

  // ── Modalidades (backend peq puerto 3001) ─────────────────────────────────
  async listarModalidades(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${BASE2}/api/modalidad`)
      // ✅ CORREGIDO: era GET /api2/modalidad/listar
    );
  }

  // ── Empresas (backend peq puerto 3001) ────────────────────────────────────
  async listarEmpresas(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${BASE2}/api/empresas`)
      // ✅ CORREGIDO: era GET /api2/empresa/listar
    );
  }

  // ── Asignaciones (backend peq puerto 3001) ────────────────────────────────
  async listarAsignaciones(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE2}/api/asignaciones`));
  }
  async crearAsignacion(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE2}/api/asignaciones`, data));
  }

  // ── Observaciones (backend peq puerto 3001) ───────────────────────────────
  async listarObservaciones(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE2}/api/observaciones`));
  }
  async crearObservacion(data: any): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE2}/api/observaciones`, data));
  }

  // ── Usuarios y Credenciales (backend grande puerto 3000) ──────────────────
  async crearUsuario(data: { personaId: number; aplicativoId: number }): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/usuarios`, data)
      // ✅ CORREGIDO: era POST /api/usuario/registrar_jwsv
    );
  }
  async crearCredencial(data: {
    login: string; password: string; usuarioId: number; rolId: number;
  }): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/credenciales`, data)
      // ✅ CORREGIDO: era POST /api/credencial/registrar_jwsv
    );
  }

  // ── Roles ─────────────────────────────────────────────────────────────────
  async listarRoles(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE}/roles`));
  }

  // ── Departamentos / Municipios ────────────────────────────────────────────
  async listarDepartamentos(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE}/departamentos`));
  }
  async listarMunicipios(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE}/municipios`));
  }

  // ── Programas / Centros / Sedes ───────────────────────────────────────────
  async listarProgramas(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE}/programas`));
  }
  async listarCentrosFormacion(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE}/centro-formacion`));
  }
  async listarSedes(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE}/sedes`));
  }

  // ── Recuperación de contraseña ─────────────────────────────────────────────
  // ⚠️ Estas rutas NO existen en el backend actual. Necesitas implementarlas
  //    en el backend o eliminar estas llamadas del frontend.
  async solicitarRecuperacion(correo: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/auth/recuperar/solicitar`, { correo })
    );
  }
  async verificarCodigo(correo: string, codigo: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/auth/recuperar/verificar`, { correo, codigo })
    );
  }
  async cambiarPassword(correo: string, codigo: string, nuevoPassword: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/auth/recuperar/cambiar`, { correo, codigo, nuevoPassword })
    );
  }
}
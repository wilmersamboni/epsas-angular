import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Area, Curso, Formato, Persona } from '../../shared/models';

const BASE  = '/api';   // → http://localhost:3000 vía proxy
const BASE2 = '/api2';  // → http://localhost:3001 vía proxy

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ── Áreas ────────────────────────────────────────────────────────────────
  async listarAreas(params?: any): Promise<Area[]> {
    const resp: any = await firstValueFrom(this.http.get(`${BASE}/area/listar_jwsv`, { params }));
    if (Array.isArray(resp)) return resp;
    if (resp?.data  && Array.isArray(resp.data))  return resp.data;
    if (resp?.areas && Array.isArray(resp.areas)) return resp.areas;
    return [];
  }
  async crearArea(data: Partial<Area>): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/area/registrar_jwsv`, data));
  }
  async editarArea(id: number, data: Partial<Area>): Promise<any> {
    return firstValueFrom(this.http.put(`${BASE}/area/actualizar_jwsv/${id}`, data));
  }
  async eliminarArea(id: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${BASE}/area/eliminar_jwsv/${id}`));
  }

  // ── Cursos ────────────────────────────────────────────────────────────────
  async listarCursosArea(idArea: number): Promise<Curso[]> {
    return firstValueFrom(this.http.get<Curso[]>(`${BASE}/curso/listar_jwsv/${idArea}`));
  }
  async crearCurso(data: Partial<Curso>): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/curso/registrar_jwsv`, data));
  }
  async editarCurso(id: number, data: Partial<Curso>): Promise<any> {
    return firstValueFrom(this.http.put(`${BASE}/curso/actualizar_jwsv/${id}`, data));
  }
  async eliminarCurso(id: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${BASE}/curso/eliminar_jwsv/${id}`));
  }

  // ── Formatos ──────────────────────────────────────────────────────────────
  async listarFormatos(): Promise<Formato[]> {
    return firstValueFrom(this.http.get<Formato[]>(`${BASE}/formatos/listar_jwsv`));
  }
  async subirFormato(nombre: string, file: File): Promise<any> {
    const fd = new FormData();
    fd.append('nombre', nombre);
    fd.append('archivo', file);
    return firstValueFrom(this.http.post(`${BASE}/formatos/subir_jwsv`, fd));
  }
  async eliminarFormato(id: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${BASE}/formatos/eliminar_jwsv/${id}`));
  }

  // ── Personas / Aprendices ─────────────────────────────────────────────────
  async listarAprendices(): Promise<any[]> {
    const resp: any = await firstValueFrom(this.http.get(`${BASE}/persona/aprendices`));
    // El backend puede devolver: array directo, { data: [] }, { aprendices: [] }, etc.
    if (Array.isArray(resp)) return resp;
    if (resp?.data   && Array.isArray(resp.data))       return resp.data;
    if (resp?.aprendices && Array.isArray(resp.aprendices)) return resp.aprendices;
    if (resp?.personas   && Array.isArray(resp.personas))   return resp.personas;
    return [];
  }
  async buscarPersona(id: number): Promise<Persona> {
    return firstValueFrom(this.http.get<Persona>(`${BASE}/persona/buscar_jwsv/${id}`));
  }
  async actualizarPersona(id: number, data: Partial<Persona>): Promise<any> {
    return firstValueFrom(this.http.put(`${BASE}/persona/actualizar_jwsv/${id}`, data));
  }
  async crearPersona(data: Partial<Persona>): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/persona/registrar_jwsv`, data));
  }

  // ── Matrículas ────────────────────────────────────────────────────────────
  async listarMatriculasPorAlumno(idAlumno: number): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(this.http.get(`${BASE}/matricula/por-alumno/${idAlumno}`));
      if (Array.isArray(resp)) return resp;
      if (resp?.data      && Array.isArray(resp.data))      return resp.data;
      if (resp?.matriculas && Array.isArray(resp.matriculas)) return resp.matriculas;
      return [];
    } catch { return []; }
  }

  // ── Prácticas ─────────────────────────────────────────────────────────────
  async listarPracticas(): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(this.http.get(`${BASE2}/practica/listar`));
      if (Array.isArray(resp)) return resp;
      if (resp?.data      && Array.isArray(resp.data))      return resp.data;
      if (resp?.practicas && Array.isArray(resp.practicas)) return resp.practicas;
      return [];
    } catch { return []; }
  }
  async crearPractica(datos: {
    fk_matricula: number; fk_modalidad: number;
    fecha_inicio: string; fecha_fin: string;
    fk_empresa: number; estado: string; observacion: string;
  }): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE2}/practica/registrar`, datos));
  }
  async actualizarObservacion(idPractica: number, observacion: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${BASE2}/practica/observacion/${idPractica}`, { observacion })
    );
  }

  // ── Seguimientos ──────────────────────────────────────────────────────────
  async obtenerSeguimientos(idAlumno: number): Promise<any[]> {
    const resp: any = await firstValueFrom(this.http.get(`${BASE2}/seguimiento/listar/${idAlumno}`));
    if (Array.isArray(resp)) return resp;
    if (resp?.data         && Array.isArray(resp.data))         return resp.data;
    if (resp?.seguimientos && Array.isArray(resp.seguimientos)) return resp.seguimientos;
    return [];
  }
  async actualizarSeguimiento(id: number, datos: { observacion: string }): Promise<any> {
    return firstValueFrom(this.http.put(`${BASE2}/seguimiento/actualizar/${id}`, datos));
  }
  async subirActa(id: number, file: File): Promise<any> {
    const fd = new FormData();
    fd.append('acta', file);
    return firstValueFrom(this.http.put(`${BASE2}/seguimiento/acta/${id}`, fd));
  }

  // ── Bitácoras ─────────────────────────────────────────────────────────────
  async obtenerBitacoras(idSeguimiento: number): Promise<any[]> {
    const resp: any = await firstValueFrom(this.http.get(`${BASE2}/bitacora/listar/${idSeguimiento}`));
    if (Array.isArray(resp)) return resp;
    if (resp?.data     && Array.isArray(resp.data))     return resp.data;
    if (resp?.bitacoras && Array.isArray(resp.bitacoras)) return resp.bitacoras;
    return [];
  }
  async actualizarEstadoBitacora(idBitacora: number, estado: string): Promise<any> {
    return firstValueFrom(
      this.http.put(`${BASE2}/bitacora/estado/${idBitacora}`, { estado })
    );
  }
  async crearBitacoraArchivo(formData: FormData): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE2}/bitacora/registrar_archivo`, formData));
  }

  // ── Modalidades y Empresas ────────────────────────────────────────────────
  async listarModalidades(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE2}/modalidad/listar`));
  }
  async listarEmpresas(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE2}/empresa/listar`));
  }

  // ── Usuarios y Credenciales ───────────────────────────────────────────────
  async crearUsuario(data: { fk_persona: number; fk_aplicativo: number }): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/usuario/registrar_jwsv`, data));
  }
  async crearCredencial(data: {
    login: string; password: string; fk_usuario: number; fk_rol: number;
  }): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE}/credencial/registrar_jwsv`, data));
  }

  // ── Recuperación de contraseña ────────────────────────────────────────────
  async solicitarRecuperacion(correo: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/departamento/recuperar/solicitar`, { correo })
    );
  }
  async verificarCodigo(correo: string, codigo: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/departamento/recuperar/verificar`, { correo, codigo })
    );
  }
  async cambiarPassword(correo: string, codigo: string, nuevoPassword: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${BASE}/departamento/recuperar/cambiar`, { correo, codigo, nuevoPassword })
    );
  }
}

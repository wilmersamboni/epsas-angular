import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const BASE2 = '/api2';

@Injectable({ providedIn: 'root' })
export class PracticaService {
  constructor(private http: HttpClient) {}

  // ── Prácticas ─────────────────────────────────────────────────────────────

  async listarPracticas(): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(this.http.get(`${BASE2}/etapa-practica`));
      if (Array.isArray(resp)) return resp;
      if (resp?.data      && Array.isArray(resp.data))      return resp.data;
      if (resp?.practicas && Array.isArray(resp.practicas)) return resp.practicas;
      return [];
    } catch { return []; }
  }

  async crearPractica(datos: {
    matriculaId: string; modalidadId: string;
    fecha_inicio: string; fecha_fin: string;
    empresaId: string; estado: string; observacion: string;
    asignacion?: {
      instructor: string;
      fecha_inicio: string;
      fecha_fin: string;
      estado: string;
      horas: number;
    };
  }): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE2}/etapa-practica`, datos));
  }

  async obtenerPractica(id: string): Promise<any> {
    return firstValueFrom(this.http.get(`${BASE2}/etapa-practica/${id}`));
  }

  async actualizarPractica(id: string, datos: {
    empresaId?: string; modalidadId?: string;
    fecha_inicio?: string; fecha_fin?: string;
    estado?: string; observacion?: string;
  }): Promise<any> {
    return firstValueFrom(this.http.patch(`${BASE2}/etapa-practica/${id}`, datos));
  }

  async activarPractica(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${BASE2}/etapa-practica/${id}/activar`, {}));
  }

  async inactivarPractica(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`${BASE2}/etapa-practica/${id}/inactivar`, {}));
  }

  async actualizarAvancePractica(idPractica: string | number): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${BASE2}/etapa-practica/avance/${idPractica}`, {})
    );
  }

  /** @deprecated Usar ObservacionService.crearObservacion() */
  async actualizarObservacion(idPractica: number, observacion: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${BASE2}/etapa-practica/observacion/${idPractica}`, { observacion })
    );
  }

  // ── Asignaciones de instructor ────────────────────────────────────────────

  async listarAsignacionesPorEtapa(etapaId: string): Promise<any[]> {
    try {
      const resp: any = await firstValueFrom(
        this.http.get(`${BASE2}/asignaciones/etapa/${etapaId}`)
      );
      if (Array.isArray(resp)) return resp;
      if (resp?.data && Array.isArray(resp.data)) return resp.data;
      return [];
    } catch { return []; }
  }

  async crearAsignacion(datos: {
    instructor: string; fecha_inicio: string; fecha_fin: string;
    estado: string; horas: number; etapaId: string;
  }): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE2}/asignaciones`, datos));
  }

  async actualizarAsignacion(id: string, datos: {
    instructor?: string; fecha_inicio?: string; fecha_fin?: string;
    estado?: string; horas?: number;
  }): Promise<any> {
    return firstValueFrom(this.http.patch(`${BASE2}/asignaciones/${id}`, datos));
  }

  async eliminarAsignacion(id: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${BASE2}/asignaciones/${id}`));
  }

  // ── Modalidades y Empresas ────────────────────────────────────────────────

  async listarModalidades(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE2}/modalidad`));
  }

  async listarEmpresas(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${BASE2}/empresas`));
  }
}

import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, from } from 'rxjs';
import { ApiService } from './api.service';

export interface Stats {
  aprendices: number;
  seguimientos: number;
  documentos: number;
  instructores: number;
}

export interface DonaStats {
  total: number;
  porcentaje: number;
}

export interface DashboardData {
  stats: Stats;
  etapaActiva: DonaStats;
  etapaCertificada: DonaStats;
}

@Injectable({ providedIn: 'root' })
export class StatsService {

  constructor(private apiService: ApiService) {}

  // Mantener por compatibilidad
  getStats(): Observable<Stats> {
    return this.getDashboardData().pipe(map(d => d.stats));
  }

  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      aprendices: from(this.apiService.listarAprendices()),
      practicas:  from(this.apiService.listarPracticas()),
    }).pipe(
      map(({ aprendices, practicas }) => {

        const totalAprendices = aprendices.length;

        const activas = practicas.filter((p: any) =>
          ['activa', 'activo', 'en_curso', 'en curso']
            .includes(p.estado?.toLowerCase())
        );

        const desertadas = practicas.filter((p: any) =>
          ['desercion', 'desertada', 'desertado', 'retirado', 'retirada']
            .includes(p.estado?.toLowerCase())
        );

        const certificadas = practicas.filter((p: any) =>
          ['certificada', 'certificado', 'completada', 'completado']
            .includes(p.estado?.toLowerCase())
        );

        const instructores = aprendices.filter((p: any) =>
          p.cargo === 'instructor' || p.cargo === 'administrador'
        );

        const stats: Stats = {
          aprendices: totalAprendices,
          seguimientos: activas.length,
          documentos: desertadas.length,
          instructores: certificadas.length
        };

        const base = totalAprendices || 1;

        const etapaActiva: DonaStats = {
          total: activas.length,
          porcentaje: Math.round((activas.length / base) * 100)
        };

        const etapaCertificada: DonaStats = {
          total: certificadas.length,
          porcentaje: Math.round((certificadas.length / base) * 100)
        };

        return { stats, etapaActiva, etapaCertificada };
      })
    );
  }
}
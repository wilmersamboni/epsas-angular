import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { from } from 'rxjs';
import { ApiService } from './api.service'; // ajusta la ruta

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

  // Mantener por compatibilidad — ahora delega a getDashboardData
  getStats(): Observable<Stats> {
    return this.getDashboardData().pipe(map(d => d.stats));
  }

  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      aprendices: from(this.apiService.listarAprendices()),
      practicas:  from(this.apiService.listarPracticas()),
    }).pipe(
      map(({ aprendices, practicas }) => {

        // ── Tarjetas ────────────────────────────────────────────────────────
        const totalAprendices  = aprendices.length;

        const activas = practicas.filter(p =>
          ['activa', 'activo', 'en_curso', 'en curso'].includes(p.estado?.toLowerCase())
        );
        const desertadas = practicas.filter(p =>
          ['desercion', 'desertada', 'desertado', 'retirado', 'retirada'].includes(p.estado?.toLowerCase())
        );
        const certificadas = practicas.filter(p =>
          ['certificada', 'certificado', 'completada', 'completado'].includes(p.estado?.toLowerCase())
        );
        const instructores = aprendices.filter((p: any) =>
          p.cargo === 'instructor' || p.cargo === 'administrador'
        );

        const stats: Stats = {
          aprendices:   totalAprendices,
          seguimientos: activas.length,      // etapas productivas activas
          documentos:   desertadas.length,   // etapas desertadas
          instructores: certificadas.length  // ejecuciones con éxito
        };
        console.log('Práctica enriquecida:', practicas[0])

        // ── Donas ───────────────────────────────────────────────────────────
        const base = totalAprendices || 1; // evita división por 0

        const etapaActiva: DonaStats = {
          total:      activas.length,
          porcentaje: Math.round((activas.length / base) * 100)
        };

        const etapaCertificada: DonaStats = {
          total:      certificadas.length,
          porcentaje: Math.round((certificadas.length / base) * 100)
        };

        return { stats, etapaActiva, etapaCertificada };
      })
    );
  }
}
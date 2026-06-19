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
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    const cargo: string = user?.cargo ?? '';
      
    return forkJoin({
      aprendices: from(this.apiService.listarAprendices()),
      practicas:  from(this.apiService.listarPracticas()),
    }).pipe(
      map(({ aprendices, practicas }) => {
      
        // El backend ya filtra por RLS — no necesitamos filtrar aquí
        const practicasFiltradas = practicas;
      
        const totalAprendices = aprendices.length;
      
        const activas = practicasFiltradas.filter((p: any) =>
          ['activa', 'activo', 'en_curso', 'en curso'].includes(p.estado?.toLowerCase())
        );
        const desertadas = practicasFiltradas.filter((p: any) =>
          ['desercion', 'desertada', 'desertado', 'retirado', 'retirada'].includes(p.estado?.toLowerCase())
        );
        const certificadas = practicasFiltradas.filter((p: any) =>
          ['certificada', 'certificado', 'completada', 'completado'].includes(p.estado?.toLowerCase())
        );
      
        const totalBase = (cargo === 'instructor')
          ? practicasFiltradas.length
          : totalAprendices;
      
        const stats: Stats = {
          aprendices:   cargo === 'instructor' ? practicasFiltradas.length : totalAprendices,
          seguimientos: activas.length,
          documentos:   desertadas.length,
          instructores: certificadas.length
        };
      
        const base = Math.max(totalBase, 1);
      
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
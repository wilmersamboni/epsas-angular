import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { ProgressBar } from 'primeng/progressbar';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { StatsService, Stats, DonaStats } from '../../core/services/stats.service';
import { ApiService } from '../../core/services/api.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Card, UIChart, ProgressBar, Button, Skeleton, Tag],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  cargando        = true;
  exportando      = false;
  practicas: any[] = [];

  /** Práctica personal del aprendiz */
  miPractica: any = null;

  fecha = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  stats: Stats = { aprendices: 0, seguimientos: 0, documentos: 0, instructores: 0 };
  etapaActiva: DonaStats      = { total: 0, porcentaje: 0 };
  etapaCertificada: DonaStats = { total: 0, porcentaje: 0 };

  // ── Chart data ──────────────────────────────────────────────────────────
  chartDataEtapaActiva:      any = null;
  chartDataEtapaCertificada: any = null;
  chartDataPersonal:         any = null;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };

  readonly cargo        = computed(() => this.auth.cargo());
  readonly esAprendiz   = computed(() => this.cargo() === 'aprendiz');
  readonly esInstructor = computed(() => this.cargo() === 'instructor');
  readonly esAdmin      = computed(() => this.auth.isAdmin());

  // ── Severity para p-tag de estado ───────────────────────────────────────
  estadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const e = (estado ?? '').toLowerCase();
    if (['activo', 'activa', 'en_curso', 'en curso'].includes(e))                   return 'success';
    if (['certificado', 'certificada'].includes(e))                                  return 'info';
    if (['desercion', 'desertado', 'desertada', 'retirado', 'retirada'].includes(e)) return 'danger';
    if (['suspendido', 'suspendida'].includes(e))                                     return 'warn';
    return 'secondary';
  }
  // ── Construcción de datos para los charts ───────────────────────────────
  private buildCharts(): void {
    const total = Math.max(this.stats.aprendices, 1);

    this.chartDataEtapaActiva = {
      labels: ['En etapa productiva', 'Otros'],
      datasets: [{
        data: [this.etapaActiva.total, Math.max(0, total - this.etapaActiva.total)],
        backgroundColor: ['#39A900', '#e2e8f0'],
        hoverBackgroundColor: ['#2d8600', '#d1d5db'],
        borderWidth: 0
      }]
    };

    this.chartDataEtapaCertificada = {
      labels: ['Certificadas', 'Pendientes'],
      datasets: [{
        data: [this.etapaCertificada.total, Math.max(0, total - this.etapaCertificada.total)],
        backgroundColor: ['#2563eb', '#e2e8f0'],
        hoverBackgroundColor: ['#1d4ed8', '#d1d5db'],
        borderWidth: 0
      }]
    };
  }

  private buildChartPersonal(): void {
    const avance = this.miPractica?.avance ?? 0;
    this.chartDataPersonal = {
      labels: ['Completado', 'Pendiente'],
      datasets: [{
        data: [avance, 100 - avance],
        backgroundColor: ['#39A900', '#e2e8f0'],
        hoverBackgroundColor: ['#2d8600', '#d1d5db'],
        borderWidth: 0
      }]
    };
  }

  constructor(
    private statsService:  StatsService,
    private apiService:    ApiService,
    private exportService: ExportService,
    private auth:          AuthService,
    private toast:         ToastService,
  ) {}

  ngOnInit(): void {
    this.statsService.getDashboardData().subscribe({
      next: ({ stats, etapaActiva, etapaCertificada }) => {
        this.stats            = stats;
        this.etapaActiva      = etapaActiva;
        this.etapaCertificada = etapaCertificada;
        this.cargando         = false;
        this.buildCharts();
      },
      error: () => { this.cargando = false; }
    });

    const puedeVerEmpresas = this.auth.hasRole(['administrador', 'instructor']);

    Promise.all([
      this.apiService.listarPracticas(),
      puedeVerEmpresas ? this.apiService.listarEmpresas() : Promise.resolve([]),
      this.apiService.listarTodasMatriculas(),
    ]).then(([practicas, empresas, matriculas]: [any[], any[], any[]]) => {

      const empresaMap = new Map<string, string>(
        empresas.map((e: any) => [
          e.id,
          e.nombre ?? e.razon_social ?? e.nombreEmpresa ?? e.name ?? e.id
        ])
      );

      const matriculaMap = new Map<string, any>(
        matriculas.map((m: any) => [m.idMatricula ?? m.id, m])
      );

      this.practicas = practicas.map((p: any) => {
        const matricula = matriculaMap.get(p.matriculaId);
        const persona   = matricula?.persona;
        const curso     = matricula?.curso;
        const nombreCompleto = persona?.nombre ?? '—';

        return {
          ...p,
          empresaNombre:  p.empresa?.nombre ?? empresaMap.get(p.empresa?.id) ?? '—',
          modalidadNombre: p.modalidad?.nombre ?? '—',
          nombre:          nombreCompleto,
          identificacion:  persona?.cedula?.toString() ?? '—',
          correo:          persona?.correo ?? '—',
          telefono:        persona?.telefono?.toString() ?? '—',
          municipioPersona: persona?.municipio?.nombre ?? '—',
          ficha:           curso?.codigo ?? '—',
          programa:        curso?.programa?.nombre ?? '—',
          fechaInicioCurso: curso?.fechaInicio ?? '—',
          fechaFinCurso:    curso?.fechaFin ?? '—',
        };
      });

      if (this.esAprendiz() && this.practicas.length > 0) {
        this.miPractica = this.practicas[0];
        this.buildChartPersonal();
      }

    }).catch((err) => {
      console.error('Error cargando datos para home:', err);
      this.toast.error('Error', 'No se pudieron cargar los datos del panel.');
    });
  }

  exportarPDF(): void {
    this.exportando = true;
    setTimeout(() => {
      try {
        this.exportService.exportarPDF(
          this.stats, this.etapaActiva, this.etapaCertificada, this.practicas
        );
        this.toast.ok('PDF generado', 'El reporte fue exportado correctamente.');
      } catch {
        this.toast.error('Error', 'No se pudo generar el PDF.');
      } finally {
        this.exportando = false;
      }
    }, 100);
  }

  exportarExcel(): void {
    this.exportando = true;
    this.exportService.exportarExcel(
      this.stats, this.etapaActiva, this.etapaCertificada, this.practicas
    ).then(() => {
      this.exportando = false;
      this.toast.ok('Excel generado', 'El reporte fue exportado correctamente.');
    }).catch(() => {
      this.exportando = false;
      this.toast.error('Error', 'No se pudo generar el archivo Excel.');
    });
  }
}

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
  chartDataEstados:          any = null;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };

  chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8' }
      },
      y: {
        grid: { color: '#f1f5f9' },
        border: { display: false },
        ticks: { stepSize: 1, font: { size: 11, family: 'Inter' }, color: '#94a3b8' },
        beginAtZero: true
      }
    }
  };

  readonly cargo        = computed(() => this.auth.cargo());
  readonly esAprendiz   = computed(() => this.cargo() === 'aprendiz');
  readonly esInstructor = computed(() => this.cargo() === 'instructor');
  readonly esAdmin      = computed(() => this.auth.isAdmin());

  getInitials(nombre: string): string {
    if (!nombre || nombre === '—') return '?';
    return nombre.split(' ').filter(n => n.length > 0).slice(0, 2)
      .map(n => n[0].toUpperCase()).join('');
  }

  estadoClass(estado: string): string {
    const e = (estado ?? '').toLowerCase().trim();
    if (['activo', 'activa', 'en_curso', 'en curso', 'inactivo'].includes(e)) return 'badge-success';
    if (['certificado', 'certificada', 'por certificar'].includes(e))         return 'badge-info';
    if (['desercion', 'desertado', 'desertada', 'deserción'].includes(e))     return 'badge-danger';
    if (['suspendido', 'suspendida'].includes(e))                              return 'badge-warning';
    if (e === 'condicionado')                                                  return 'badge-condicionado';
    if (e === 'cancelado')                                                     return 'badge-cancelado';
    if (['retiro voluntario', 'retiro_voluntario'].includes(e))               return 'badge-retiro';
    return 'badge-secondary';
  }

  // ── Severity para p-tag de estado ───────────────────────────────────────
  estadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const e = (estado ?? '').toLowerCase().trim();
    if (['activo', 'activa', 'en_curso', 'en curso', 'inactivo'].includes(e)) return 'success';
    if (['certificado', 'certificada', 'por certificar'].includes(e))         return 'info';
    if (['desercion', 'desertado', 'desertada', 'cancelado'].includes(e))     return 'danger';
    if (['suspendido', 'suspendida', 'condicionado',
         'retiro voluntario', 'retiro_voluntario'].includes(e))               return 'warn';
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

  private buildChartEstados(): void {
    const conteo: Record<string, number> = {
      'activo': 0, 'certificado': 0, 'desertado': 0,
      'suspendido': 0, 'condicionado': 0, 'cancelado': 0, 'retiro voluntario': 0
    };

    this.practicas.forEach(p => {
      const e = (p.estado ?? '').toLowerCase().trim();
      if (['activo', 'activa', 'en_curso', 'en curso', 'inactivo'].includes(e))  conteo['activo']++;
      else if (['certificado', 'certificada', 'por certificar'].includes(e))      conteo['certificado']++;
      else if (['desertado', 'desertada', 'desercion', 'deserción'].includes(e)) conteo['desertado']++;
      else if (['suspendido', 'suspendida'].includes(e))                           conteo['suspendido']++;
      else if (e === 'condicionado')                                               conteo['condicionado']++;
      else if (e === 'cancelado')                                                  conteo['cancelado']++;
      else if (['retiro voluntario', 'retiro_voluntario'].includes(e))            conteo['retiro voluntario']++;
    });

    const keys   = ['activo', 'certificado', 'desertado', 'suspendido', 'condicionado', 'cancelado', 'retiro voluntario'];
    const labels = ['Activo', 'Certificado', 'Desertado', 'Suspendido', 'Condicionado', 'Cancelado', 'Retiro Vol.'];
    const colors = [
      'rgba(57,169,0,0.85)',
      'rgba(59,130,246,0.85)',
      'rgba(249,115,22,0.85)',
      'rgba(168,85,247,0.85)',
      'rgba(234,179,8,0.85)',
      'rgba(220,38,38,0.85)',
      'rgba(100,116,139,0.85)',
    ];

    this.chartDataEstados = {
      labels,
      datasets: [{
        label: 'Aprendices',
        data: keys.map(k => conteo[k]),
        backgroundColor: colors,
        borderRadius: 8,
        borderSkipped: false,
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

      if (!this.esAprendiz()) {
        this.buildChartEstados();
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

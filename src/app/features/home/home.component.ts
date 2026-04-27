import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, Stats, DonaStats } from '../../core/services/stats.service';
import { ApiService } from '../../core/services/api.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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

  readonly cargo        = computed(() => this.auth.cargo());
  readonly esAprendiz   = computed(() => this.cargo() === 'aprendiz');
  readonly esInstructor = computed(() => this.cargo() === 'instructor');
  readonly esAdmin      = computed(() => this.auth.isAdmin());

  circleDashFor(porcentaje: number): string {
    const c = 2 * Math.PI * 54;
    return `${(porcentaje / 100) * c} ${c}`;
  }

  /** Color del badge según estado */
  estadoClase(estado: string): string {
    const e = (estado ?? '').toLowerCase();
    if (['activo', 'activa', 'en_curso', 'en curso'].includes(e)) return 'badge-green';
    if (['certificado', 'certificada'].includes(e))               return 'badge-blue';
    if (['desercion', 'desertado', 'desertada'].includes(e))      return 'badge-red';
    if (['suspendido', 'suspendida'].includes(e))                  return 'badge-orange';
    return 'badge-gray';
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

        return {
          ...p,
          empresaNombre:  empresaMap.get(p.empresa?.id) ?? p.empresa?.nombre ?? '—',
          nombre:         persona
            ? `${persona.nombres ?? persona.nombre ?? ''} ${persona.apellidos ?? persona.apellido ?? ''}`.trim()
            : '—',
          identificacion: persona?.cedula        ?? persona?.documento      ?? '—',
          ficha:          curso?.codigo          ?? curso?.numeroFicha      ?? curso?.ficha ?? '—',
          programa:       curso?.programa?.nombre ?? curso?.nombrePrograma  ?? '—',
        };
      });

      // Para aprendiz: guarda su única práctica para la vista personal
      if (this.esAprendiz() && this.practicas.length > 0) {
        this.miPractica = this.practicas[0];
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

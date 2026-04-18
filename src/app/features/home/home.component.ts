import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, Stats, DonaStats } from '../../core/services/stats.service';
import { ApiService } from '../../core/services/api.service';
import { ExportService } from '../../core/services/export.service';

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

  fecha = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  stats: Stats = { aprendices: 0, seguimientos: 0, documentos: 0, instructores: 0 };
  etapaActiva: DonaStats      = { total: 0, porcentaje: 0 };
  etapaCertificada: DonaStats = { total: 0, porcentaje: 0 };

  circleDashFor(porcentaje: number): string {
    const c = 2 * Math.PI * 54;
    return `${(porcentaje / 100) * c} ${c}`;
  }

  constructor(
    private statsService:  StatsService,
    private apiService:    ApiService,
    private exportService: ExportService
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

  // Cruce completo: prácticas + empresas + matrículas + aprendices
  Promise.all([
  this.apiService.listarPracticas(),
  this.apiService.listarEmpresas(),
  this.apiService.listarTodasMatriculas(), // devuelve Matricula[] con persona y curso populados
]).then(([practicas, empresas, matriculas]: [any[], any[], any[]]) => {

  // Debug — elimina cuando funcione
  console.log('Matrícula real:', matriculas[0]);

  // id → nombre empresa
  const empresaMap = new Map<string, string>(
    empresas.map((e: any) => [
      e.id,
      e.nombre ?? e.razon_social ?? e.nombreEmpresa ?? e.name ?? e.id
    ])
  );

  // matriculaId → matrícula completa (ya trae persona y curso)
  const matriculaMap = new Map<string, any>(
    matriculas.map((m: any) => [m.idMatricula ?? m.id, m])
  );

  this.practicas = practicas.map((p: any) => {
    const matricula = matriculaMap.get(p.matriculaId);
    const persona   = matricula?.persona;
    const curso     = matricula?.curso;

    return {
      ...p,
      empresaNombre:  empresaMap.get(p.empresa?.id) ?? '—',
      nombre:         persona
        ? `${persona.nombres ?? persona.nombre ?? ''} ${persona.apellidos ?? persona.apellido ?? ''}`.trim()
        : '—',
      identificacion: persona?.cedula        ?? persona?.documento      ?? '—',
      ficha:          curso?.codigo          ?? curso?.numeroFicha      ?? curso?.ficha ?? '—',
      programa:       curso?.programa?.nombre ?? curso?.nombrePrograma  ?? '—',
    };
  });

  console.log('Práctica enriquecida:', this.practicas[0]);

}).catch((err) => {
  console.error('Error cargando datos para export:', err);
});
}

  exportarPDF(): void {
    this.exportando = true;
    setTimeout(() => {
      this.exportService.exportarPDF(
        this.stats, this.etapaActiva, this.etapaCertificada, this.practicas
      );
      this.exportando = false;
    }, 100);
  }

  exportarExcel(): void {
  this.exportando = true;
  this.exportService.exportarExcel(
    this.stats, this.etapaActiva, this.etapaCertificada, this.practicas
  ).then(() => {
    this.exportando = false;
  }).catch(() => {
    this.exportando = false;
  });
}
  
}
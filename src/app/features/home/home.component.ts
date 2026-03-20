import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, Stats } from '../../core/services/stats.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  cargando = true;
  fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  stats: Stats = {
    aprendices: 0,
    seguimientos: 0,
    documentos: 0,
    instructores: 0
  };

  // Etapa productiva — conectar al backend
  etapaProductiva = {
    total: 0,
    porcentaje: 0
  };

  get circleDash(): string {
    const circunferencia = 2 * Math.PI * 54;
    const progreso = (this.etapaProductiva.porcentaje / 100) * circunferencia;
    return `${progreso} ${circunferencia}`;
  }

  constructor(private statsService: StatsService) {}

  ngOnInit() {
    this.statsService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        // 👇 Cuando el backend devuelva etapa productiva, reemplaza esto:
        // this.etapaProductiva = data.etapaProductiva;
        this.etapaProductiva = { total: 0, porcentaje: 0 };
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
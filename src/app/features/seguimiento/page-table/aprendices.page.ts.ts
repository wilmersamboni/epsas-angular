import { Component, signal, computed } from "@angular/core";

import { AprendicesToolbarComponent } from "../components/toolbar/aprendices-toolbar.component";
import { AprendicesTableComponent } from "../components/table/aprendices-table.component";
import { TablePaginationComponent } from "../components/pagination/table-pagination.component";
import { SeguimientosModalComponent } from "../components/seguimientos-modal.component";
import { ObservacionModalComponent } from "../components/observacion-modal.component";
import { CrearPracticaModalComponent } from "../components/crear-practica-modal.component";

@Component({
  selector: 'app-aprendices-page',
  standalone: true,
  imports: [
    AprendicesToolbarComponent,
    AprendicesTableComponent,
    TablePaginationComponent,
    SeguimientosModalComponent,
    ObservacionModalComponent,
    CrearPracticaModalComponent
  ],
  template: `
  <div class="bg-white rounded-2xl shadow border">

    <app-aprendices-toolbar
      [filter]="filterValue()"
      [areas]="areas()"
      [selectedAreas]="selectedAreas()"
      [statusOptions]="statusOptions"
      [selectedStatuses]="selectedStatuses()"
      (filterChange)="filterValue.set($event)"
      (areasChange)="selectedAreas.set($event)"
      (statusChange)="selectedStatuses.set($event)"
    ></app-aprendices-toolbar>

    <app-aprendices-table
      [rows]="paged()"
      [columns]="headerColumns()"
      (seguimientos)="abrirSeguimientos($event)"
      (observacion)="abrirObservacion($event)"
      (crearPractica)="abrirCrearPractica($event)"
    ></app-aprendices-table>

    <app-table-pagination
      [page]="page()"
      [pages]="pages()"
      (pageChange)="page.set($event)"
    ></app-table-pagination>

  </div>
  `
})
export class AprendicesPage {

  // 🔎 filtro de búsqueda
  filterValue = signal('');

  // 📄 paginación
  page = signal(1);
  pageSize = 10;

  // 📂 áreas
  areas = signal<string[]>([
    'Administrativa',
    'Sistemas',
    'Contabilidad'
  ]);

  selectedAreas = signal<string[]>([]);

  // 📊 estados
  statusOptions = [
    { uid: 'activo', name: 'Activo' },
    { uid: 'practica', name: 'Práctica' },
    { uid: 'egresado', name: 'Egresado' }
  ];

  selectedStatuses = signal<string[]>([]);

  // 📑 columnas de tabla
  headerColumns = signal([
    { key: 'name', name: 'Nombre' },
    { key: 'area', name: 'Área' },
    { key: 'status', name: 'Estado' }
  ]);

  // 📊 datos de ejemplo
  rows = signal<any[]>([
    { id:1, name:'Juan Pérez', area:'Sistemas', status:'activo' },
    { id:2, name:'Laura Gómez', area:'Administrativa', status:'practica' },
    { id:3, name:'Carlos Ruiz', area:'Contabilidad', status:'egresado' }
  ]);

  // 📄 total de páginas
  pages = computed(() =>
    Math.ceil(this.rows().length / this.pageSize)
  );

  // 📄 datos paginados
  paged = computed(() => {

    const start = (this.page() - 1) * this.pageSize;
    const end = start + this.pageSize;

    return this.rows().slice(start, end);

  });

  // 🎯 acciones
  abrirSeguimientos(row:any){
    console.log('seguimientos', row);
  }

  abrirObservacion(row:any){
    console.log('observacion', row);
  }

  abrirCrearPractica(row:any){
    console.log('crear practica', row);
  }

}
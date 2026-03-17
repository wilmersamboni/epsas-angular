import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';


@Component({
  selector: 'app-aprendices-row',
  standalone: true,
  template: `
  <tr>

    <td>{{row.name}}</td>
    <td>{{row.age}}</td>
    <td>{{row.area}}</td>

    <td>
      <button (click)="seguimientos.emit(row)">📄</button>
      <button (click)="observacion.emit(row)">✏️</button>
      <button (click)="crearPractica.emit(row)">➕</button>
    </td>

  </tr>
  `
})
export class AprendicesRowComponent {

  @Input() row:any;

  @Output() seguimientos = new EventEmitter();
  @Output() observacion = new EventEmitter();
  @Output() crearPractica = new EventEmitter();

}
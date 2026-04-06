import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingButtons } from './layout/floating-buttons/floating-buttons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FloatingButtons],
  template: `
  <router-outlet></router-outlet>
  <app-floating-buttons></app-floating-buttons>
`
})
export class AppComponent {}
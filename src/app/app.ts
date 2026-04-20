import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingButtons } from './layout/floating-buttons/floating-buttons';
import { TuiRoot } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FloatingButtons, TuiRoot],
  template: `
    <tui-root>
      <router-outlet></router-outlet>
      <app-floating-buttons></app-floating-buttons>
    </tui-root>
  `
})
export class AppComponent {}
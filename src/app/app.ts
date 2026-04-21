import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingButtons } from './layout/floating-buttons/floating-buttons';
import { TuiRoot } from '@taiga-ui/core';
import { ThemeService } from './core/services/theme.service';

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
export class AppComponent implements OnInit {
  private theme = inject(ThemeService);

  ngOnInit(): void {
    this.theme.apply();  // aplica color, fuente y modo oscuro desde localStorage al inicio
  }
}
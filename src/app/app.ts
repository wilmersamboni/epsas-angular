import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingButtons } from './layout/floating-buttons/floating-buttons';
import { TuiRoot } from '@taiga-ui/core';
import { ThemeService } from './core/services/theme.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FloatingButtons, TuiRoot, ToastModule],
  template: `
    <tui-root>
      <!-- Toast global — todas las features lo comparten -->
      <p-toast position="top-right" [baseZIndex]="9999" />
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
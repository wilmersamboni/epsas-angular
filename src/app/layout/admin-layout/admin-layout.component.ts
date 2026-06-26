import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavbarComponent } from './admin-navbar.component';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminNavbarComponent, AdminSidebarComponent],
  template: `
    <div class="flex h-screen">
      <div (mouseenter)="sidebarOpen.set(true)" (mouseleave)="sidebarOpen.set(false)" class="h-screen">
        <app-admin-sidebar [open]="sidebarOpen()" />
      </div>

      <div class="flex flex-col flex-1 min-h-screen overflow-hidden" style="background:#F0F2F5;">
        <app-admin-navbar />
        <main class="p-6 flex-1 overflow-y-auto bg-[#EEF2F7]">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);
}

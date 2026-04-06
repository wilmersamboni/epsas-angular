import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * Equivalente al DefaultLayout de React:
 *
 *   export default function DefaultLayout({ children }) {
 *     const [open, setOpen] = useState(false);
 *     return (
 *       <div className="flex h-screen">
 *         <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
 *           <Sidebar open={open} />
 *         </div>
 *         <div className="flex flex-col flex-1 ...">
 *           <Navbar />
 *           <main>{children}</main>
 *         </div>
 *       </div>
 *     );
 *   }
 *
 * En Angular, {children} se reemplaza por <router-outlet>.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="flex h-screen">

      <!-- SIDEBAR (expande/colapsa al hover) -->
      <div
        (mouseenter)="sidebarOpen.set(true)"
        (mouseleave)="sidebarOpen.set(false)"
        class="h-screen"
      >
        <app-sidebar [open]="sidebarOpen()" />
      </div>

      <!-- CONTENIDO DERECHO -->
      <div class="flex flex-col flex-1 min-h-screen overflow-hidden bg-[#F0F2F5]">

        <!-- NAVBAR -->
        <app-navbar />

        <!-- PÁGINA ACTIVA — equivale a {children} en React -->
        <main class="p-6 flex-1 overflow-y-auto bg-[#EEF2F7]">
          <router-outlet />
        </main>

        <!-- FOOTER (comentado en el original, disponible aquí) -->
        <!-- <app-footer /> -->
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);
}

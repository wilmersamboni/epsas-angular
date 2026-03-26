import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Equivalente al componente Navbar de React (navbar.tsx).
 * Sustituye @heroui/navbar por HTML + Tailwind puro.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-[#F6F6F6] h-14 border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-50">

      <!-- Logo -->
      <div class="flex items-center h-14 px-4 border-b border-white/5 flex-shrink-0"
           [class.gap-3]="open" [class.justify-center]="!open">
        <img src="/img/logo.png" class="h-7 w-7 object-contain flex-shrink-0" alt="Logo" onerror="this.style.display='none'" />
        @if (open) {
          <span class="font-semibold text-sm tracking-wide">EPSAS</span>
        }
      </div>

      <!-- Marca -->
      <a routerLink="/" class="flex items-center gap-2">
        <img src="/img/logo.png" class="h-7 w-auto object-contain" alt="Logo" />
        <span class="font-semibold text-white text-sm tracking-wide">EPSAS</span>
        <span class="font-semibold text-[#007832] text-sm tracking-wide">EPSAS</span>
      </a>

      <!-- Buscador -->
      <div class="relative">
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 w-3 h-3" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          type="search"
          placeholder="Buscar..."
          class="bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#39A900]/60
                 text-xs text-white placeholder:text-white/30 rounded-md py-1.5 pl-7 pr-3 w-64
                 outline-none transition-colors"
        />
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  open: boolean = false
}

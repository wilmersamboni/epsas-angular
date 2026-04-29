import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionesCampanaComponent } from './notificaciones-campana.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NotificacionesCampanaComponent],
  template: `
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50"
            style="box-shadow: 0 1px 8px 0 rgba(0,0,0,.06);">
      <nav class="h-14 flex items-center justify-between px-5">

        <!-- ── Marca ── -->
        <a routerLink="/" class="flex items-center gap-2.5 select-none">
          <img
            src="/img/logo.png"
            class="h-8 w-8 object-contain flex-shrink-0"
            alt="EPSAS"
            onerror="this.style.display='none'"
          />
          <span class="font-bold text-[#007832] text-base tracking-wide leading-none">
            EPSAS
          </span>
        </a>

        <!-- ── Usuario ── -->
        <div class="flex items-center gap-3">

          <!-- Nombre y cargo (ocultos en móvil) -->
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-gray-800 leading-tight">{{ userName() }}</p>
            <p class="text-[11px] text-gray-400 capitalize leading-tight mt-0.5">{{ userCargo() }}</p>
          </div>

          <!-- Campana de notificaciones (solo para admin) -->
          @if (esAdmin()) {
            <app-notificaciones-campana />
          }

          <!-- Avatar con iniciales -->
          <div class="w-9 h-9 rounded-full flex items-center justify-center
                      text-sm font-bold flex-shrink-0 select-none
                      bg-[#007832]/10 text-[#007832] border-2 border-[#007832]/20">
            {{ userInitials() }}
          </div>

        </div>
      </nav>

      <!-- Marca -->
      <a routerLink="/" class="flex items-center gap-2">
        <span class="font-semibold text-[#007832] text-sm tracking-wide">EPSAS</span>
      </a>

      <!-- Buscador -->
      <div class="relative">
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 text-black/30 w-3 h-3" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          type="search"
          placeholder="Buscar..."
          class="bg-black/9 border border-white/10 hover:border-white/20 focus:border-[#39A900]/60
                 text-xs text-black placeholder:text-black/30 rounded-md py-1.5 pl-7 pr-3 w-64
                 outline-none transition-colors"
        />
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private auth = inject(AuthService);

  userName     = computed(() => this.auth.user()?.nombre ?? 'Usuario');
  userCargo    = computed(() => this.auth.user()?.cargo  ?? '');
  userInitials = computed(() =>
    (this.auth.user()?.nombre ?? 'U')
      .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  );
  esAdmin = computed(() => this.auth.cargo() === 'administrador');
}

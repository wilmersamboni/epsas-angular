import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50"
            style="box-shadow: 0 1px 8px 0 rgba(0,0,0,.06);">
      <div class="h-14 flex items-center justify-between px-5">

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

          <!-- Avatar con iniciales -->
          <div class="w-9 h-9 rounded-full flex items-center justify-center
                      text-sm font-bold flex-shrink-0 select-none
                      bg-[#007832]/10 text-[#007832] border-2 border-[#007832]/20">
            {{ userInitials() }}
          </div>

        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private auth = inject(AuthService);

  userName    = computed(() => this.auth.user()?.nombre ?? 'Usuario');
  userCargo   = computed(() => this.auth.user()?.cargo  ?? '');
  userInitials = computed(() =>
    (this.auth.user()?.nombre ?? 'U')
      .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  );
}
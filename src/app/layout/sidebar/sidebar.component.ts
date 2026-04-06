import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NavLink { label: string; href: string; safeIcon:SafeHtml }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="h-screen flex flex-col bg-[#F6F6F6] text-[#007832] border-r border-white/5
             transition-all duration-300 ease-in-out"
      [class.w-56]="open"
      [class.w-16]="!open"
    >

      <!-- Perfil -->
      <div class="px-2 py-3 border-b border-white/5"
           [class.flex]="!open" [class.justify-center]="!open">
        <div class="flex items-center gap-2 px-2">
          <div class="w-8 h-8 rounded-full bg-[#007832]/20 flex items-center justify-center
                       text-[#007832] text-xs font-bold flex-shrink-0">
            {{ userInitials }}
          </div>
          @if (open) {
            <div class="overflow-hidden">
              <p class="text-[#007832] text-xs font-medium truncate">{{ userName }}</p>
              <p class="text-white/40 text-[10px] truncate">{{ userCargo }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Navegación -->
      <nav class="flex flex-col gap-0.5 px-2 py-3 flex-1">
        @for (link of links; track link.href) {
          <a
            [routerLink]="link.href"
            routerLinkActive="bg-[#007832] text-white"
            [routerLinkActiveOptions]="{ exact: link.href === '/' }"
            [title]="!open ? link.label : ''"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                   transition-all duration-150 text-sm text-[#]/55
                   hover:text-[#acd8a7] hover:bg-white/8"
            [class.justify-center]="!open"
          >
            <!-- Usar [innerHTML] con SafeHtml para SVGs -->
            <span class="flex-shrink-0 w-[18px] h-[18px]" [innerHTML]="link.safeIcon"></span>
            @if (open) {
              <span class="font-medium">{{ link.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Cerrar sesión -->
      <div class="px-2 pb-4 border-t border-white/5 pt-2">
        <button
          (click)="auth.logout()"
          [title]="!open ? 'Cerrar sesión' : ''"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                 text-[#00783]/40 hover:text-white hover:bg-red-500/20
                 transition-all duration-150 text-sm"
          [class.justify-center]="!open"
        >
          <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7
                 a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          @if (open) {
            <span class="font-medium">Cerrar sesión</span>
          }
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() open = false;
  links: NavLink[] = [];

  constructor(public auth: AuthService, private sanitizer: DomSanitizer) {
    this.links = [
      {
        label: 'Inicio', href: '/',
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`),
      },
      {
        label: 'Seguimiento', href: '/seguimiento',
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`)      },
      {
        label: 'Historial', href: '/docs',
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`),
      },
      {
        label: 'Formatos', href: '/format',
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`),
      },
      {
        label: 'Admin', href: '/admin',
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`)      },
      {
        label: 'Migracion', href: '/migracion',
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`)
      },
    ];
  }

  get userName(): string  { return this.auth.user()?.nombre ?? 'Usuario'; }
  get userCargo(): string { return this.auth.user()?.cargo  ?? ''; }
  get userInitials(): string {
    return (this.auth.user()?.nombre ?? 'U')
      .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private safe(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
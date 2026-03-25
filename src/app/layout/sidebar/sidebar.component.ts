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
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`),
      },
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
        safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`),
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
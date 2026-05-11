import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NavLink  { label: string; href: string; safeIcon: SafeHtml; roles?: string[] }
interface NavGroup { id: string; label: string; links: NavLink[] }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="h-screen flex flex-col bg-white border-r border-gray-100
             transition-all duration-300 ease-in-out select-none"
      [class.w-56]="open"
      [class.w-16]="!open"
      style="box-shadow: 1px 0 10px 0 rgba(0,0,0,.04);"
    >

      <!-- ── Perfil ──────────────────────────────────────────── -->
      <div class="px-3 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5" [class.justify-center]="!open">
          <div class="w-8 h-8 rounded-full flex items-center justify-center
                       text-[#007832] text-xs font-bold flex-shrink-0
                       bg-[#007832]/10 border border-[#007832]/20">
            {{ userInitials }}
          </div>
          @if (open) {
            <div class="overflow-hidden">
              <p class="text-[#007832] text-xs font-semibold truncate leading-tight">{{ userName }}</p>
              <p class="text-gray-400 text-[10px] truncate capitalize leading-tight mt-0.5">{{ userCargo }}</p>
            </div>
          }
        </div>
      </div>

      <!-- ── Navegación ──────────────────────────────────────── -->
      <!-- overflow-y-auto solo cuando está abierto para que los tooltips
           del modo colapsado no queden cortados -->
      <nav class="flex-1 px-2 py-2" [class.overflow-y-auto]="open">

        @for (group of visibleGroups; track group.id; let first = $first) {

          <!-- Separador / encabezado de sección -->
          @if (open) {
            <p class="nav-section-label" [class.mt-0]="first">{{ group.label }}</p>
          } @else {
            @if (!first) {
              <hr class="border-gray-100 my-1.5 mx-2" />
            }
          }

          <!-- Links del grupo -->
          @for (link of group.links; track link.href) {
            <a
              [routerLink]="link.href"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: link.href === '/' }"
              class="nav-link"
              [class.justify-center]="!open"
            >
              <span class="flex-shrink-0 w-[18px] h-[18px]" [innerHTML]="link.safeIcon"></span>

              @if (open) {
                <span>{{ link.label }}</span>
              } @else {
                <!-- Tooltip personalizado en modo colapsado -->
                <span class="nav-tooltip">{{ link.label }}</span>
              }
            </a>
          }

        }
      </nav>

      <!-- ── Pie: cerrar sesión + versión ───────────────────── -->
      <div class="px-2 pt-2 pb-3 border-t border-gray-100">

        <button
          class="nav-logout"
          [class.justify-center]="!open"
          (click)="auth.logout()"
          [title]="!open ? 'Cerrar sesión' : ''"
        >
          <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3
                 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          @if (open) {
            <span>Cerrar sesión</span>
          }
        </button>

        
      </div>

    </aside>
  `,
  styles: [`
    /* ── Links ───────────────────────────────────────────────── */
    .nav-link {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px 9px 11px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #2B2F38;
      text-decoration: none;
      cursor: pointer;
      transition: background .15s, color .15s;
      border-left: 3px solid transparent;
    }
    .nav-link:hover {
      background: #f8fafc;
      color: #1e293b;
    }
    /* Estado activo — ThemeService sobreescribe los colores via !important */
    .nav-link-active {
      background: rgba(0, 120, 50, .08);
      color: #007832;
      border-left-color: #007832;
      font-weight: 600;
    }

    /* ── Encabezados de sección ─────────────────────────────── */
    .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .09em;
      text-transform: uppercase;
      color: #656E85;
      padding: 0 13px;
      margin: 14px 0 3px;
    }
    .nav-section-label.mt-0 { margin-top: 4px; }

    /* ── Tooltip (modo colapsado) ────────────────────────────── */
    .nav-tooltip {
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: #1e293b;
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 7px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity .15s;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
    }
    /* Flecha del tooltip */
    .nav-tooltip::before {
      content: '';
      position: absolute;
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-right-color: #1e293b;
    }
    .nav-link:hover .nav-tooltip { opacity: 1; }

    /* ── Botón cerrar sesión ─────────────────────────────────── */
    .nav-logout {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      border-radius: 8px;
      border: none;
      background: none;
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      cursor: pointer;
      transition: background .15s, color .15s;
      font-family: inherit;
    }
    .nav-logout:hover { background: #fef2f2; color: #dc2626; }

    /* ── Versión ─────────────────────────────────────────────── */
    .nav-version {
      font-size: 10px;
      color: #e2e8f0;
      font-weight: 600;
      letter-spacing: .06em;
      text-align: center;
      margin-top: 6px;
    }
  `],
})
export class SidebarComponent {
  @Input() open = false;

  private allGroups: NavGroup[] = [];

  constructor(public auth: AuthService, private sanitizer: DomSanitizer) {
    this.allGroups = [
      {
        id: 'principal',
        label: 'Principal',
        links: [
          {
            label: 'Inicio', href: '/home',
            safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`),
          },
          {
            label: 'Seguimiento', href: '/seguimiento',
            safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`),
          },
        ],
      },
      {
        id: 'modulos',
        label: 'Módulos',
        links: [
          {
            label: 'Formatos', href: '/format',
            safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`),
          },
          {
            label: 'Historial', href: '/docs',
            roles: ['administrador'],
            safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`),
          },
          {
            label: 'Migración', href: '/migracion',
            roles: ['administrador'],
            safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`),
          },
        ],
      },
      {
        id: 'sistema',
        label: 'Sistema',
        links: [
          {
            label: 'Admin', href: '/admin',
            roles: ['administrador'],
            safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`),
          },
          {
            label: 'Configuración', href: '/settings',
            safeIcon: this.safe(`<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`),
          },
        ],
      },
    ];
  }

  /** Grupos filtrados según el cargo del usuario */
  get visibleGroups(): NavGroup[] {
    const cargo = this.auth.cargo();
    return this.allGroups
      .map(g => ({
        ...g,
        links: g.links.filter(l => !l.roles || l.roles.includes(cargo)),
      }))
      .filter(g => g.links.length > 0);
  }

  get userName(): string    { return this.auth.user()?.nombre ?? 'Usuario'; }
  get userCargo(): string   { return this.auth.user()?.cargo  ?? ''; }
  get userInitials(): string {
    return (this.auth.user()?.nombre ?? 'U')
      .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private safe(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}

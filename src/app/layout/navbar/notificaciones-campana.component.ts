// ─────────────────────────────────────────────────────────────────────────────
// notificaciones-campana.component.ts
// Campana en el navbar que muestra notificaciones del sistema.
// Hace polling cada 30 s para refrescar el contador.
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, OnInit, OnDestroy, signal, computed, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService }   from '../../core/services/api.service';

interface Notificacion {
  id:        string;
  tipo:      string;
  titulo:    string;
  mensaje:   string;
  data:      Record<string, any> | null;
  leida:     boolean;
  createdAt: string;
}

@Component({
  selector:    'app-notificaciones-campana',
  standalone:  true,
  imports:     [CommonModule],
  template: `
    <div class="relative" #wrapper>

      <!-- ── Botón campana ── -->
      <button
        (click)="toggleDropdown()"
        class="relative w-9 h-9 rounded-full flex items-center justify-center
               hover:bg-gray-100 transition-colors focus:outline-none"
        title="Notificaciones">

        <!-- Icono campana -->
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0
               00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0
               .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>

        <!-- Badge contador -->
        @if (unread() > 0) {
          <span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                       rounded-full bg-red-500 text-white text-[10px] font-bold
                       flex items-center justify-center leading-none">
            {{ unread() > 99 ? '99+' : unread() }}
          </span>
        }
      </button>

      <!-- ── Panel desplegable ── -->
      @if (open()) {
        <div class="absolute right-0 top-11 w-[360px] bg-white rounded-2xl shadow-xl
                    border border-gray-100 z-[200] overflow-hidden"
             style="max-height: 520px;">

          <!-- Cabecera -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span class="font-semibold text-gray-800 text-sm">Notificaciones</span>
            @if (unread() > 0) {
              <button (click)="leerTodas()"
                class="text-xs text-[#007832] hover:underline font-medium">
                Marcar todas como leídas
              </button>
            }
          </div>

          <!-- Lista -->
          <div class="overflow-y-auto" style="max-height: 440px;">
            @if (cargando()) {
              <div class="flex justify-center py-8">
                <div class="w-5 h-5 border-2 border-[#007832]/30 border-t-[#007832]
                            rounded-full animate-spin"></div>
              </div>
            } @else if (notificaciones().length === 0) {
              <div class="text-center py-10">
                <div class="text-3xl mb-2">🔔</div>
                <p class="text-sm text-gray-500">Sin notificaciones nuevas</p>
              </div>
            } @else {
              @for (n of notificaciones(); track n.id) {
                <div
                  class="px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors"
                  [class.bg-[#007832]/5]="!n.leida"
                  [class.hover:bg-gray-50]="n.leida"
                  [class.hover:bg-[#007832]/10]="!n.leida"
                  (click)="leer(n)">

                  <!-- Fila título -->
                  <div class="flex items-start gap-2">
                    <!-- Dot no leído -->
                    @if (!n.leida) {
                      <span class="mt-1.5 w-2 h-2 rounded-full bg-[#007832] flex-shrink-0"></span>
                    } @else {
                      <span class="mt-1.5 w-2 h-2 flex-shrink-0"></span>
                    }
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-800 leading-tight truncate">
                        {{ n.titulo }}
                      </p>
                      <p class="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                        {{ n.mensaje }}
                      </p>

                      <!-- Lista de aprendices (solo para tipo aprendices_habilitados) -->
                      @if (n.tipo === 'aprendices_habilitados' && n.data?.['aprendices']?.length) {
                        <div class="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          @for (a of n.data!['aprendices'].slice(0, 8); track a.cedula) {
                            <div class="flex items-center gap-1.5 text-xs text-gray-600">
                              <span class="w-1.5 h-1.5 rounded-full bg-[#39A900] flex-shrink-0"></span>
                              <span class="font-medium">{{ a.nombre }}</span>
                              <span class="text-gray-400">·</span>
                              <span class="text-[#007832] font-semibold">{{ a.avance }}%</span>
                            </div>
                          }
                          @if (n.data!['aprendices'].length > 8) {
                            <p class="text-xs text-gray-400 pl-3">
                              + {{ n.data!['aprendices'].length - 8 }} más…
                            </p>
                          }
                        </div>
                      }

                      <p class="text-[10px] text-gray-400 mt-1.5">
                        {{ formatDate(n.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class NotificacionesCampanaComponent implements OnInit, OnDestroy {

  notificaciones = signal<Notificacion[]>([]);
  cargando       = signal(false);
  open           = signal(false);

  unread = computed(() => this.notificaciones().filter(n => !n.leida).length);

  private pollingId?: ReturnType<typeof setInterval>;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargar();
    // Refresca cada 30 s
    this.pollingId = setInterval(() => this.cargar(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.pollingId) clearInterval(this.pollingId);
  }

  // Cierra el dropdown si el usuario hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    if (!this.open()) return;
    const target = ev.target as HTMLElement;
    if (!target.closest('app-notificaciones-campana')) {
      this.open.set(false);
    }
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    const lista = await this.api.listarNotificaciones();
    this.notificaciones.set(lista);
    this.cargando.set(false);
  }

  toggleDropdown(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) this.cargar();  // refresca al abrir
  }

  async leer(n: Notificacion): Promise<void> {
    if (!n.leida) {
      await this.api.marcarNotificacionLeida(n.id);
      this.notificaciones.update(list =>
        list.map(x => x.id === n.id ? { ...x, leida: true } : x)
      );
    }
  }

  async leerTodas(): Promise<void> {
    await this.api.marcarTodasNotificacionesLeidas();
    this.notificaciones.update(list => list.map(x => ({ ...x, leida: true })));
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}

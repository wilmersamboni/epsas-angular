import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <!-- Fondo exterior oscuro con patrón -->
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style="background:#020d05;">

      <!-- Partículas de fondo animadas -->
      @for (p of particles; track p.id) {
        <div class="absolute rounded-full pointer-events-none"
          [style]="p.style"></div>
      }

      <!-- Tarjeta principal -->
      <div class="w-full max-w-4xl flex rounded-3xl overflow-hidden relative"
        style="min-height:520px; box-shadow:0 32px 80px rgba(0,0,0,.7);">

        <!-- ══════════════ PANEL IZQUIERDO ══════════════ -->
        <div class="relative flex flex-col" style="width:52%;background:#041a0c;overflow:hidden;">

          <!-- Estrellas -->
          @for (s of stars; track s.id) {
            <div class="absolute rounded-full pointer-events-none"
              [style]="s.style"></div>
          }

          <!-- Resplandor central -->
          <div class="absolute pointer-events-none"
            style="width:320px;height:320px;border-radius:50%;
                   background:radial-gradient(circle,rgba(57,169,0,.18) 0%,transparent 70%);
                   top:50%;left:50%;transform:translate(-50%,-50%);"></div>

          <!-- Blob divisor blanco -->
          <svg class="absolute right-0 top-0 h-full pointer-events-none"
            style="width:72px;z-index:3;" viewBox="0 0 72 520"
            preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M72,0 C52,90 14,130 36,210 C58,290 16,340 26,420 C36,470 58,490 72,520 L72,0 Z"
              fill="white"/>
          </svg>

          <!-- Contenido izquierdo -->
          <div class="relative flex flex-col h-full p-9" style="z-index:2;">

            <!-- Logo / Marca -->
            <div class="flex items-center gap-3 mb-auto">
              <div class="flex items-center justify-center rounded-xl flex-shrink-0"
                style="width:36px;height:36px;background:#39A900;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="white" stroke-width="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div class="font-bold tracking-widest text-white" style="font-size:16px;">EPSAS</div>
                <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:1px;">
                  Sistema de Prácticas · SENA
                </div>
              </div>
            </div>

            <!-- Ilustración SVG central -->
            <div class="flex items-center justify-center" style="flex:1;padding:12px 0;">
              <svg width="240" height="240" viewBox="0 0 260 260"
                xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
                <defs>
                  <radialGradient id="lglow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#39A900" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#39A900" stop-opacity="0"/>
                  </radialGradient>
                </defs>

                <!-- Resplandor base -->
                <circle cx="130" cy="135" r="95" fill="url(#lglow)"/>

                <!-- Sombra montañas -->
                <ellipse cx="130" cy="192" rx="88" ry="14"
                  fill="rgba(57,169,0,.08)"/>

                <!-- Montañas fondo -->
                <polygon points="30,190 80,105 130,150 170,88 220,190"
                  fill="rgba(57,169,0,.18)" stroke="rgba(57,169,0,.45)"
                  stroke-width="1.5" stroke-linejoin="round"/>

                <!-- Montañas primer plano -->
                <polygon points="60,190 100,130 135,158 168,102 215,190"
                  fill="rgba(57,169,0,.12)" stroke="rgba(57,169,0,.3)"
                  stroke-width="1" stroke-linejoin="round"/>

                <!-- Edificio / pantalla -->
                <rect x="107" y="93" width="46" height="58" rx="5"
                  fill="rgba(255,255,255,.06)" stroke="rgba(57,169,0,.65)"
                  stroke-width="1.5"/>
                <rect x="114" y="101" width="13" height="9" rx="2"
                  fill="rgba(57,169,0,.45)"/>
                <rect x="133" y="101" width="13" height="9" rx="2"
                  fill="rgba(57,169,0,.45)"/>
                <rect x="114" y="116" width="32" height="2" rx="1"
                  fill="rgba(255,255,255,.18)"/>
                <rect x="114" y="122" width="24" height="2" rx="1"
                  fill="rgba(255,255,255,.12)"/>
                <rect x="114" y="128" width="28" height="2" rx="1"
                  fill="rgba(255,255,255,.12)"/>
                <!-- Puerta -->
                <rect x="121" y="138" width="18" height="13" rx="2"
                  fill="rgba(57,169,0,.55)"/>

                <!-- Órbita planeta izquierda -->
                <circle cx="64" cy="100" r="20" fill="none"
                  stroke="rgba(57,169,0,.3)" stroke-width="1.5"/>
                <circle cx="64" cy="100" r="11" fill="rgba(57,169,0,.18)"/>
                <line x1="64" y1="80" x2="64" y2="74"
                  stroke="rgba(57,169,0,.5)" stroke-width="1.5"/>
                <line x1="84" y1="100" x2="90" y2="100"
                  stroke="rgba(57,169,0,.5)" stroke-width="1.5"/>

                <!-- Círculo SENA derecha -->
                <circle cx="195" cy="78" r="24" fill="none"
                  stroke="rgba(255,255,255,.1)" stroke-width="1"/>
                <circle cx="195" cy="78" r="15" fill="rgba(255,255,255,.04)"
                  stroke="rgba(255,255,255,.18)" stroke-width="1"/>
                <text x="195" y="83" text-anchor="middle"
                  fill="rgba(57,169,0,.85)" font-size="13" font-weight="bold"
                  font-family="sans-serif">S</text>

                <!-- Líneas de conexión punteadas -->
                <path d="M84,100 Q100,85 107,103"
                  stroke="rgba(57,169,0,.25)" stroke-width="1"
                  fill="none" stroke-dasharray="3,3"/>
                <path d="M153,105 Q172,90 180,78"
                  stroke="rgba(255,255,255,.12)" stroke-width="1"
                  fill="none" stroke-dasharray="3,3"/>

                <!-- Puntos decorativos -->
                <circle cx="55" cy="148" r="4.5" fill="rgba(57,169,0,.6)"/>
                <circle cx="205" cy="128" r="3" fill="rgba(255,255,255,.28)"/>
                <circle cx="178" cy="163" r="2.5" fill="rgba(57,169,0,.4)"/>
                <circle cx="72" cy="168" r="3.5" fill="rgba(255,255,255,.14)"/>
                <circle cx="42" cy="128" r="2" fill="rgba(57,169,0,.35)"/>
                <circle cx="220" cy="110" r="2" fill="rgba(57,169,0,.25)"/>
              </svg>
            </div>

            <!-- Mensaje de bienvenida -->
            <div class="text-center mt-auto">
              <p style="color:rgba(255,255,255,.7);font-size:14px;font-weight:600;
                         letter-spacing:.3px;margin-bottom:4px;">
                Bienvenido de nuevo
              </p>
              <p style="color:rgba(255,255,255,.3);font-size:11px;">
                Gestiona las etapas prácticas desde un solo lugar
              </p>
            </div>

            <!-- Footer -->
            <div class="mt-6" style="color:rgba(255,255,255,.2);font-size:10px;">
              © {{ year }} SENA · Centro Yamboró · Todos los derechos reservados
            </div>
          </div>
        </div>

        <!-- ══════════════ PANEL DERECHO ══════════════ -->
        <div class="flex flex-col justify-center bg-white px-10 py-10" style="flex:1; mb-4">

          <h2 style="font-size:24px;font-weight:700;color:#071a0a;margin-bottom:16px;">
            Iniciar sesión
          </h2>
          <p style="font-size:13px;color:#8fa896;margin-bottom:28px;">
            Ingresa tus credenciales para continuar
          </p>

          <!-- Error -->
          @if (error()) {
            <div class="mb-5 p-3 rounded-xl text-sm"
              style="background:#fef2f2;border:1.5px solid #fecaca;color:#dc2626;">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">

            <!-- Centro (slug) — solo en localhost sin subdominio -->
            @if (showCentroField) {
              <div>
                <label style="display:block;font-size:11px;font-weight:700;
                               color:#2d4a33;margin-bottom:6px;letter-spacing:.5px;
                               text-transform:uppercase;">
                  Centro <span style="color:#dc2626;">*</span>
                </label>
                <div class="relative">
                  <span class="absolute" style="left:13px;top:50%;transform:translateY(-50%);
                                color:#8fa896;pointer-events:none;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2">
                      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    [(ngModel)]="tenantSlug"
                    name="tenantSlug"
                    placeholder="yamboro"
                    style="width:100%;padding:11px 12px 11px 38px;
                           border:1.5px solid #e2ece5;border-radius:12px;
                           font-size:13px;color:#071a0a;background:#f5faf6;
                           outline:none;transition:border-color .2s,background .2s;"
                    (focus)="$event.target.style.borderColor='#39A900';$event.target.style.background='#fff'"
                    (blur)="$event.target.style.borderColor='#e2ece5';$event.target.style.background='#f5faf6'"
                  />
                </div>
                <p style="font-size:10px;color:#8fa896;margin-top:4px;">
                  Identificador del centro (ej: yamboro, sena)
                </p>
              </div>
            }

            <!-- Usuario -->
            <div>
              <label style="display:block;font-size:11px;font-weight:700;
                             color:#2d4a33;margin-bottom:6px;letter-spacing:.5px;
                             text-transform:uppercase;">
                Usuario
              </label>
              <div class="relative">
                <span class="absolute" style="left:13px;top:50%;transform:translateY(-50%);
                              color:#8fa896;pointer-events:none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  [(ngModel)]="credentials.login"
                  name="login"
                  placeholder="usuario1"
                  required
                  style="width:100%;padding:11px 12px 11px 38px;
                         border:1.5px solid #e2ece5;border-radius:12px;
                         font-size:13px;color:#071a0a;background:#f5faf6;
                         outline:none;transition:border-color .2s,background .2s;"
                  (focus)="$event.target.style.borderColor='#39A900';$event.target.style.background='#fff'"
                  (blur)="$event.target.style.borderColor='#e2ece5';$event.target.style.background='#f5faf6'"
                />
              </div>
            </div>

            <!-- Contraseña -->
            <div>
              <label style="display:block;font-size:11px;font-weight:700;
                             color:#2d4a33;margin-bottom:6px;letter-spacing:.5px;
                             text-transform:uppercase;">
                Contraseña
              </label>
              <div class="relative">
                <span class="absolute" style="left:13px;top:50%;transform:translateY(-50%);
                              color:#8fa896;pointer-events:none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="credentials.password"
                  name="password"
                  placeholder="••••••••"
                  required
                  style="width:100%;padding:11px 40px 11px 38px;
                         border:1.5px solid #e2ece5;border-radius:12px;
                         font-size:13px;color:#071a0a;background:#f5faf6;
                         outline:none;transition:border-color .2s,background .2s;"
                  (focus)="$event.target.style.borderColor='#39A900';$event.target.style.background='#fff'"
                  (blur)="$event.target.style.borderColor='#e2ece5';$event.target.style.background='#f5faf6'"
                />
                <button type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute"
                  style="right:12px;top:50%;transform:translateY(-50%);
                         color:#8fa896;background:none;border:none;cursor:pointer;padding:0;
                         display:flex;align-items:center;">
                  @if (showPassword()) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Olvidé contraseña -->
            <div class="text-right" style="margin-top:4px;">
              <a routerLink="/ForgotPassword"
                style="font-size:12px;color:#39A900;font-weight:600;text-decoration:none;">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <!-- Botón ingresar -->
            <button
              type="submit"
              [disabled]="loading()"
              style="width:100%;padding:13px;border-radius:13px;border:none;
                     background:linear-gradient(135deg,#2a7a00,#39A900);
                     color:white;font-size:14px;font-weight:700;
                     cursor:pointer;display:flex;align-items:center;
                     justify-content:center;gap:8px;
                     transition:opacity .2s,transform .1s;
                     opacity:1;"
              [style.opacity]="loading() ? '0.65' : btnHover() ? '0.88' : '1'"
              [style.cursor]="loading() ? 'not-allowed' : 'pointer'"
              [style.transform]="btnPressed() ? 'scale(0.985)' : 'scale(1)'"
              (mouseenter)="!loading() && btnHover.set(true)"
              (mouseleave)="btnHover.set(false); btnPressed.set(false)"
              (mousedown)="!loading() && btnPressed.set(true)"
              (mouseup)="btnPressed.set(false)">
              @if (loading()) {
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" stroke-width="3" opacity=".3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3"
                    stroke-linecap="round"/>
                </svg>
                Ingresando…
              } @else {
                Ingresar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="white" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              }
            </button>

          </form>

          

          <!-- Copyright -->
          <p style="font-size:10px;color:#b8c9bb;text-align:center;margin-top:22px;">
            EPSAS  · Etapas Prácticas · Centro Yamboró
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  credentials  = { login: '', password: '' };
  tenantSlug   = '';
  loading      = signal(false);
  error        = signal<string | null>(null);
  showPassword = signal(false);
  year         = new Date().getFullYear();
  btnHover     = signal(false);
  btnPressed   = signal(false);
  senaHover    = signal(false);

  // true solo en localhost plano (sin subdominio) — dev manual
  readonly isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // slug resuelto del subdominio (ej: centro-huila-test.localhost → 'centro-huila-test')
  private readonly slugFromUrl = this.resolveSlugFromUrl();

  // ocultar campo CENTRO cuando el slug viene de la URL
  readonly showCentroField = !this.slugFromUrl;

  stars:     { id: number; style: string }[] = [];
  particles: { id: number; style: string }[] = [];

  private animIds: number[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  private resolveSlugFromUrl(): string | null {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
    const parts = hostname.split('.');
    return parts.length >= 2 ? parts[0].toLowerCase() : null;
  }

  ngOnInit(): void {
    // Si el slug viene de la URL, lo guardamos en localStorage y no se muestra el campo
    if (this.slugFromUrl) {
      this.tenantSlug = this.slugFromUrl;
      localStorage.setItem('tenantSlug', this.slugFromUrl);
    } else {
      // En localhost plano, usar el último slug guardado
      this.tenantSlug = localStorage.getItem('tenantSlug') ?? '';
    }

    this.stars = Array.from({ length: 45 }, (_, i) => {
      const size = Math.random() * 2.5 + 0.8;
      const delay = (Math.random() * 4).toFixed(1);
      const dur   = (2 + Math.random() * 3).toFixed(1);
      return {
        id: i,
        style: `width:${size}px;height:${size}px;
                top:${(Math.random() * 100).toFixed(1)}%;
                left:${(Math.random() * 82).toFixed(1)}%;
                background:rgba(255,255,255,${(0.2 + Math.random() * 0.6).toFixed(2)});
                animation:twinkle ${dur}s ${delay}s infinite alternate;`,
      };
    });

    this.particles = Array.from({ length: 6 }, (_, i) => {
      const size  = 40 + Math.random() * 120;
      const delay = (Math.random() * 5).toFixed(1);
      return {
        id: i,
        style: `width:${size}px;height:${size}px;
                top:${(Math.random() * 100).toFixed(1)}%;
                left:${(Math.random() * 100).toFixed(1)}%;
                background:rgba(57,169,0,${(0.04 + Math.random() * 0.06).toFixed(2)});
                animation:floatP ${(5 + Math.random() * 6).toFixed(1)}s ${delay}s infinite ease-in-out alternate;`,
      };
    });
  }

  ngOnDestroy(): void {
    this.animIds.forEach(id => cancelAnimationFrame(id));
  }

  async onSubmit(): Promise<void> {
    if (!this.tenantSlug.trim()) {
      this.error.set('Debes ingresar el nombre del centro (slug) para continuar.');
      return;
    }
    localStorage.setItem('tenantSlug', this.tenantSlug.trim().toLowerCase());
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.login(this.credentials);
      this.router.navigate(['/home']);
    } catch {
      this.error.set('Usuario o contraseña incorrectos. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}

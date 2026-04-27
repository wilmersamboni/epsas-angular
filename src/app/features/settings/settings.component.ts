import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, TEMAS } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

type Tab = 'perfil' | 'password' | 'apariencia' | 'practicas' | 'sistema';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="settings-wrap">

      <!-- ── Encabezado ─────────────────────────────────────────── -->
      <div class="settings-header">
        <div class="settings-avatar">{{ iniciales() }}</div>
        <div>
          <h1 class="settings-name">{{ user()?.nombre ?? 'Usuario' }}</h1>
          <span class="settings-badge" [class]="'badge-' + (user()?.cargo ?? '')">
            {{ user()?.cargo ?? '' }}
          </span>
        </div>
      </div>

      <div class="settings-body">

        <!-- ── Sidebar ─────────────────────────────────────────── -->
        <nav class="settings-nav">
          <button (click)="tab.set('perfil')"     [class.active]="tab() === 'perfil'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Perfil
          </button>

          <button (click)="tab.set('password')"   [class.active]="tab() === 'password'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2
                       0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Contraseña
          </button>

          <button (click)="tab.set('apariencia')" [class.active]="tab() === 'apariencia'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0
                       0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0
                       012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Apariencia
          </button>

          @if (esAdmin()) {
            <button (click)="tab.set('practicas'); cargarConfigPracticas()"
              [class.active]="tab() === 'practicas'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0
                         00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2
                         0 012 2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 12h6M9 16h4" stroke-linecap="round"/>
              </svg>
              Prácticas
            </button>
          }

          @if (esAdmin()) {
            <button (click)="tab.set('sistema')" [class.active]="tab() === 'sistema'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573
                         1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426
                         1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37
                         2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724
                         1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0
                         00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0
                         001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Sistema
            </button>
          }
        </nav>

        <!-- ── Panel ───────────────────────────────────────────── -->
        <div class="settings-panel">

          <!-- ════════ PERFIL ════════ -->
          @if (tab() === 'perfil') {
            <div class="panel-section">
              <h2 class="panel-title">Información Personal</h2>
              <p class="panel-sub">Actualiza tus datos de perfil</p>

              @if (cargandoPerfil()) {
                <div class="spinner-wrap"><div class="spinner"></div></div>
              } @else {
                <div class="form-grid">
                  <div class="form-field">
                    <label>Nombre completo</label>
                    <input type="text" [(ngModel)]="perfil.nombre" placeholder="Tu nombre" />
                  </div>
                  <div class="form-field">
                    <label>Correo electrónico</label>
                    <input type="email" [(ngModel)]="perfil.correo" placeholder="correo@ejemplo.com" />
                  </div>
                  <div class="form-field">
                    <label>Teléfono</label>
                    <input type="tel" [(ngModel)]="perfil.telefono" placeholder="3001234567" />
                  </div>
                  <div class="form-field">
                    <label>Dirección</label>
                    <input type="text" [(ngModel)]="perfil.direccion" placeholder="Calle 123 # 45-67" />
                  </div>
                  <div class="form-field">
                    <label>Login (usuario)</label>
                    <input type="text" [value]="user()?.login ?? ''" disabled class="disabled" />
                  </div>
                  <div class="form-field">
                    <label>Cargo</label>
                    <input type="text" [value]="user()?.cargo ?? ''" disabled class="disabled" />
                  </div>
                </div>

                <div class="panel-footer">
                  <button class="btn-primary" (click)="guardarPerfil()" [disabled]="saving()">
                    {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
                  </button>
                </div>
              }
            </div>
          }

          <!-- ════════ CONTRASEÑA ════════ -->
          @if (tab() === 'password') {
            <div class="panel-section">
              <h2 class="panel-title">Cambiar Contraseña</h2>
              <p class="panel-sub">Por seguridad, ingresa tu contraseña actual</p>

              <div class="form-grid" style="max-width:480px">
                <div class="form-field" style="grid-column:1/-1">
                  <label>Contraseña actual</label>
                  <div class="input-eye">
                    <input [type]="showPwd.actual ? 'text' : 'password'"
                      [(ngModel)]="pwd.actual" placeholder="••••••••" />
                    <button type="button" (click)="showPwd.actual = !showPwd.actual">
                      {{ showPwd.actual ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>
                <div class="form-field" style="grid-column:1/-1">
                  <label>Nueva contraseña</label>
                  <div class="input-eye">
                    <input [type]="showPwd.nueva ? 'text' : 'password'"
                      [(ngModel)]="pwd.nueva" placeholder="Mín. 8 caracteres" />
                    <button type="button" (click)="showPwd.nueva = !showPwd.nueva">
                      {{ showPwd.nueva ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>
                <div class="form-field" style="grid-column:1/-1">
                  <label>Confirmar nueva contraseña</label>
                  <div class="input-eye">
                    <input [type]="showPwd.confirma ? 'text' : 'password'"
                      [(ngModel)]="pwd.confirma" placeholder="Repite la contraseña" />
                    <button type="button" (click)="showPwd.confirma = !showPwd.confirma">
                      {{ showPwd.confirma ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Indicador de fortaleza -->
              @if (pwd.nueva) {
                <div class="strength-wrap">
                  <div class="strength-bar">
                    @for (s of [1,2,3,4]; track s) {
                      <div class="strength-seg" [class.filled]="s <= pwdStrength()"></div>
                    }
                  </div>
                  <span class="strength-label" [class]="'s' + pwdStrength()">
                    {{ ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][pwdStrength()] }}
                  </span>
                </div>
              }

              <div class="panel-footer">
                <button class="btn-primary" (click)="cambiarPassword()" [disabled]="saving()">
                  {{ saving() ? 'Actualizando…' : 'Actualizar contraseña' }}
                </button>
              </div>
            </div>
          }

          <!-- ════════ APARIENCIA ════════ -->
          @if (tab() === 'apariencia') {
            <div class="panel-section">
              <h2 class="panel-title">Apariencia</h2>
              <p class="panel-sub">Personaliza la interfaz a tu gusto</p>

              <!-- Tema claro / oscuro -->
              <div class="pref-row">
                <div>
                  <p class="pref-label">Modo oscuro</p>
                  <p class="pref-desc">Cambia entre tema claro y oscuro</p>
                </div>
                <button class="toggle" [class.on]="darkMode()" (click)="toggleDark()">
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <hr class="divider" />

              <!-- Color de acento -->
              <div>
                <p class="pref-label" style="margin-bottom:12px">Color de acento</p>
                <div class="color-grid">
                  @for (t of temas; track t.id) {
                    <button class="color-chip"
                      [style.background]="t.color"
                      [class.selected]="temaActual() === t.id"
                      (click)="setTema(t.id)"
                      [title]="t.label">
                      @if (temaActual() === t.id) {
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      }
                    </button>
                  }
                </div>
              </div>

              <hr class="divider" />

              <!-- Tamaño de fuente -->
              <div class="pref-row">
                <div>
                  <p class="pref-label">Tamaño de fuente</p>
                  <p class="pref-desc">Ajusta el tamaño del texto en la app</p>
                </div>
                <div class="font-size-btns">
                  <button (click)="setFontSize('small')"  [class.active]="fontSize() === 'small'">A</button>
                  <button (click)="setFontSize('normal')" [class.active]="fontSize() === 'normal'" style="font-size:16px">A</button>
                  <button (click)="setFontSize('large')"  [class.active]="fontSize() === 'large'"  style="font-size:20px">A</button>
                </div>
              </div>

            </div>
          }

          <!-- ════════ PRÁCTICAS (solo admin) ════════ -->
          @if (tab() === 'practicas' && esAdmin()) {
            <div class="panel-section">
              <h2 class="panel-title">Configuración de Prácticas</h2>
              <p class="panel-sub">Parámetros para la creación de etapas prácticas</p>

              @if (cargandoConfig()) {
                <div class="spinner-wrap"><div class="spinner"></div></div>
              } @else {
                <div class="pref-row" style="align-items:flex-start; flex-direction:column; gap:12px">
                  <div>
                    <p class="pref-label">Avance mínimo requerido</p>
                    <p class="pref-desc">
                      Porcentaje mínimo de avance académico que debe tener un aprendiz
                      para que el administrador pueda crearle una etapa práctica.
                    </p>
                  </div>

                  <div class="avance-control">
                    <div class="avance-slider-wrap">
                      <input type="range" min="0" max="100" step="5"
                        [(ngModel)]="configMinAvance"
                        class="avance-slider" />
                      <div class="avance-labels">
                        <span>0%</span><span>50%</span><span>100%</span>
                      </div>
                    </div>
                    <div class="avance-value-wrap">
                      <input type="number" min="0" max="100"
                        [(ngModel)]="configMinAvance"
                        class="avance-number" />
                      <span class="avance-pct">%</span>
                    </div>
                  </div>

                  <div class="avance-preview">
                    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all"
                        [style.width.%]="configMinAvance"
                        [style.background]="configMinAvance >= 70 ? '#39A900' :
                                            configMinAvance >= 40 ? '#f5a524' : '#f31260'">
                      </div>
                    </div>
                    <span class="text-sm font-semibold"
                      [style.color]="configMinAvance >= 70 ? '#39A900' :
                                     configMinAvance >= 40 ? '#f5a524' : '#f31260'">
                      {{ configMinAvance }}%
                    </span>
                  </div>

                  <p class="text-xs text-gray-400" style="margin:0">
                    Valor actual guardado: <strong>{{ configMinAvanceSaved }}%</strong>.
                    Un aprendiz con avance menor verá el botón "crear práctica" bloqueado.
                  </p>
                </div>

                <div class="panel-footer">
                  <button class="btn-primary" (click)="guardarConfigPracticas()" [disabled]="saving()">
                    {{ saving() ? 'Guardando…' : 'Guardar configuración' }}
                  </button>
                </div>
              }
            </div>
          }

          <!-- ════════ SISTEMA (solo admin) ════════ -->
          @if (tab() === 'sistema' && esAdmin()) {
            <div class="panel-section">
              <h2 class="panel-title">Información del Sistema</h2>
              <p class="panel-sub">Datos de configuración de la plataforma</p>

              <div class="sys-grid">
                <div class="sys-card">
                  <span class="sys-icon">🏢</span>
                  <div>
                    <p class="sys-label">Plataforma</p>
                    <p class="sys-value">EPSAS v1.0</p>
                  </div>
                </div>
                <div class="sys-card">
                  <span class="sys-icon">🌐</span>
                  <div>
                    <p class="sys-label">Backend principal</p>
                    <p class="sys-value">localhost:3000</p>
                  </div>
                </div>
                <div class="sys-card">
                  <span class="sys-icon">⚙️</span>
                  <div>
                    <p class="sys-label">Backend prácticas</p>
                    <p class="sys-value">localhost:3001</p>
                  </div>
                </div>
                <div class="sys-card">
                  <span class="sys-icon">🗄️</span>
                  <div>
                    <p class="sys-label">Base de datos</p>
                    <p class="sys-value">PostgreSQL</p>
                  </div>
                </div>
                <div class="sys-card">
                  <span class="sys-icon">⚡</span>
                  <div>
                    <p class="sys-label">Caché</p>
                    <p class="sys-value">Redis</p>
                  </div>
                </div>
                <div class="sys-card">
                  <span class="sys-icon">🔐</span>
                  <div>
                    <p class="sys-label">Autenticación</p>
                    <p class="sys-value">JWT + Cookie</p>
                  </div>
                </div>
              </div>

              <hr class="divider" />
              <div class="panel-footer">
                <button class="btn-danger" (click)="cerrarSesion()">
                  Cerrar sesión
                </button>
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .settings-wrap { max-width: 960px; margin: 0 auto; padding: 32px 16px; }

    .settings-header {
      display: flex; align-items: center; gap: 16px;
      background: white; border-radius: 20px; padding: 24px;
      box-shadow: 0 2px 16px rgba(0,0,0,.05); margin-bottom: 24px;
      border: 1px solid #f1f5f9;
    }
    .settings-avatar {
      width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #39A900, #2d8600);
      color: white; font-size: 22px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .settings-name { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
    .settings-badge {
      display: inline-block; font-size: 11px; font-weight: 600;
      padding: 3px 10px; border-radius: 20px; text-transform: capitalize;
    }
    .badge-administrador { background: #dcfce7; color: #16a34a; }
    .badge-instructor    { background: #dbeafe; color: #1d4ed8; }
    .badge-aprendiz      { background: #f3e8ff; color: #7c3aed; }

    .settings-body { display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: start; }

    /* ── Nav ── */
    .settings-nav {
      background: white; border-radius: 16px; padding: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,.05); border: 1px solid #f1f5f9;
      display: flex; flex-direction: column; gap: 2px;
    }
    .settings-nav button {
      width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px; border: none; background: none;
      font-size: 13px; font-weight: 500; color: #64748b;
      cursor: pointer; transition: all .15s; text-align: left;
    }
    .settings-nav button svg { width: 16px; height: 16px; flex-shrink: 0; }
    .settings-nav button:hover { background: #f8fafc; color: #334155; }
    .settings-nav button.active { background: #39A900; color: white; }

    /* ── Panel ── */
    .settings-panel {
      background: white; border-radius: 20px; padding: 28px;
      box-shadow: 0 2px 16px rgba(0,0,0,.05); border: 1px solid #f1f5f9;
    }
    .panel-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .panel-sub   { font-size: 13px; color: #94a3b8; margin: 0 0 24px; }
    .panel-footer { display: flex; justify-content: flex-end; margin-top: 24px; }

    /* ── Form ── */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
    .form-field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-field input {
      width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb;
      border-radius: 10px; font-size: 13px; color: #111827;
      outline: none; transition: border .15s; box-sizing: border-box;
    }
    .form-field input:focus { border-color: #39A900; box-shadow: 0 0 0 3px rgba(57,169,0,.1); }
    .form-field input.disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

    /* ── Eye toggle ── */
    .input-eye { position: relative; }
    .input-eye input { padding-right: 42px; }
    .input-eye button {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 16px; line-height: 1;
    }

    /* ── Strength ── */
    .strength-wrap { display: flex; align-items: center; gap: 10px; margin: 12px 0; }
    .strength-bar  { display: flex; gap: 4px; flex: 1; max-width: 200px; }
    .strength-seg  { flex: 1; height: 4px; border-radius: 99px; background: #e5e7eb; transition: background .3s; }
    .strength-seg.filled { background: #39A900; }
    .strength-label { font-size: 12px; font-weight: 600; }
    .s1 .strength-seg.filled { background: #ef4444; }
    .s1 { color: #ef4444; }
    .s2 .strength-seg.filled { background: #f97316; }
    .s2 { color: #f97316; }
    .s3 .strength-seg.filled { background: #eab308; }
    .s3 { color: #eab308; }
    .s4 .strength-seg.filled { background: #22c55e; }
    .s4 { color: #22c55e; }

    /* ── Msgs ── */
    .msg { margin-top: 12px; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; }
    .msg-ok  { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .msg-err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

    /* ── Buttons ── */
    .btn-primary {
      padding: 10px 24px; background: #39A900; color: white;
      border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: opacity .15s;
    }
    .btn-primary:hover:not(:disabled) { opacity: .88; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

    .btn-danger {
      padding: 10px 24px; background: #fee2e2; color: #dc2626;
      border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background .15s;
    }
    .btn-danger:hover { background: #fecaca; }

    /* ── Pref rows ── */
    .pref-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 0; }
    .pref-label { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 2px; }
    .pref-desc  { font-size: 12px; color: #94a3b8; margin: 0; }
    .divider { border: none; border-top: 1px solid #f1f5f9; margin: 20px 0; }

    /* ── Toggle ── */
    .toggle {
      width: 48px; height: 26px; border-radius: 99px; border: none; cursor: pointer;
      background: #e2e8f0; position: relative; transition: background .25s; flex-shrink: 0;
    }
    .toggle.on { background: #39A900; }
    .toggle-knob {
      position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
      border-radius: 50%; background: white; transition: transform .25s;
      box-shadow: 0 1px 3px rgba(0,0,0,.2);
    }
    .toggle.on .toggle-knob { transform: translateX(22px); }

    /* ── Color chips ── */
    .color-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .color-chip {
      width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .15s, border-color .15s;
    }
    .color-chip:hover { transform: scale(1.1); }
    .color-chip.selected { border-color: #0f172a; }
    .color-chip svg { width: 18px; height: 18px; }

    /* ── Font size ── */
    .font-size-btns { display: flex; gap: 8px; }
    .font-size-btns button {
      width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e5e7eb;
      background: white; cursor: pointer; font-weight: 700; color: #374151;
      font-size: 12px; display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    .font-size-btns button.active { border-color: #39A900; background: #f0fdf4; color: #39A900; }

    /* ── Avance control ── */
    .avance-control { display: flex; align-items: center; gap: 16px; width: 100%; max-width: 480px; }
    .avance-slider-wrap { flex: 1; }
    .avance-slider {
      width: 100%; -webkit-appearance: none; height: 6px;
      border-radius: 99px; background: #e5e7eb; outline: none; cursor: pointer;
    }
    .avance-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
      background: #39A900; cursor: pointer; border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,.2);
    }
    .avance-labels { display: flex; justify-content: space-between;
                     font-size: 10px; color: #94a3b8; margin-top: 4px; }
    .avance-value-wrap { display: flex; align-items: center; gap: 4px; }
    .avance-number {
      width: 60px; padding: 8px 10px; border: 1.5px solid #e5e7eb;
      border-radius: 10px; font-size: 14px; font-weight: 700; text-align: center;
      color: #0f172a; outline: none;
    }
    .avance-number:focus { border-color: #39A900; box-shadow: 0 0 0 3px rgba(57,169,0,.1); }
    .avance-pct { font-size: 14px; font-weight: 600; color: #64748b; }
    .avance-preview { display: flex; align-items: center; gap: 10px;
                       width: 100%; max-width: 480px; }

    /* ── Sistema ── */
    .sys-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .sys-card {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; background: #f8fafc; border-radius: 12px;
      border: 1px solid #f1f5f9;
    }
    .sys-icon { font-size: 22px; }
    .sys-label { font-size: 11px; color: #94a3b8; margin: 0 0 2px; }
    .sys-value { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0; }

    /* ── Spinner ── */
    .spinner-wrap { display: flex; justify-content: center; padding: 40px; }
    .spinner { width: 32px; height: 32px; border: 4px solid rgba(57,169,0,.2);
               border-top-color: #39A900; border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .settings-body { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .sys-grid  { grid-template-columns: 1fr; }
    }
  `],
})
export class SettingsComponent implements OnInit {
  private auth   = inject(AuthService);
  private http   = inject(HttpClient);
  private theme  = inject(ThemeService);
  private apiSvc = inject(ApiService);
  private toast  = inject(ToastService);

  tab            = signal<Tab>('perfil');
  saving         = signal(false);
  cargandoPerfil = signal(false);

  readonly user     = this.auth.user;
  readonly esAdmin  = computed(() => this.auth.isAdmin());
  readonly iniciales = computed(() =>
    (this.user()?.nombre ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  );

  // Datos de perfil
  perfil = { nombre: '', correo: '', telefono: '', direccion: '' };

  // Cambio de contraseña
  pwd       = { actual: '', nueva: '', confirma: '' };
  showPwd   = { actual: false, nueva: false, confirma: false };

  // Fortaleza de contraseña (1-4)
  pwdStrength = computed(() => {
    const p = this.pwd.nueva;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)            score++;
    if (/[A-Z]/.test(p))          score++;
    if (/[0-9]/.test(p))          score++;
    if (/[^A-Za-z0-9]/.test(p))   score++;
    return score as 0|1|2|3|4;
  });

  // Apariencia
  darkMode   = signal(localStorage.getItem('dark') === '1');
  temaActual = signal(localStorage.getItem('tema') ?? 'verde');
  fontSize   = signal(localStorage.getItem('fontSize') ?? 'normal');
  readonly temas = TEMAS;

  // Configuración de prácticas
  cargandoConfig       = signal(false);
  configMinAvance      = 70;
  configMinAvanceSaved = 70;

  ngOnInit(): void {
    this.cargarPerfil();
    this.theme.apply();   // restaura color, fuente y modo oscuro guardados
  }

  // ── Perfil ────────────────────────────────────────────────────────────
  async cargarPerfil(): Promise<void> {
    const personaId = this.user()?.personaId;
    if (!personaId) {
      this.perfil.nombre = this.user()?.nombre ?? '';
      return;
    }
    this.cargandoPerfil.set(true);
    try {
      const data: any = await firstValueFrom(
        this.http.get(`/api/persona/buscar_jwsv/${personaId}`)
      );
      this.perfil = {
        nombre:    data.nombre    ?? '',
        correo:    data.correo    ?? '',
        telefono:  String(data.telefono  ?? ''),
        direccion: data.direccion ?? '',
      };
    } catch { this.perfil.nombre = this.user()?.nombre ?? ''; }
    finally { this.cargandoPerfil.set(false); }
  }

  async guardarPerfil(): Promise<void> {
    const personaId = this.user()?.personaId;
    if (!personaId) return;
    this.saving.set(true); //this.perfilMsg.set('');
    try {
      // Cargamos el registro completo para no pisar campos no editables
      const actual: any = await firstValueFrom(
        this.http.get(`/api/persona/buscar_jwsv/${personaId}`)
      );
      await firstValueFrom(
        this.http.put(`/api/persona/actualizar_jwsv/${personaId}`, {
          nombre:       this.perfil.nombre,
          correo:       this.perfil.correo,
          telefono:     this.perfil.telefono,
          direccion:    this.perfil.direccion,
          genero:       actual.genero,
          fk_municipo:  actual.fk_municipo,
          cargo:        actual.cargo,
          estado:       actual.estado,
        })
      );
      this.auth.actualizarUser({ nombre: this.perfil.nombre });
      this.toast.ok('Perfil actualizado', 'Los cambios fueron guardados correctamente.');
    } catch (e: any) {
      this.toast.httpError(e, 'Error al guardar el perfil.');
    } finally { this.saving.set(false); }
  }

  // ── Contraseña ───────────────────────────────────────────────────────
  async cambiarPassword(): Promise<void> {
    if (!this.pwd.actual || !this.pwd.nueva || !this.pwd.confirma) {
      this.toast.warn('Campos requeridos', 'Completa todos los campos.'); return;
    }
    if (this.pwd.nueva !== this.pwd.confirma) {
      this.toast.warn('Contraseñas distintas', 'Las contraseñas nuevas no coinciden.'); return;
    }
    if (this.pwd.nueva.length < 8) {
      this.toast.warn('Contraseña corta', 'La nueva contraseña debe tener al menos 8 caracteres.'); return;
    }
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.http.patch('/api/auth/cambiar-password', {
          passwordActual: this.pwd.actual,
          passwordNuevo:  this.pwd.nueva,
        })
      );
      this.toast.ok('Contraseña actualizada', 'Tu contraseña fue cambiada correctamente.');
      this.pwd = { actual: '', nueva: '', confirma: '' };
    } catch (e: any) {
      this.toast.error('Error', e?.error?.message ?? 'La contraseña actual es incorrecta.');
    } finally { this.saving.set(false); }
  }

  // ── Apariencia ───────────────────────────────────────────────────────
  toggleDark(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    localStorage.setItem('dark', next ? '1' : '0');
    this.theme.apply();
  }

  setTema(id: string): void {
    this.temaActual.set(id);
    localStorage.setItem('tema', id);
    this.theme.apply();
  }

  setFontSize(size: string): void {
    this.fontSize.set(size);
    localStorage.setItem('fontSize', size);
    this.theme.apply();
  }

  // ── Configuración de Prácticas ───────────────────────────────────────
  async cargarConfigPracticas(): Promise<void> {
    this.cargandoConfig.set(true);
    try {
      const cfg = await this.apiSvc.obtenerConfiguracion();
      this.configMinAvance      = cfg.minAvance;
      this.configMinAvanceSaved = cfg.minAvance;
    } catch (e: any) {
      this.toast.httpError(e, 'No se pudo cargar la configuración.');
    } finally { this.cargandoConfig.set(false); }
  }

  async guardarConfigPracticas(): Promise<void> {
    this.saving.set(true);
    const v = Math.max(0, Math.min(100, this.configMinAvance));
    try {
      await this.apiSvc.actualizarConfiguracion(v);
      this.configMinAvanceSaved = v;
      this.configMinAvance      = v;
      this.toast.ok('Configuración guardada', `Avance mínimo establecido en ${v}%.`);
    } catch (e: any) {
      this.toast.httpError(e, 'Error al guardar la configuración.');
    } finally { this.saving.set(false); }
  }

  // ── Sistema ──────────────────────────────────────────────────────────
  cerrarSesion(): void { this.auth.logout(); }
}

import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

type Tab = 'perfil' | 'usuario';

/**
 * Equivalente a SettingsPage.tsx de React.
 * Pestañas: Perfil (ver/editar) y Crear Usuario.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-6xl mx-auto">

      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-1">Configuración</h1>
        <p class="text-sm text-gray-400">Administra tu cuenta y preferencias</p>
      </div>

      <div class="grid md:grid-cols-4 gap-6">

        <!-- Sidebar de pestañas -->
        <div class="md:col-span-1">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <button (click)="activeTab.set('perfil')"
              class="w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 text-sm font-medium"
              [class.bg-[#39A900]]="activeTab() === 'perfil'"
              [class.text-white]="activeTab() === 'perfil'"
              [class.text-gray-500]="activeTab() !== 'perfil'"
              [class.hover:bg-gray-50]="activeTab() !== 'perfil'">
              <!-- User icon -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Perfil
            </button>
            <button (click)="activeTab.set('usuario')"
              class="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-sm font-medium"
              [class.bg-[#39A900]]="activeTab() === 'usuario'"
              [class.text-white]="activeTab() === 'usuario'"
              [class.text-gray-500]="activeTab() !== 'usuario'"
              [class.hover:bg-gray-50]="activeTab() !== 'usuario'">
              <!-- Users icon -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                     M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                     m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Usuario
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="md:col-span-3">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <!-- ── Pestaña Perfil ── -->
            @if (activeTab() === 'perfil') {
              <div class="space-y-6">
                <h2 class="text-xl font-bold text-gray-800">Información Personal</h2>

                <!-- Avatar -->
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#39A900] to-emerald-600
                               flex items-center justify-center text-white text-xl font-bold">
                    {{ initials() }}
                  </div>
                  <button class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition">
                    Cambiar foto
                  </button>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <input type="text" name="nombre" [(ngModel)]="perfil.nombre"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" name="email" [(ngModel)]="perfil.email"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                    <input type="tel" name="telefono" [(ngModel)]="perfil.telefono"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Ubicación</label>
                    <input type="text" name="ubicacion" [(ngModel)]="perfil.ubicacion"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                </div>

                <div class="flex justify-end">
                  <button (click)="guardarPerfil()" [disabled]="saving()"
                    class="flex items-center gap-2 px-6 py-2.5 bg-[#39A900] text-white rounded-lg
                           hover:bg-[#2d8400] transition-colors text-sm font-medium disabled:opacity-60">
                    Guardar cambios
                  </button>
                </div>
              </div>
            }

            <!-- ── Pestaña Usuario ── -->
            @if (activeTab() === 'usuario') {
              <div class="space-y-6">
                <h2 class="text-xl font-bold text-gray-800">Crear Usuario</h2>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <input type="text" [(ngModel)]="nuevoUsuario.nombre" placeholder="Ej: Juan Pérez"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" [(ngModel)]="nuevoUsuario.correo" placeholder="correo@ejemplo.com"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                    <input type="tel" [(ngModel)]="nuevoUsuario.telefono" placeholder="3001234567"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                    <input type="text" [(ngModel)]="nuevoUsuario.direccion" placeholder="Calle 123 # 45-67"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Género</label>
                    <select [(ngModel)]="nuevoUsuario.genero"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
                      <option value="">Seleccionar...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Cargo</label>
                    <select [(ngModel)]="nuevoUsuario.cargo"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
                      <option value="">Seleccionar...</option>
                      <option value="administrador">Administrador</option>
                      <option value="instructor">Instructor</option>
                      <option value="aprendiz">Aprendiz</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">ID Municipio</label>
                    <input type="number" [(ngModel)]="nuevoUsuario.fk_municipio" placeholder="ID del municipio"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">ID Rol</label>
                    <input type="number" [(ngModel)]="nuevoUsuario.fk_rol" placeholder="ID del rol"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Login (usuario)</label>
                    <input type="text" [(ngModel)]="nuevoUsuario.login" placeholder="nombre_usuario"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                    <input type="password" [(ngModel)]="nuevoUsuario.password" placeholder="••••••••"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                             focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                  </div>

                  <div class="md:col-span-2 flex justify-end">
                    <button (click)="crearUsuario()" [disabled]="saving()"
                      class="flex items-center gap-2 px-6 py-2.5 bg-[#39A900] text-white rounded-lg
                             hover:bg-[#2d8400] transition-colors text-sm font-medium disabled:opacity-60">
                      Crear usuario
                    </button>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  activeTab = signal<Tab>('perfil');
  saving    = signal(false);

  perfil = { nombre: '', email: '', telefono: '', ubicacion: '' };
  nuevoUsuario = {
    nombre: '', correo: '', telefono: '', direccion: '',
    genero: '', fk_municipio: '', cargo: '', login: '', password: '', fk_rol: '',
  };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void { this.cargarPerfil(); }

  get initials(): () => string {
    return () => (this.perfil.nombre || 'U')
      .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  async cargarPerfil(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const data: any = await firstValueFrom(
        this.http.get(`/api/persona/buscar_jwsv/${payload.personaId}`)
      );
      this.perfil = {
        nombre: data.nombre ?? '',
        email: data.correo ?? '',
        telefono: data.telefono ?? '',
        ubicacion: data.direccion ?? '',
      };
    } catch (e) { console.error('Error cargando perfil', e); }
  }

  async guardarPerfil(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.saving.set(true);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const actual: any = await firstValueFrom(
        this.http.get(`/api/persona/buscar_jwsv/${payload.personaId}`)
      );
      await firstValueFrom(
        this.http.put(`/api/persona/actualizar_jwsv/${payload.personaId}`, {
          nombre: this.perfil.nombre,
          correo: this.perfil.email,
          telefono: this.perfil.telefono,
          direccion: this.perfil.ubicacion,
          genero: actual.genero,
          fk_municipo: actual.fk_municipo,
          cargo: actual.cargo,
          estado: actual.estado,
        })
      );
      this.auth.actualizarUser({ nombre: this.perfil.nombre });
      alert('Perfil actualizado');
    } catch { alert('Error al guardar el perfil.'); }
    finally { this.saving.set(false); }
  }

  async crearUsuario(): Promise<void> {
    this.saving.set(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const personaRes: any = await firstValueFrom(
        this.http.post('/api/persona/registrar_jwsv', {
          nombre: this.nuevoUsuario.nombre,
          telefono: this.nuevoUsuario.telefono,
          direccion: this.nuevoUsuario.direccion,
          correo: this.nuevoUsuario.correo,
          genero: this.nuevoUsuario.genero,
          fk_municipio: Number(this.nuevoUsuario.fk_municipio),
          cargo: this.nuevoUsuario.cargo,
          estado: 'activo',
        }, { headers })
      );

      const usuarioRes: any = await firstValueFrom(
        this.http.post('/api/usuario/registrar_jwsv', {
          fk_persona: personaRes.id_persona,
          fk_aplicativo: 1,
        }, { headers })
      );

      await firstValueFrom(
        this.http.post('/api/credencial/registrar_jwsv', {
          login: this.nuevoUsuario.login,
          password: this.nuevoUsuario.password,
          fk_usuario: usuarioRes.crearUsuario_jwsv.id_usuario,
          fk_rol: Number(this.nuevoUsuario.fk_rol),
        }, { headers })
      );

      alert('Usuario creado correctamente');
      this.nuevoUsuario = {
        nombre: '', correo: '', telefono: '', direccion: '',
        genero: '', fk_municipio: '', cargo: '', login: '', password: '', fk_rol: '',
      };
    } catch (e: any) {
      alert('Error: ' + (e.error?.error ?? e.message));
    } finally {
      this.saving.set(false);
    }
  }
}

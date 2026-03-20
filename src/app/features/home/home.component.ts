import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Equivalente a IndexPage.tsx de React.
 * Muestra las tarjetas del dashboard principal.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center gap-6 py-10 px-6 w-full">

      <div class="text-center">
        <span class="text-4xl font-bold text-gray-800">Bienvenido a&nbsp;</span>
        <span class="text-4xl font-bold text-[#39A900]">Epsas</span>
      </div>

      <!-- Dashboard Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mt-4">

        <a routerLink="/seguimiento"
           class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                  hover:shadow-md hover:border-[#39A900]/30 transition-all duration-200 cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4
                      group-hover:bg-[#39A900]/10 transition-colors">
            <!-- Users icon -->
            <svg class="w-6 h-6 text-[#39A900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
                   M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
                   m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Seguimiento</h3>
          <p class="text-xs text-gray-400">Gestiona áreas y aprendices</p>
        </a>

        <a routerLink="/docs"
           class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                  hover:shadow-md hover:border-[#39A900]/30 transition-all duration-200 cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4
                      group-hover:bg-blue-100 transition-colors">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Historial</h3>
          <p class="text-xs text-gray-400">Consulta registros anteriores</p>
        </a>

        <a routerLink="/format"
           class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                  hover:shadow-md hover:border-[#39A900]/30 transition-all duration-200 cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4
                      group-hover:bg-orange-100 transition-colors">
            <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586
                   a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Formatos</h3>
          <p class="text-xs text-gray-400">Sube y descarga documentos PDF</p>
        </a>

        <a routerLink="/blog"
           class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                  hover:shadow-md hover:border-[#39A900]/30 transition-all duration-200 cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4
                      group-hover:bg-purple-100 transition-colors">
            <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8
                   a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12
                   c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Chat IA</h3>
          <p class="text-xs text-gray-400">Asistente inteligente</p>
        </a>

        <a routerLink="/admin"
           class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                  hover:shadow-md hover:border-[#39A900]/30 transition-all duration-200 cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4
                      group-hover:bg-gray-100 transition-colors">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066
                   c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924
                   0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37
                   a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0
                   a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37
                   a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35
                   a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37
                   .996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Administración</h3>
          <p class="text-xs text-gray-400">Panel de control del sistema</p>
        </a>

        <a routerLink="/settings"
           class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                  hover:shadow-md hover:border-[#39A900]/30 transition-all duration-200 cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4
                      group-hover:bg-slate-100 transition-colors">
            <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-1">Perfil</h3>
          <p class="text-xs text-gray-400">Configura tu cuenta</p>
        </a>

      </div>
    </div>
  `,
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Equivalente a DocsPage.tsx de React.
 */
@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="flex flex-col items-center gap-8 py-8 w-full">

      <h1 class="text-4xl font-bold text-gray-800">Historial</h1>

      <!-- Buscador -->
      <div class="w-full max-w-md relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          type="text"
          [(ngModel)]="query"
          placeholder="Ingrese el documento o ID de curso"
          class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm
                 focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]
                 shadow-sm transition-colors"
        />
      </div>

      <!-- Resultados -->
      <div class="w-full max-w-3xl p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
        @if (!query) {
          <p class="text-gray-400 text-center text-sm">No hay resultados todavía. Realiza una búsqueda.</p>
        } @else {
          <p class="text-gray-400 text-center text-sm">Buscando "{{ query }}"...</p>
        }
      </div>

    </section>
  `,
})
export class HistorialComponent {
  query = '';
}

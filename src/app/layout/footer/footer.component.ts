import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="w-full bg-[#001f33] border-t border-white/5 px-6 h-10
                   flex items-center justify-between flex-shrink-0">

      <span class="text-[11px] text-white/30">© {{ year }} EPSAS</span>

      <!-- Redes sociales -->
      <div class="flex items-center gap-3">
        <a href="#" class="text-white/25 hover:text-[#39A900] transition-colors">
          <!-- Facebook -->
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094
              10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697
              1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.25h3.328
              l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
        </a>
        <a href="#" class="text-white/25 hover:text-[#39A900] transition-colors">
          <!-- Twitter/X -->
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99
              21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833
              L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a href="#" class="text-white/25 hover:text-[#39A900] transition-colors">
          <!-- YouTube -->
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501
              s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805
              31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502
              9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783
              31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
          </svg>
        </a>
      </div>

      <!-- Info -->
      <div class="flex items-center gap-4">
        <span class="text-[11px] text-white/30 flex items-center gap-1">
          <!-- MapPin -->
          <svg class="w-2.5 h-2.5 text-[#39A900]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243
                 a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Bogotá, Colombia
        </span>
        <a href="/privacidad" class="text-[11px] text-white/25 hover:text-white/60 transition-colors">Privacidad</a>
        <a href="/terminos"   class="text-[11px] text-white/25 hover:text-white/60 transition-colors">Términos</a>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}

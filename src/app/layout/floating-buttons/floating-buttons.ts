import { Component, OnDestroy } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-floating-buttons',
  standalone: true,
  imports: [LottieComponent, CommonModule, FormsModule],
  templateUrl: './floating-buttons.html',
  styleUrls: ['./floating-buttons.css'],
})
export class FloatingButtons implements OnDestroy {

  options = { path: 'robot.json', autoplay: true, loop: true };
  chatAbierto = false;
  mensajeUsuario = '';
  cargando = false;

  // ── Temporizadores ──
  private timerInactividad: any = null;
  private timerCierre: any = null;
  private TIEMPO_PREGUNTA = 2 * 60 * 1000;  // 2 minutos sin respuesta → pregunta
  private TIEMPO_CIERRE   = 1 * 60 * 1000;  // 1 minuto más → cierra

  mensajes: { rol: 'usuario' | 'asistente', texto: string }[] = [
    { rol: 'asistente', texto: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte con la plataforma?' }
  ];

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer
  ) {}

  // ── Reinicia los temporizadores cada vez que el usuario escribe ──
  private reiniciarTimer() {
    clearTimeout(this.timerInactividad);
    clearTimeout(this.timerCierre);

    // Después de 2 min sin actividad → pregunta si sigue ahí
    this.timerInactividad = setTimeout(() => {
      this.mensajes.push({
        rol: 'asistente',
        texto: '⏳ ¿Sigues ahí? Si no hay respuesta en 1 minuto, la conversación se cerrará automáticamente.'
      });

      // Después de 1 min más → cierra y reinicia
      this.timerCierre = setTimeout(() => {
        this.reiniciarConversacion();
      }, this.TIEMPO_CIERRE);

    }, this.TIEMPO_PREGUNTA);
  }

  private reiniciarConversacion() {
    clearTimeout(this.timerInactividad);
    clearTimeout(this.timerCierre);

    this.mensajes = [
      {
        rol: 'asistente',
        texto: '🔄 La conversación ha finalizado por inactividad. ¡Hola de nuevo! Soy tu asistente virtual. ¿En qué puedo ayudarte?'
      }
    ];

    // Genera nuevo sessionId para limpiar memoria en n8n
    this.chatService.resetSession();
  }

  formatearMensaje(texto: string): SafeHtml {
    let html = texto
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(\d+)\.\s(.+)/g, '<li><span class="paso-num">$1</span> $2</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>')
      .replace(/\.\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/g, '.<br><br>')
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  openAssistant() {
    this.chatAbierto = !this.chatAbierto;
    if (this.chatAbierto) {
      this.reiniciarTimer();
    } else {
      clearTimeout(this.timerInactividad);
      clearTimeout(this.timerCierre);
    }
  }

  enviar() {
    if (!this.mensajeUsuario.trim() || this.cargando) return;

    const texto = this.mensajeUsuario;
    this.mensajes.push({ rol: 'usuario', texto });
    this.mensajeUsuario = '';
    this.cargando = true;

    // Reinicia el timer cada vez que el usuario envía un mensaje
    this.reiniciarTimer();

    this.chatService.sendMessage(texto).subscribe({
      next: (res) => {
        this.mensajes.push({ rol: 'asistente', texto: res.output || 'Sin respuesta' });
        this.cargando = false;
      },
      error: () => {
        this.mensajes.push({ rol: 'asistente', texto: 'Ocurrió un error, intenta de nuevo.' });
        this.cargando = false;
      }
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timerInactividad);
    clearTimeout(this.timerCierre);
  }
}









// import { Component } from '@angular/core';
// import { LottieComponent } from 'ngx-lottie';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { ChatService } from '../../core/services/chat.service';

// @Component({
//   selector: 'app-floating-buttons',
//   standalone: true,
//   imports: [LottieComponent, CommonModule, FormsModule],
//   templateUrl: './floating-buttons.html',
//   styleUrls: ['./floating-buttons.css'],
// })
// export class FloatingButtons {

//   options = { path: 'robot.json', autoplay: true, loop: true };
//   chatAbierto = false;
//   mensajeUsuario = '';
//   cargando = false;

//   mensajes: { rol: 'usuario' | 'asistente', texto: string }[] = [
//     { rol: 'asistente', texto: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte con la plataforma?' }
//   ];

//   constructor(
//     private chatService: ChatService,
//     private sanitizer: DomSanitizer
//   ) {}

// formatearMensaje(texto: string): SafeHtml {
//   let html = texto
//     // Negritas **texto**
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     // Pasos numerados: "1. texto" → elemento de lista
//     .replace(/(\d+)\.\s(.+)/g, '<li><span class="paso-num">$1</span> $2</li>')
//     // Envolver listas en <ol>
//     .replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>')
//     // Espacio entre oraciones que empiezan con mayúscula
//     .replace(/\.\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/g, '.<br><br>')
//     // Saltos de línea
//     .replace(/\n/g, '<br>');

//   return this.sanitizer.bypassSecurityTrustHtml(html);
// }
//   openAssistant() {
//     this.chatAbierto = !this.chatAbierto;
//   }

//   enviar() {
//     if (!this.mensajeUsuario.trim() || this.cargando) return;

//     const texto = this.mensajeUsuario;
//     this.mensajes.push({ rol: 'usuario', texto });
//     this.mensajeUsuario = '';
//     this.cargando = true;

//     this.chatService.sendMessage(texto).subscribe({
//       next: (res) => {
//         this.mensajes.push({ rol: 'asistente', texto: res.output || 'Sin respuesta' });
//         this.cargando = false;
//       },
//       error: () => {
//         this.mensajes.push({ rol: 'asistente', texto: 'Ocurrió un error, intenta de nuevo.' });
//         this.cargando = false;
//       }
//     });
//   }
// }
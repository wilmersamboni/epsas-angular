import { Component } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-floating-buttons',
  standalone: true,
  imports: [LottieComponent, CommonModule, FormsModule],
  templateUrl: './floating-buttons.html',
  styleUrl: './floating-buttons.css',
})
export class FloatingButtons {

  options = {
    path: 'robot.json',
    autoplay: true,
    loop: true
  }

  chatAbierto = false;
  mensajeUsuario = '';
  cargando = false;

  mensajes: { rol: 'usuario' | 'asistente', texto: string }[] = [
    { rol: 'asistente', texto: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte con la plataforma?' }
  ];

  constructor(private chatService: ChatService) {}

  openAssistant() {
    this.chatAbierto = !this.chatAbierto;
  }

  enviar() {
    if (!this.mensajeUsuario.trim() || this.cargando) return;

    const texto = this.mensajeUsuario;
    this.mensajes.push({ rol: 'usuario', texto });
    this.mensajeUsuario = '';
    this.cargando = true;

    this.chatService.sendMessage(texto).subscribe({
      next: (res) => {
        this.mensajes.push({ rol: 'asistente', texto: res.reply });
        this.cargando = false;
      },
      error: () => {
        this.mensajes.push({ rol: 'asistente', texto: 'Ocurrió un error, intenta de nuevo.' });
        this.cargando = false;
      }
    });
  }
}
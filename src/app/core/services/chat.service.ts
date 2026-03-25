import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private webhookUrl = 'https://bot.kromas.lat/webhook/asistente';
  private sessionId = crypto.randomUUID();

  constructor(private http: HttpClient) {}

  // Genera nuevo sessionId → n8n empieza conversación desde cero
  resetSession() {
    this.sessionId = crypto.randomUUID();
  }

  sendMessage(userMessage: string): Observable<any> {
    return this.http.post<any>(this.webhookUrl, {
      message: userMessage,
      sessionId: this.sessionId
    });
  }
}
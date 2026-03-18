import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private webhookUrl = 'https://tu-n8n.com/webhook/asistente';

  constructor(private http: HttpClient) {}

  sendMessage(userMessage: string) {
    return this.http.post<any>(this.webhookUrl, {
      message: userMessage
    });
  }
}
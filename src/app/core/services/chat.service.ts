import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private webhookUrl = 'https://n8n.falla.lat/webhook-test/asistente';

  constructor(private http: HttpClient) {}

  // Llamada al webhook de n8n
  sendMessage(userMessage: string): Observable<any> {
    return this.http.post<any>(
      this.webhookUrl,
      { mensaje: userMessage },
      { withCredentials: false }  // <-- aquí le decimos al navegador que no envíe cookies
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stats {
  aprendices: number;
  seguimientos: number;
  documentos: number;
  instructores: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  private apiUrl = 'http://localhost:3000/api'; // 👈 cambia por tu URL del backend

  constructor(private http: HttpClient) {}

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/stats`);
  }
}
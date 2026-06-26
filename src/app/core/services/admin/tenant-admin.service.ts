import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTenantDto, Tenant, UpdateTenantDto } from '../../../shared/models/admin/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantAdminService {
  private readonly baseUrl = '/api/admin/tenants';

  constructor(private http: HttpClient) {}

  crear(dto: CreateTenantDto): Observable<Tenant> {
    return this.http.post<Tenant>(this.baseUrl, dto);
  }

  obtenerTodos(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.baseUrl);
  }

  obtenerPorId(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/${id}`);
  }

  actualizar(id: string, dto: UpdateTenantDto): Observable<Tenant> {
    return this.http.patch<Tenant>(`${this.baseUrl}/${id}`, dto);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleEstado(id: string, estado: 'activo' | 'inactivo'): Observable<Tenant> {
    return this.http.patch<Tenant>(`${this.baseUrl}/${id}`, { estado });
  }

  verificarConexion(id: string): Observable<{ erpDb: boolean; epsasDb: boolean }> {
    return this.http.get<{ erpDb: boolean; epsasDb: boolean }>(`${this.baseUrl}/${id}/verificar`);
  }

  reinicializar(id: string): Observable<{ login: string; password: string }> {
    return this.http.post<{ login: string; password: string }>(`${this.baseUrl}/${id}/reinicializar`, {});
  }
}

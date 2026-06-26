export type EstadoTenant = 'activo' | 'inactivo';

export interface Tenant {
  id: string;
  nombre: string;
  slug: string;
  dominio: string;
  estado: EstadoTenant;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateTenantDto {
  nombre: string;
  slug: string;
  dominio: string;
  estado?: EstadoTenant;
}

export type UpdateTenantDto = Partial<CreateTenantDto>;

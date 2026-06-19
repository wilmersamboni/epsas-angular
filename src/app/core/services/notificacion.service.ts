// ─────────────────────────────────────────────────────────────────────────────
// notificacion.service.ts
// Servicio centralizado para crear y gestionar notificaciones por roles.
//
// Reglas de negocio:
//   · APRENDIZ  → recibe notificaciones cuando:
//       1. El instructor aprueba/rechaza una bitácora suya
//       2. El admin sube/modifica/elimina un formato global
//   · INSTRUCTOR → recibe notificaciones cuando:
//       1. El aprendiz asignado sube una bitácora (PDF)
//       2. El admin sube/modifica/elimina un formato global
//   · ADMINISTRADOR → recibe notificaciones cuando:
//       1. Un instructor aprueba/rechaza un documento de aprendiz
//
// Cada notificación va dirigida a `destinatarios` (array de usuarioId).
// El backend filtra por sesión en GET /notificaciones, por lo que cada
// usuario solo ve sus propias notificaciones.
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const BASE = '/api';

export type TipoNotificacion =
    | 'bitacora_subida'
    | 'bitacora_aprobada'
    | 'bitacora_rechazada'
    | 'formato_nuevo'
    | 'formato_actualizado'
    | 'formato_eliminado'
    | 'seguimiento_revisado'
    | 'seguimiento_actualizado'
    | 'acta_subida';

export interface CrearNotificacionPayload {
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    destinatarios: string[];
    data?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {

    constructor(private http: HttpClient) { }

    // ── API base ──────────────────────────────────────────────────────────────

    async crear(payload: CrearNotificacionPayload): Promise<void> {
        try {
            await firstValueFrom(
                this.http.post(`${BASE}/notificaciones`, payload)
            );
        } catch (e) {
            console.warn('[NotificacionService] No se pudo crear notificación:', e);
        }
    }

    // ── Helpers por evento de negocio ─────────────────────────────────────────

    /** Aprendiz sube una bitácora → notifica al instructor asignado */
    async notificarBitacoraSubida(params: {
        instructorId: string;
        aprendizNombre: string;
        seguimientoId: string;
        fecha: string;
    }): Promise<void> {
        if (!params.instructorId) return;
        await this.crear({
            tipo: 'bitacora_subida',
            titulo: '📄 Nueva bitácora subida',
            mensaje: `${params.aprendizNombre} subió una bitácora el ${params.fecha}.`,
            destinatarios: [params.instructorId],
            data: { seguimientoId: params.seguimientoId, aprendizNombre: params.aprendizNombre },
        });
    }

    /** Instructor aprueba bitácora → notifica al aprendiz y a todos los admins */
    async notificarBitacoraAprobada(params: {
        aprendizId: string;
        adminIds: string[];
        instructorNombre: string;
        aprendizNombre: string;
        fecha: string;
        seguimientoId: string;
    }): Promise<void> {
        const destinatarios = [params.aprendizId, ...params.adminIds].filter(Boolean);
        if (!destinatarios.length) return;
        await this.crear({
            tipo: 'bitacora_aprobada',
            titulo: '✅ Bitácora aprobada',
            mensaje: `La bitácora de ${params.aprendizNombre} fue aprobada por ${params.instructorNombre} el ${params.fecha}.`,
            destinatarios,
            data: {
                seguimientoId: params.seguimientoId,
                aprendizNombre: params.aprendizNombre,
                instructorNombre: params.instructorNombre,
            },
        });
    }

    /** Instructor rechaza bitácora → notifica al aprendiz y a todos los admins */
    async notificarBitacoraRechazada(params: {
        aprendizId: string;
        adminIds: string[];
        instructorNombre: string;
        aprendizNombre: string;
        fecha: string;
        seguimientoId: string;
    }): Promise<void> {
        const destinatarios = [params.aprendizId, ...params.adminIds].filter(Boolean);
        if (!destinatarios.length) return;
        await this.crear({
            tipo: 'bitacora_rechazada',
            titulo: '❌ Bitácora rechazada',
            mensaje: `La bitácora de ${params.aprendizNombre} fue rechazada por ${params.instructorNombre} el ${params.fecha}.`,
            destinatarios,
            data: {
                seguimientoId: params.seguimientoId,
                aprendizNombre: params.aprendizNombre,
                instructorNombre: params.instructorNombre,
            },
        });
    }

    /** Admin sube un formato → notifica a instructores y aprendices */
    async notificarFormatoNuevo(params: {
        destinatarios: string[];
        formatoNombre: string;
        formatoTipo: string;
        adminNombre: string;
    }): Promise<void> {
        if (!params.destinatarios.length) return;
        await this.crear({
            tipo: 'formato_nuevo',
            titulo: '📂 Nuevo formato disponible',
            mensaje: `${params.adminNombre} subió el formato "${params.formatoNombre}" (${params.formatoTipo}).`,
            destinatarios: params.destinatarios,
            data: { formatoNombre: params.formatoNombre, formatoTipo: params.formatoTipo, adminNombre: params.adminNombre },
        });
    }

    /** Admin actualiza un formato → notifica a instructores y aprendices */
    async notificarFormatoActualizado(params: {
        destinatarios: string[];
        formatoNombre: string;
        adminNombre: string;
    }): Promise<void> {
        if (!params.destinatarios.length) return;
        await this.crear({
            tipo: 'formato_actualizado',
            titulo: '✏️ Formato actualizado',
            mensaje: `El formato "${params.formatoNombre}" fue actualizado por ${params.adminNombre}.`,
            destinatarios: params.destinatarios,
            data: { formatoNombre: params.formatoNombre, adminNombre: params.adminNombre },
        });
    }

    /** Admin elimina un formato → notifica a instructores y aprendices */
    async notificarFormatoEliminado(params: {
        destinatarios: string[];
        formatoNombre: string;
        adminNombre: string;
    }): Promise<void> {
        if (!params.destinatarios.length) return;
        await this.crear({
            tipo: 'formato_eliminado',
            titulo: '🗑️ Formato eliminado',
            mensaje: `El formato "${params.formatoNombre}" fue eliminado por ${params.adminNombre}.`,
            destinatarios: params.destinatarios,
            data: { formatoNombre: params.formatoNombre, adminNombre: params.adminNombre },
        });
    }

    // ── Resolución de destinatarios ───────────────────────────────────────────

    /** IDs de todos los administradores del sistema */
    async obtenerIdsAdmins(): Promise<string[]> {
        try {
            const resp: any = await firstValueFrom(
                this.http.get(`${BASE}/personas/por-cargo/administrador`)
            );
            const lista = Array.isArray(resp) ? resp : (resp?.data ?? []);
            return lista.map((p: any) => p.id ?? p.id_persona ?? p.usuarioId).filter(Boolean);
        } catch { return []; }
    }

    /** IDs de instructores y aprendices activos */
    async obtenerIdsInstructoresYAprendices(): Promise<{
        instructorIds: string[];
        aprendizIds: string[];
    }> {
        try {
            const [ri, ra] = await Promise.all([
                firstValueFrom(this.http.get<any>(`${BASE}/personas/por-cargo/instructor`)),
                firstValueFrom(this.http.get<any>(`${BASE}/personas/por-cargo/aprendiz`)),
            ]);
            const toIds = (r: any) => {
                const l = Array.isArray(r) ? r : (r?.data ?? []);
                return l.map((p: any) => p.id ?? p.id_persona ?? p.usuarioId).filter(Boolean);
            };
            return { instructorIds: toIds(ri), aprendizIds: toIds(ra) };
        } catch { return { instructorIds: [], aprendizIds: [] }; }
    }

    /** Instructor cambia estado de un seguimiento → notifica al aprendiz */
    async notificarSeguimientoRevisado(params: {
        aprendizId: string;
        instructorNombre: string;
        estado: string;
        fecha: string;
        seguimientoId: string;
    }): Promise<void> {
        if (!params.aprendizId) return;
        const emoji = params.estado === 'aprobado' ? '✅' : params.estado === 'rechazado' ? '❌' : '🔄';
        await this.crear({
            tipo: 'seguimiento_revisado',
            titulo: `${emoji} Seguimiento ${params.estado}`,
            mensaje: `Tu seguimiento fue marcado como "${params.estado}" por ${params.instructorNombre} el ${params.fecha}.`,
            destinatarios: [params.aprendizId],
            data: { seguimientoId: params.seguimientoId, estado: params.estado, instructorNombre: params.instructorNombre },
        });
    }

    /** Instructor actualiza observación de un seguimiento → notifica al aprendiz */
    async notificarSeguimientoActualizado(params: {
        aprendizId: string;
        instructorNombre: string;
        fecha: string;
        seguimientoId: string;
    }): Promise<void> {
        if (!params.aprendizId) return;
        await this.crear({
            tipo: 'seguimiento_actualizado',
            titulo: '📝 Seguimiento actualizado',
            mensaje: `${params.instructorNombre} actualizó la observación de tu seguimiento el ${params.fecha}.`,
            destinatarios: [params.aprendizId],
            data: { seguimientoId: params.seguimientoId, instructorNombre: params.instructorNombre },
        });
    }

    /** Instructor sube un acta PDF → notifica al aprendiz */
    async notificarActaSubida(params: {
        aprendizId: string;
        instructorNombre: string;
        fecha: string;
        seguimientoId: string;
    }): Promise<void> {
        if (!params.aprendizId) return;
        await this.crear({
            tipo: 'acta_subida',
            titulo: '📤 Acta de seguimiento subida',
            mensaje: `${params.instructorNombre} subió un acta PDF para tu seguimiento el ${params.fecha}.`,
            destinatarios: [params.aprendizId],
            data: { seguimientoId: params.seguimientoId, instructorNombre: params.instructorNombre },
        });
    }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  forkJoin,
  from,
  map,
  of,
  shareReplay,
  switchMap,
  throwError,
  catchError,
} from 'rxjs';
import {
  ResultadoConsulta,
  Estudiante,
  HistorialAcademico,
  EtapaPracticaItem,
  SeguimientoItem,
  BitacoraItem,
  AsignacionItem,
} from '../../shared/models/estudiante.model';

// Backend-epsas (personas, matrículas, cursos, programas)
const BASE = '/api';
// Backend-practica-hexagonal (etapa práctica, seguimientos, bitácoras)
const BASE2 = '/api2';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private http = inject(HttpClient);

  /** Cache de personas activas — se comparte entre todas las suscripciones */
  private activos$: Observable<any[]> | null = null;

  /**
   * Devuelve todos las personas activas del sistema.
   * La primera llamada hace el HTTP; las siguientes devuelven el mismo resultado
   * en memoria (shareReplay) sin repetir la petición.
   */
  listarActivos(): Observable<any[]> {
    if (!this.activos$) {
      this.activos$ = this.http.get<any>(`${BASE}/personas`).pipe(
        map((resp) => this.extractArray(resp, 'personas')),
        catchError(() => of([])),
        shareReplay(1),
      );
    }
    return this.activos$;
  }

  /**
   * Consulta compuesta del historial del aprendiz.
   *
   * Flujo:
   *   1. /api/personas/cedula/:cedula           → datos del aprendiz
   *   2. /api/matriculas/persona/:idPersona     → matrículas + cursos + programa
   *   3. /api2/etapa-practica/matricula/:idMat  → etapa práctica por cada matrícula
   *   4. /api2/seguimientos/etapa/:idEtapa      → seguimientos de la etapa
   *   5. /api2/bitacoras/seguimiento/:idSeg     → bitácoras de cada seguimiento
   *
   * El parámetro `documento` puede ser la cédula (numérica) del aprendiz.
   */
  consultar(documento: string): Observable<ResultadoConsulta> {
    const cedula = (documento ?? '').toString().trim();
    if (!cedula) return throwError(() => new Error('Documento vacío'));

    return this.http
      .get<any>(`${BASE}/personas/cedula/${cedula}`)
      .pipe(
        switchMap((persona) => {
          if (!persona) {
            return throwError(() => new Error('Persona no encontrada'));
          }
          const idPersona = persona.idPersona ?? persona.id_persona;

          return this.http
            .get<any>(`${BASE}/matriculas/persona/${idPersona}`)
            .pipe(
              map((resp) => this.extractArray(resp, 'matriculas')),
              catchError(() => of([] as any[])),
              switchMap((matriculas) =>
                this.resolverPracticas(matriculas).pipe(
                  map((practicas) => this.ensamblar(persona, matriculas, practicas)),
                ),
              ),
            );
        }),
      );
  }

  // ─── Resolvemos en paralelo la etapa-práctica de cada matrícula ────────────
  private resolverPracticas(matriculas: any[]): Observable<EtapaPracticaItem[]> {
    if (!matriculas.length) return of([]);

    const calls = matriculas.map((m) => {
      const idMat = m.idMatricula ?? m.id_matricula ?? m.id;
      if (!idMat) return of(null);

      return this.http
        .get<any>(`${BASE2}/etapa-practica/matricula/${idMat}`)
        .pipe(
          catchError(() => of(null)),
          switchMap((etapa) => {
            if (!etapa || (Array.isArray(etapa) && !etapa.length)) {
              return of(null);
            }
            const etapaObj = Array.isArray(etapa) ? etapa[0] : etapa;
            return forkJoin({
              seguimientos: this.resolverSeguimientos(etapaObj.id),
              asignaciones: this.http
                .get<any>(`${BASE2}/asignaciones/etapa/${etapaObj.id}`)
                .pipe(
                  map((r) => this.extractArray(r, 'asignaciones')),
                  catchError(() => of([])),
                ),
            }).pipe(
              map(({ seguimientos, asignaciones }) =>
                this.mapEtapa(etapaObj, m, seguimientos, asignaciones),
              ),
            );
          }),
        );
    });

    return forkJoin(calls).pipe(
      map((arr) => arr.filter((x): x is EtapaPracticaItem => !!x)),
    );
  }

  // ─── Seguimientos + sus bitácoras ──────────────────────────────────────────
  private resolverSeguimientos(etapaId: string): Observable<SeguimientoItem[]> {
  if (!etapaId) return of([]);

  return forkJoin({
    seguimientos: this.http
      .get<any>(`${BASE2}/seguimientos/etapa/${etapaId}`)
      .pipe(
        map((resp) => this.extractArray(resp, 'seguimientos')),
        catchError(() => of([]))
      ),

    observaciones: this.http
      .get<any>(`${BASE2}/observaciones/etapa/${etapaId}`)
      .pipe(
        map((resp) => this.extractArray(resp, 'observaciones')),
        catchError(() => of([]))
      )
  }).pipe(
    switchMap(({ seguimientos, observaciones }) => {
      if (!seguimientos.length) return of([]);

      const conDatos = seguimientos.map((s: any) =>
  forkJoin({
    bitacoras: this.http
      .get<any>(`${BASE2}/bitacoras/seguimiento/${s.id}`)
      .pipe(
        map((r) => this.extractArray(r, 'bitacoras')),
        catchError(() => of([]))
      ),

    observaciones: this.http
      .get<any>(`${BASE2}/observaciones/seguimiento/${s.id}`)
      .pipe(
        map((r) => this.extractArray(r, 'observaciones')),
        catchError(() => of([]))
      ),
  }).pipe(
    map(({ bitacoras, observaciones }) =>
      this.mapSeguimiento(s, bitacoras, observaciones)
    )
  )
);

return forkJoin(conDatos);
    })
  );
}

  // ─── Mapeos ────────────────────────────────────────────────────────────────
  private mapEtapa(
    e: any,
    mat: any,
    seguimientos: SeguimientoItem[],
    asignaciones: any[] = [],
  ): EtapaPracticaItem {
    const curso = mat?.curso ?? {};
    const programa = curso?.programa ?? {};
    return {
      id: e.id,
      idMatricula: e.matriculaId ?? mat.idMatricula ?? mat.id_matricula,
      fichaCurso: curso.codigo ?? '',
      programa: programa.nombre ?? '',
      fechaInicio: e.fecha_inicio ?? '',
      fechaFin: e.fecha_fin ?? '',
      estado: e.estado ?? '',
      observacion: e.observacion ?? '',
      empresa: e.empresa?.nombre ?? e.empresa?.razonSocial ?? '',
      modalidad: e.modalidad?.nombre ?? '',
      seguimientos,
      asignaciones: (asignaciones ?? []).map((a: any) => ({
        id: a.id,
        instructor: a.instructor ?? '',
        fechaInicio: a.fecha_inicio ?? '',
        fechaFin: a.fecha_fin ?? '',
        estado: a.estado ?? '',
        horas: a.horas ?? 0,
      })),
    };
  }

 private mapSeguimiento(
  s: any,
  bitacoras: any[],
  observaciones: any[]
): SeguimientoItem {
  return {
    id: s.id,
    estado: s.estado ?? '',
    observacion: s.observacion ?? '',
    fechaInicio: s.fecha_inicio ?? '',
    fechaFin: s.fecha_fin ?? '',
    actasPdf: s.actas_pdf,

    bitacoras: (bitacoras ?? []).map(b => ({
      id: b.id,
      fecha: b.fecha ?? '',
      estado: b.estado ?? '',
      pdf: b.bitacora_pdf,
    })),

    observaciones: (observaciones ?? []).map(o => ({
      id: o.id,
      fecha: o.fecha ?? '',
      descripcion: o.descripcion ?? '',
    })),
  };
}

  // ─── Ensambla el resultado final ───────────────────────────────────────────
  private ensamblar(
    persona: any,
    matriculas: any[],
    practicas: EtapaPracticaItem[],
  ): ResultadoConsulta {
    const nombreCompleto = String(persona.nombre ?? '').trim();
    const [nombre, ...apellido] = nombreCompleto.split(/\s+/);

    const programaPrincipal =
      matriculas[0]?.curso?.programa?.nombre ??
      matriculas[0]?.curso?.programa?.tipo ??
      'Sin programa asignado';

    const estudiante: Estudiante = {
      idPersona: persona.idPersona ?? persona.id_persona,
      documento: String(persona.cedula ?? persona.numeroDocumento ?? ''),
      nombre: nombre ?? nombreCompleto,
      apellido: apellido.join(' '),
      email: persona.correo ?? persona.email ?? '',
      telefono: String(persona.telefono ?? ''),
      programa: programaPrincipal,
      semestre: matriculas.length, // proxy: nº de matrículas
      estado: this.mapEstado(persona.estado),
    };

    const historial: HistorialAcademico[] = matriculas.map((m) => {
      const curso = m.curso ?? {};
      const programa = curso.programa ?? {};
      return {
        idMatricula: m.idMatricula ?? m.id_matricula ?? m.id,
        idCurso: curso.codigo ?? curso.idCurso ?? '',
        nombreCurso: programa.nombre ?? curso.codigo ?? 'Curso',
        creditos: 0,
        nota: 0,
        periodo: this.calcPeriodo(curso.fechaInicio ?? curso.fecha_inicio),
        estado: this.mapEstadoMatricula(m.estado, curso),
      };
    });

    return { estudiante, historial, practicas };
  }

  // ─── Utilidades ────────────────────────────────────────────────────────────
  private extractArray(resp: any, alt?: string): any[] {
    if (Array.isArray(resp)) return resp;
    if (resp?.data && Array.isArray(resp.data)) return resp.data;
    if (alt && Array.isArray(resp?.[alt])) return resp[alt];
    return [];
  }

  private mapEstado(estado: any): Estudiante['estado'] {
    const v = String(estado ?? '').toLowerCase();
    if (v === 'activo') return 'Activo';
    if (v === 'graduado') return 'Graduado';
    return 'Inactivo';
  }

  private mapEstadoMatricula(estado: any, curso: any): HistorialAcademico['estado'] {
    const v = String(estado ?? '').toLowerCase();
    if (v.includes('aprob')) return 'Aprobado';
    if (v.includes('reprob') || v.includes('cancel')) return 'Reprobado';
    // Si el curso aún no ha finalizado → "En curso"
    const fin = curso?.fechaFin ?? curso?.fecha_fin;
    if (fin && new Date(fin).getTime() > Date.now()) return 'En curso';
    return 'Aprobado';
  }

  private calcPeriodo(fecha: any): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const trimestre = Math.ceil((d.getMonth() + 1) / 3);
    return `${year}-${trimestre}`;
  }
}

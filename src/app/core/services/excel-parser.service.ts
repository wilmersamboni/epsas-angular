import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  MigrationRow,
  Persona,
  Ficha,
  EtapaPractica,
  Instructor,
  Matricula
} from '../../features/migracion/models/migration.models';

export interface ParsedSheets {
  yamboro: MigrationRow[];
  deportes: MigrationRow[];
  cancelados: MigrationRow[];
  acumulado: MigrationRow[];
  aprendices2025: MigrationRow[];
  aprendices2025111: MigrationRow[];
  instructores: Instructor[];
}

@Injectable({ providedIn: 'root' })
export class ExcelParserService {

  /**
   * Lee un File de Excel y devuelve los datos de cada hoja.
   */
  async parseFile(file: File): Promise<ParsedSheets> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    return {
      yamboro:        this.parseAprendicesSheet(workbook, workbook.SheetNames[0]),
      deportes:       this.parseAprendicesSheet(workbook, '6.DEPORTESX'),
      cancelados:     this.parseAprendicesSheet(workbook, 'Apredices cancelados desertados'),
      acumulado:      this.parseAcumuladoSheet(workbook, 'ACUMULADO'),
      aprendices2025: this.parseAprendices2025Sheet(workbook, 'Aprendices2025'),
      aprendices2025111: this.parseAprendices2025v2Sheet(workbook, 'Aprendices2025111'),
      instructores:   this.parseInstructoresSheet(workbook, '9. Datos instructores')
    };
  }

  // ─────────────────────────────────────────────────────────
  // Hoja principal de aprendices (Yamboro, Deportes, Cancelados)
  // Las primeras 2 filas son cabeceras; los datos empiezan en la fila 3
  // ─────────────────────────────────────────────────────────
  private parseAprendicesSheet(wb: XLSX.WorkBook, sheetName: string): MigrationRow[] {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return [];

    const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      dateNF: 'yyyy-mm-dd',
      raw: false
    }) as unknown[][];

    if (rawRows.length < 3) return [];

    const results: MigrationRow[] = [];

    for (let i = 2; i < rawRows.length; i++) {
      const r = rawRows[i] as string[];
      const docNum = this.clean(r[4]);
      if (!docNum) continue;

      results.push({
        instructorAsignado:  this.clean(r[0]),
        estado:              this.clean(r[1]),
        nombreAprendiz:      this.clean(r[2]),
        tipoDocumento:       this.clean(r[3]),
        numeroDocumento:     docNum,
        ficha:               this.clean(r[5]),
        nivel:               this.clean(r[6]),
        titulado:            this.clean(r[7]),
        telefonoAprendiz:    this.clean(r[8]),
        correo:              this.clean(r[9]),
        municipioResidencia: this.clean(r[10]),
        tipoAlternativa:     this.clean(r[11]),
        empresa:             this.clean(r[12]),
        direccion:           this.clean(r[13]),
        telefono:            this.clean(r[14]),
        ciudad:              this.clean(r[15]),
        correoEmpresa:       this.clean(r[16]),
        fechaInicio:         this.cleanDate(r[17]),
        fechaFin:            this.cleanDate(r[18]),
        novedades:           this.clean(r[19]),
        instructorSeguimiento: this.clean(r[20]),
        cumpleEP:            this.clean(r[44]),
        estadoAprendiz:      this.clean(r[45]),
        proyecto:            this.clean(r[46]),
        fechaReporte:        this.cleanDate(r[47]),
        rapPromover:         this.toNum(r[48]),
        rapProductiva:       this.toNum(r[49]),
        rapIngles:           this.toNum(r[50]),
        rapTecnico:          this.toNum(r[51]),
        totalRaps:           this.toNum(r[52]),
        fechaInicioTitulado: this.cleanDate(r[53]),
        fechaFinLectiva:     this.cleanDate(r[54]),
        fechaFinTitulado:    this.cleanDate(r[55]),
        fechaCon18Meses:     this.cleanDate(r[56]),
        estadoFichaTerminada: this.clean(r[57]),
        estadoFicha:         this.clean(r[58]),
        sede:                this.clean(r[59])
      });
    }

    return results;
  }

  // ─────────────────────────────────────────────────────────
  // Hoja ACUMULADO (estructura similar con columnas de seguimiento mes a mes)
  // ─────────────────────────────────────────────────────────
  private parseAcumuladoSheet(wb: XLSX.WorkBook, sheetName: string): MigrationRow[] {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return [];

    const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      dateNF: 'yyyy-mm-dd',
      raw: false
    }) as unknown[][];

    if (rawRows.length < 2) return [];

    const results: MigrationRow[] = [];

    for (let i = 1; i < rawRows.length; i++) {
      const r = rawRows[i] as string[];
      const docNum = this.clean(r[4]);
      if (!docNum) continue;

      results.push({
        instructorAsignado:  this.clean(r[0]),
        estado:              this.clean(r[1]),
        nombreAprendiz:      this.clean(r[2]),
        tipoDocumento:       this.clean(r[3]),
        numeroDocumento:     docNum,
        ficha:               this.clean(r[5]),
        nivel:               this.clean(r[6]),
        titulado:            this.clean(r[7]),
        telefonoAprendiz:    this.clean(r[8]),
        correo:              this.clean(r[9]),
        municipioResidencia: this.clean(r[10]),
        tipoAlternativa:     this.clean(r[11]),
        empresa:             this.clean(r[12]),
        direccion:           this.clean(r[13]),
        telefono:            this.clean(r[14]),
        ciudad:              this.clean(r[15]),
        correoEmpresa:       this.clean(r[16]),
        fechaInicio:         this.cleanDate(r[17]),
        fechaFin:            this.cleanDate(r[18]),
        novedades:           this.clean(r[19]),
        // Columnas de seguimiento mensuales (20-41) se omiten por ahora
        cumpleEP:            this.clean(r[46]),
        estadoAprendiz:      this.clean(r[47]),
        proyecto:            this.clean(r[48]),
        fechaReporte:        this.cleanDate(r[49]),
        rapPromover:         this.toNum(r[50]),
        rapProductiva:       this.toNum(r[51]),
        rapIngles:           this.toNum(r[52]),
        rapTecnico:          this.toNum(r[53]),
        totalRaps:           this.toNum(r[54]),
        fechaInicioTitulado: this.cleanDate(r[55]),
        fechaFinLectiva:     this.cleanDate(r[56]),
        fechaFinTitulado:    this.cleanDate(r[57]),
        fechaCon18Meses:     this.cleanDate(r[59]),
        estadoFichaTerminada: this.clean(r[60]),
        estadoFicha:         this.clean(r[61]),
        sede:                this.clean(r[62])
      });
    }

    return results;
  }

  // ─────────────────────────────────────────────────────────
  // Hoja Aprendices2025 (estructura diferente: una fila = un aprendiz completo)
  // ─────────────────────────────────────────────────────────
  private parseAprendices2025Sheet(wb: XLSX.WorkBook, sheetName: string): MigrationRow[] {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return [];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      dateNF: 'yyyy-mm-dd',
      raw: false
    });

    return rows.map((r) => ({
      tipoDocumento:      this.clean(r['Tipo de Documento']),
      numeroDocumento:    this.clean(r['Número de Documento']),
      nombre:             this.clean(r['Nombre']),
      apellidos:          this.clean(r['Apellidos']),
      estado:             this.clean(r['Estado']),
      promover:           this.toNum(r['PROMOVER']),
      productiva:         this.toNum(r['PRODUCTIVA']),
      ingles:             this.toNum(r['INGLES']),
      tecnico:            this.toNum(r['TECNICO']),
      totaraps:           this.toNum(r['TOTARAPS']),
      ficha:              this.clean(r['ID FICHA']),
      fechaInicio:        this.cleanDate(r['FECHA INICIO']),
      fechaFinLectiva:    this.cleanDate(r['FECHA LECTIVA']),
      fechaFin:           this.cleanDate(r['FECHA FIN']),
      titulado:           this.clean(r['PROGRAMA']),
      fechaReporte:       this.cleanDate(r['Fechareporte']),
      totProm:            this.toNum(r['TOT PROM']),
      totProd:            this.toNum(r['TOT PROD']),
      totIngle:           this.toNum(r['TOT INGLE']),
      totTecnico:         this.toNum(r['TOT TECNICO']),
      totalRaps:          this.toNum(r['TOTALRAPS']),
      totalRapsPrograma:  this.toNum(r['TOTAL RAPS-PROGR']),
      porcentajeEjecucion: this.toNum(r['% EJECUCION'])
    })).filter(r => r.numeroDocumento);
  }

  // ─────────────────────────────────────────────────────────
  // Hoja Aprendices2025111 (variante de Aprendices2025)
  // ─────────────────────────────────────────────────────────
  private parseAprendices2025v2Sheet(wb: XLSX.WorkBook, sheetName: string): MigrationRow[] {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return [];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      dateNF: 'yyyy-mm-dd',
      raw: false
    });

    return rows.map((r) => ({
      tipoDocumento:    this.clean(r['Tipo de Documento']),
      numeroDocumento:  this.clean(r['Número de Documento']),
      nombre:           this.clean(r['Nombre']),
      apellidos:        this.clean(r['Apellidos']),
      estado:           this.clean(r['Estado']),
      promover:         this.toNum(r['PROMOVER']),
      productiva:       this.toNum(r['PRODUCTIVA']),
      ingles:           this.toNum(r['INGLES']),
      tecnico:          this.toNum(r['TECNICO']),
      totaraps:         this.toNum(r['TOTARAPS']),
      ficha:            this.clean(r['ID FICHA']),
      fechaInicio:      this.cleanDate(r['FECHA INICIO']),
      fechaFinLectiva:  this.cleanDate(r['FECHA LECTIVA']),
      fechaFin:         this.cleanDate(r['FECHA FIN']),
      titulado:         this.clean(r['PROGRAMA']),
      fechaReporte:     this.cleanDate(r['Fechareporte']),
      totProm:          this.toNum(r['TOT PROM']),
      totProd:          this.toNum(r['TOT PROD']),
      totIngle:         this.toNum(r['TOT INGLE']),
      totTecnico:       this.toNum(r['TOT TECNICO']),
      totalRaps:        this.toNum(r['TOTALRAPS']),
      porcentajeEjecucion: this.toNum(r['% EJECUCION'])
    })).filter(r => r.numeroDocumento);
  }

  // ─────────────────────────────────────────────────────────
  // Hoja de instructores
  // ─────────────────────────────────────────────────────────
  private parseInstructoresSheet(wb: XLSX.WorkBook, sheetName: string): Instructor[] {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return [];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

    return (rows as Record<string, unknown>[])
      .map(r => ({
        nombre: this.clean(r['NOMBRE COMPLETO']) || '',
        area:   this.clean(r['AREA']),
        celular: this.clean(r['NO.CELULAR ']),
        correo:  this.clean(r['CORREO ELECTRONICO '])
      }))
      .filter(i => i.nombre);
  }

  // ─────────────────────────────────────────────────────────
  // Conversores de una MigrationRow a entidades del dominio
  // ─────────────────────────────────────────────────────────

  rowToPersona(row: MigrationRow): Persona {
    const fullName = row.nombreAprendiz
      || (row.nombre && row.apellidos ? `${row.nombre} ${row.apellidos}` : null)
      || row.nombre
      || '';

    return {
      nombre:          fullName,
      tipoDocumento:   row.tipoDocumento || 'CC',
      numeroDocumento: row.numeroDocumento || '',
      telefono:        row.telefonoAprendiz,
      correo:          row.correo,
      municipio:       row.municipioResidencia,
      estado:          'Activo'
    };
  }

  rowToFicha(row: MigrationRow): Partial<Ficha> {
    return {
      idFicha:            row.ficha || '',
      nombrePrograma:     row.titulado,
      nivel:              row.nivel,
      fechaInicioFicha:   this.dateToISO(row.fechaInicioTitulado),
      fechaFinLectiva:    this.dateToISO(row.fechaFinLectiva),
      fechaFin:           this.dateToISO(row.fechaFinTitulado),
      estadoCurso:        row.estadoFicha,
      sede:               row.sede
    };
  }

  rowToMatricula(row: MigrationRow): Partial<Matricula> {
    return {
      fichaNumero:        row.ficha || '',
      estado:             row.estadoAprendiz,
      promover:           row.rapPromover ?? row.promover,
      productiva:         row.rapProductiva ?? row.productiva,
      ingles:             row.rapIngles ?? row.ingles,
      tecnico:            row.rapTecnico ?? row.tecnico,
      totalRap:           row.totalRaps ?? row.totaraps,
      totPromover:        row.totProm,
      totProductiva:      row.totProd,
      totIngles:          row.totIngle,
      totTecnico:         row.totTecnico,
      totalRaps:          row.totalRaps,
      totalRapsPrograma:  row.totalRapsPrograma,
      porcentajeEjecucion: row.porcentajeEjecucion,
      fechaReporte:       this.dateToISO(row.fechaReporte)
    };
  }

  rowToEtapaPractica(row: MigrationRow): Partial<EtapaPractica> {
    return {
      tipoAlternativa:  row.tipoAlternativa,
      empresa:          row.empresa,
      direccionEmpresa: row.direccion,
      telefonoEmpresa:  row.telefono,
      ciudadEmpresa:    row.ciudad,
      correoEmpresa:    row.correoEmpresa,
      fechaInicio:      this.dateToISO(row.fechaInicio),
      fechaFin:         this.dateToISO(row.fechaFin),
      novedades:        row.novedades,
      instructorAsignado: row.instructorAsignado || row.instructorSeguimiento,
      cumpleEP:         row.cumpleEP,
      estadoAprendiz:   row.estadoAprendiz,
      proyecto:         row.proyecto
    };
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  private clean(val: unknown): string | undefined {
    if (val === null || val === undefined) return undefined;
    const s = String(val).trim();
    return s === '' || s.toLowerCase() === 'nan' || s.toLowerCase() === 'null' ? undefined : s;
  }

  private cleanDate(val: unknown): string | undefined {
    const s = this.clean(val);
    if (!s) return undefined;
    if (s.match(/^\d{4}-\d{2}-\d{2}/)) return s.substring(0, 10);
    return s;
  }

  private toNum(val: unknown): number | undefined {
    if (val === null || val === undefined || val === '') return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
  }

  private dateToISO(val: unknown): string | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val.toISOString().substring(0, 10);
    return this.cleanDate(val);
  }
}

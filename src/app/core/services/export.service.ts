import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { Stats, DonaStats } from './stats.service';

@Injectable({ providedIn: 'root' })
export class ExportService {

  // ── PDF ──────────────────────────────────────────────────────────────────
  exportarPDF(
    stats: Stats,
    etapaActiva: DonaStats,
    etapaCertificada: DonaStats,
    practicas: any[]
  ): void {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.setFillColor(57, 169, 0);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Panel de Control — Etapa Productiva', 14, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(fecha, 14, 22);

    // ── Tarjetas de estadísticas ────────────────────────────────────────────
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 14, 38);

    autoTable(doc, {
      startY: 42,
      head: [['Indicador', 'Valor']],
      body: [
        ['Total Aprendices activos',          stats.aprendices],
        ['Etapas productivas activas',         stats.seguimientos],
        ['Etapas desertadas',                  stats.documentos],
        ['Ejecuciones con éxito (certificadas)', stats.instructores],
      ],
      headStyles:    { fillColor: [57, 169, 0], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 235] },
      styles:        { fontSize: 10 },
      columnStyles:  { 1: { halign: 'center', fontStyle: 'bold' } },
    });

    // ── Gráficos de dona (texto) ────────────────────────────────────────────
    const afterTable = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Distribución Etapa Productiva', 14, afterTable);

    autoTable(doc, {
      startY: afterTable + 4,
      head: [['Indicador', 'Total', 'Porcentaje']],
      body: [
        ['En etapa productiva (activas)',      etapaActiva.total,      `${etapaActiva.porcentaje}%`],
        ['Otros aprendices',                   stats.aprendices - etapaActiva.total, '—'],
        ['Etapas certificadas',                etapaCertificada.total, `${etapaCertificada.porcentaje}%`],
        ['Pendientes por certificar',          stats.aprendices - etapaCertificada.total, '—'],
      ],
      headStyles:   { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      styles:       { fontSize: 10 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center', fontStyle: 'bold' } },
    });

    // ── Listado detallado de prácticas ──────────────────────────────────────
    const afterDona = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Listado Detallado de Prácticas', 14, afterDona);

    const filasPracticas = practicas.map((p: any) => [
  p.nombre         ?? '—',
  p.identificacion ?? p.documento ?? '—',
  p.ficha          ?? '—',
  p.programa       ?? '—',
  p.estado         ?? '—',
  p.fecha_inicio   ?? '—',
  p.fecha_fin      ?? '—',
  p.empresaNombre  ?? '—',
]);

autoTable(doc, {
  startY: afterDona + 4,
  head: [['Nombre', 'Identificación', 'Ficha', 'Programa', 'Estado', 'Fecha Inicio', 'Fecha Fin', 'Empresa']],
  body: filasPracticas,
  headStyles:         { fillColor: [57, 169, 0], textColor: 255 },
  alternateRowStyles: { fillColor: [240, 253, 235] },
  styles:             { fontSize: 7, cellPadding: 2 },
  columnStyles: {
    0: { cellWidth: 30 },  // Nombre
    1: { cellWidth: 20 },  // Identificación
    2: { cellWidth: 15 },  // Ficha
    3: { cellWidth: 35 },  // Programa
    4: { cellWidth: 18, halign: 'center' },  // Estado
    5: { cellWidth: 20, halign: 'center' },  // Fecha Inicio
    6: { cellWidth: 20, halign: 'center' },  // Fecha Fin
    7: { cellWidth: 25 },  // Empresa
  },
});

    // ── Pie de página ───────────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 8
      );
    }

    doc.save(`estadisticas_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ── Excel ────────────────────────────────────────────────────────────────
  async exportarExcel(
  stats: Stats,
  etapaActiva: DonaStats,
  etapaCertificada: DonaStats,
  practicas: any[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Panel de Control SENA';
  wb.created = new Date();

  // ── Colores corporativos ─────────────────────────────────────────────────
  const VERDE       = '39A900';
  const VERDE_CLARO = 'E8F5E9';
  const AZUL        = '1565C0';
  const AZUL_CLARO  = 'E3F2FD';
  const GRIS        = 'F5F5F5';
  const BLANCO      = 'FFFFFF';
  const TEXTO_OSC   = '212121';

  // ════════════════════════════════════════════════════════════════════════
  // HOJA 1 — RESUMEN
  // ════════════════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet('Resumen', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
  });

  ws1.columns = [
    { key: 'A', width: 40 },
    { key: 'B', width: 18 },
    { key: 'C', width: 18 },
  ];

  // ── Título principal ─────────────────────────────────────────────────────
  ws1.mergeCells('A1:C1');
  const titulo = ws1.getCell('A1');
  titulo.value     = '🌿  Panel de Control — Etapa Productiva';
  titulo.font      = { name: 'Calibri', size: 16, bold: true, color: { argb: BLANCO } };
  titulo.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE } };
  titulo.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(1).height = 36;

  // ── Fecha ────────────────────────────────────────────────────────────────
  ws1.mergeCells('A2:C2');
  const fechaCell = ws1.getCell('A2');
  fechaCell.value     = `Generado el ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  fechaCell.font      = { name: 'Calibri', size: 10, italic: true, color: { argb: BLANCO } };
  fechaCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E7D32' } };
  fechaCell.alignment = { horizontal: 'center' };
  ws1.getRow(2).height = 20;

  ws1.addRow([]); // espacio

  // ── Sección: Resumen General ─────────────────────────────────────────────
  const helper = {
    seccion(ws: ExcelJS.Worksheet, texto: string, color: string, fila: number) {
      ws.mergeCells(`A${fila}:C${fila}`);
      const c = ws.getCell(`A${fila}`);
      c.value     = texto;
      c.font      = { name: 'Calibri', size: 11, bold: true, color: { argb: BLANCO } };
      c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      c.alignment = { horizontal: 'left', indent: 1 };
      ws.getRow(fila).height = 22;
    },
    encabezado(ws: ExcelJS.Worksheet, cols: string[], fila: number, color: string) {
      const row = ws.getRow(fila);
      cols.forEach((v, i) => {
        const c = row.getCell(i + 1);
        c.value     = v;
        c.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: BLANCO } };
        c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border    = {
          top: { style: 'thin', color: { argb: 'BDBDBD' } },
          bottom: { style: 'thin', color: { argb: 'BDBDBD' } },
          left: { style: 'thin', color: { argb: 'BDBDBD' } },
          right: { style: 'thin', color: { argb: 'BDBDBD' } },
        };
      });
      row.height = 20;
    },
    fila(ws: ExcelJS.Worksheet, valores: any[], filaNum: number, esAlterna: boolean, colorAlterna: string) {
      const row = ws.getRow(filaNum);
      valores.forEach((v, i) => {
        const c = row.getCell(i + 1);
        c.value     = v;
        c.font      = { name: 'Calibri', size: 10, color: { argb: TEXTO_OSC } };
        c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: esAlterna ? colorAlterna : BLANCO } };
        c.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle', indent: i === 0 ? 1 : 0 };
        c.border    = {
          top: { style: 'hair', color: { argb: 'E0E0E0' } },
          bottom: { style: 'hair', color: { argb: 'E0E0E0' } },
          left: { style: 'thin', color: { argb: 'E0E0E0' } },
          right: { style: 'thin', color: { argb: 'E0E0E0' } },
        };
      });
      row.height = 18;
    }
  };

  let filaActual = 4;

  helper.seccion(ws1, '  📊  Resumen General', VERDE, filaActual++);
  helper.encabezado(ws1, ['Indicador', 'Valor', ''], filaActual++, VERDE);

  const resumenData = [
    ['Total Aprendices activos',              stats.aprendices,    ''],
    ['Etapas productivas activas',            stats.seguimientos,  ''],
    ['Etapas desertadas',                     stats.documentos,    ''],
    ['Ejecuciones con éxito (certificadas)',  stats.instructores,  ''],
  ];
  resumenData.forEach((r, i) => helper.fila(ws1, r, filaActual++, i % 2 === 1, VERDE_CLARO));

  filaActual++; // espacio

  helper.seccion(ws1, '  🍩  Distribución Etapa Productiva', AZUL, filaActual++);
  helper.encabezado(ws1, ['Indicador', 'Total', 'Porcentaje'], filaActual++, AZUL);

  const donaData = [
    ['En etapa productiva (activas)',     etapaActiva.total,                          `${etapaActiva.porcentaje}%`],
    ['Otros aprendices',                  stats.aprendices - etapaActiva.total,       '—'],
    ['Etapas certificadas',               etapaCertificada.total,                     `${etapaCertificada.porcentaje}%`],
    ['Pendientes por certificar',         stats.aprendices - etapaCertificada.total,  '—'],
  ];
  donaData.forEach((r, i) => helper.fila(ws1, r, filaActual++, i % 2 === 1, AZUL_CLARO));

  // ════════════════════════════════════════════════════════════════════════
  // HOJA 2 — PRÁCTICAS
  // ════════════════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet('Prácticas', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
  });

  ws2.columns = [
    { key: 'nombre',         width: 28 },
    { key: 'identificacion', width: 16 },
    { key: 'ficha',          width: 14 },
    { key: 'programa',       width: 36 },
    { key: 'estado',         width: 14 },
    { key: 'fecha_inicio',   width: 15 },
    { key: 'fecha_fin',      width: 15 },
    { key: 'empresaNombre',  width: 28 },
    { key: 'observacion',    width: 32 },
  ];

  // Título hoja 2
  ws2.mergeCells('A1:I1');
  const t2 = ws2.getCell('A1');
  t2.value     = '📋  Listado Detallado de Prácticas';
  t2.font      = { name: 'Calibri', size: 14, bold: true, color: { argb: BLANCO } };
  t2.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE } };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 32;

  // Encabezados
  const cols = ['Nombre', 'Identificación', 'Ficha', 'Programa', 'Estado', 'Fecha Inicio', 'Fecha Fin', 'Empresa', 'Observación'];
  const hRow = ws2.getRow(2);
  cols.forEach((v, i) => {
    const c = hRow.getCell(i + 1);
    c.value     = v;
    c.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: BLANCO } };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E7D32' } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border    = {
      top:    { style: 'medium', color: { argb: VERDE } },
      bottom: { style: 'medium', color: { argb: VERDE } },
      left:   { style: 'thin',   color: { argb: BLANCO } },
      right:  { style: 'thin',   color: { argb: BLANCO } },
    };
  });
  hRow.height = 22;

  // ── Colores por estado ───────────────────────────────────────────────────
  const estadoColor: Record<string, string> = {
    'activo':      'E8F5E9',
    'activa':      'E8F5E9',
    'certificada': 'E3F2FD',
    'certificado': 'E3F2FD',
    'desertado':   'FFF3E0',
    'desertada':   'FFF3E0',
    'retirado':    'FFEBEE',
  };

  practicas.forEach((p: any, i: number) => {
    const colorFila = estadoColor[p.estado?.toLowerCase()] ?? (i % 2 === 0 ? BLANCO : GRIS);
    const row = ws2.addRow([
      p.nombre         ?? '—',
      p.identificacion ?? '—',
      p.ficha          ?? '—',
      p.programa       ?? '—',
      p.estado         ?? '—',
      p.fecha_inicio   ?? '—',
      p.fecha_fin      ?? '—',
      p.empresaNombre  ?? '—',
      p.observacion    ?? '—',
    ]);
    row.height = 18;
    row.eachCell((cell, colNum) => {
      cell.font      = { name: 'Calibri', size: 9, color: { argb: TEXTO_OSC } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorFila } };
      cell.alignment = { vertical: 'middle', horizontal: colNum === 1 || colNum === 4 || colNum === 9 ? 'left' : 'center', wrapText: colNum === 4 || colNum === 9 };
      cell.border    = {
        top:    { style: 'hair', color: { argb: 'E0E0E0' } },
        bottom: { style: 'hair', color: { argb: 'E0E0E0' } },
        left:   { style: 'thin', color: { argb: 'E0E0E0' } },
        right:  { style: 'thin', color: { argb: 'E0E0E0' } },
      };
    });
  });

  // Fila de totales
  const totalRow = ws2.addRow([`Total: ${practicas.length} prácticas`, '', '', '', '', '', '', '', '']);
  ws2.mergeCells(`A${totalRow.number}:I${totalRow.number}`);
  const totalCell = ws2.getCell(`A${totalRow.number}`);
  totalCell.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: BLANCO } };
  totalCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE } };
  totalCell.alignment = { horizontal: 'center' };
  totalRow.height     = 20;

  // ── Autofilter en hoja 2 ─────────────────────────────────────────────────
  ws2.autoFilter = { from: 'A2', to: 'I2' };

  // ── Fijar primera fila ───────────────────────────────────────────────────
  ws2.views = [{ state: 'frozen', ySplit: 2 }];

  // ── Descargar ────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `estadisticas_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

  
}
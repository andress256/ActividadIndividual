import { Injectable } from '@angular/core';
import { IncidentFilter } from '../../models/incident-filter.model';
import {
  IncidentView,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '../../models/incident.model';

const HEADERS = ['Código', 'Título', 'Departamento', 'Prioridad', 'Estado', 'Fecha', 'Creada por'];

/** Genera y descarga informes tabulados de incidencias en CSV y PDF. */
@Injectable({ providedIn: 'root' })
export class ReportExportService {
  /** Convierte las filas en matriz de texto (misma estructura para CSV y PDF). */
  toTable(rows: IncidentView[]): string[][] {
    return rows.map((row) => [
      row.id,
      row.title,
      row.departmentName,
      PRIORITY_LABELS[row.priority],
      STATUS_LABELS[row.status],
      new Date(row.createdAt).toLocaleDateString('es-ES'),
      row.createdBy,
    ]);
  }

  /**
   * CSV con separador `;` (el que espera Excel en español). Los campos con
   * separador, comillas o saltos de línea se entrecomillan y las comillas se
   * duplican (RFC 4180).
   */
  toCsv(rows: IncidentView[]): string {
    const escape = (value: string) =>
      /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    return [HEADERS, ...this.toTable(rows)]
      .map((line) => line.map(escape).join(';'))
      .join('\r\n');
  }

  /** Texto legible con los filtros aplicados, para la cabecera del informe. */
  describeFilter(filter: Partial<IncidentFilter>): string {
    const parts: string[] = [];
    if (filter.search) parts.push(`búsqueda "${filter.search}"`);
    if (filter.status && filter.status !== 'all') parts.push(`estado ${STATUS_LABELS[filter.status]}`);
    if (filter.priority && filter.priority !== 'all') parts.push(`prioridad ${PRIORITY_LABELS[filter.priority]}`);
    if (filter.from) parts.push(`desde ${filter.from}`);
    if (filter.to) parts.push(`hasta ${filter.to}`);
    return parts.length ? parts.join(', ') : 'sin filtros';
  }

  exportCsv(rows: IncidentView[]): void {
    // BOM UTF-8 para que Excel muestre bien tildes y eñes.
    const blob = new Blob(['﻿' + this.toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    this.download(blob, `${this.fileName()}.csv`);
  }

  /**
   * PDF con cabecera, resumen y tabla paginada (jsPDF + autotable). Las
   * librerías se cargan bajo demanda para no aumentar el bundle inicial.
   */
  async exportPdf(rows: IncidentView[], filter: Partial<IncidentFilter> = {}): Promise<void> {
    const [{ jsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const width = doc.internal.pageSize.getWidth();

    doc.setFillColor(29, 95, 168);
    doc.rect(0, 0, width, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Incidencias360 · Informe de incidencias', 14, 14);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 30);
    doc.text(`Filtros: ${this.describeFilter(filter)}`, 14, 36);

    const count = (status: keyof typeof STATUS_LABELS) => rows.filter((r) => r.status === status).length;
    doc.text(
      `Total: ${rows.length}   ·   Abiertas: ${count('open')}   ·   En curso: ${count('in-progress')}   ·   Cerradas: ${count('closed')}`,
      14,
      42,
    );

    autoTable(doc, {
      startY: 48,
      head: [HEADERS],
      body: this.toTable(rows),
      theme: 'striped',
      headStyles: { fillColor: [29, 95, 168], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 1: { cellWidth: 80 } },
      didDrawPage: () => {
        const page = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${page}`, width - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
        doc.text('Datos sintéticos de demostración', 14, doc.internal.pageSize.getHeight() - 8);
      },
    });

    doc.save(`${this.fileName()}.pdf`);
  }

  private fileName(): string {
    return `informe-incidencias-${new Date().toISOString().slice(0, 10)}`;
  }

  private download(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }
}

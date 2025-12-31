import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ExportData {
  fileName: string;
  statistics?: Record<string, any>;
  rawData?: any[];
  insights?: string[];
  charts?: any[];
}

export async function exportData(data: ExportData, format: ExportFormat) {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFileName = data.fileName.replace(/\.[^/.]+$/, '') || 'analysis';

  switch (format) {
    case 'json':
      exportJSON(data, `${baseFileName}_${timestamp}.json`);
      break;
    case 'csv':
      exportCSV(data, `${baseFileName}_${timestamp}.csv`);
      break;
    case 'excel':
      exportExcel(data, `${baseFileName}_${timestamp}.xlsx`);
      break;
    case 'pdf':
      await exportPDF(data, `${baseFileName}_${timestamp}.pdf`);
      break;
  }
}

function exportJSON(data: ExportData, fileName: string) {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportCSV(data: ExportData, fileName: string) {
  if (!data.rawData || data.rawData.length === 0) {
    alert('No data to export as CSV');
    return;
  }

  // Get headers from first row
  const headers = Object.keys(data.rawData[0]);
  
  // Create CSV content
  const csvRows = [
    headers.join(','),
    ...data.rawData.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (value == null) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportExcel(data: ExportData, fileName: string) {
  const workbook = XLSX.utils.book_new();

  // Add raw data sheet
  if (data.rawData && data.rawData.length > 0) {
    const wsData = XLSX.utils.json_to_sheet(data.rawData);
    XLSX.utils.book_append_sheet(workbook, wsData, 'Raw Data');
  }

  // Add statistics sheet
  if (data.statistics && Object.keys(data.statistics).length > 0) {
    const statsArray = Object.entries(data.statistics).map(([key, value]) => ({
      Metric: key,
      Value: value
    }));
    const wsStats = XLSX.utils.json_to_sheet(statsArray);
    XLSX.utils.book_append_sheet(workbook, wsStats, 'Statistics');
  }

  // Add insights sheet
  if (data.insights && data.insights.length > 0) {
    const insightsArray = data.insights.map((insight, index) => ({
      'Insight #': index + 1,
      'Insight': insight
    }));
    const wsInsights = XLSX.utils.json_to_sheet(insightsArray);
    XLSX.utils.book_append_sheet(workbook, wsInsights, 'Insights');
  }

  XLSX.writeFile(workbook, fileName);
}

async function exportPDF(data: ExportData, fileName: string) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Data Analysis Report', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`File: ${data.fileName}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);
  
  let yPosition = 50;

  // Statistics Section
  if (data.statistics && Object.keys(data.statistics).length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Statistics', 14, yPosition);
    yPosition += 10;

    const statsData = Object.entries(data.statistics).map(([key, value]) => [
      key.replace(/_/g, ' '),
      String(value)
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Insights Section
  if (data.insights && data.insights.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Key Insights', 14, yPosition);
    yPosition += 10;

    const insightsText = data.insights.map((insight, index) => `${index + 1}. ${insight}`).join('\n\n');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitInsights = doc.splitTextToSize(insightsText, 180);
    doc.text(splitInsights, 14, yPosition);
    yPosition += splitInsights.length * 6 + 10;
  }

  // Raw Data Section (first 50 rows to keep PDF manageable)
  if (data.rawData && data.rawData.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Raw Data', 14, yPosition);
    yPosition += 10;

    const displayData = data.rawData.slice(0, 50);
    const headers = Object.keys(displayData[0]);
    const tableData = displayData.map(row => headers.map(header => String(row[header] || '')));

    autoTable(doc, {
      startY: yPosition,
      head: [headers],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    if (data.rawData.length > 50) {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Showing first 50 rows of ${data.rawData.length} total rows`, 14, finalY);
    }
  }

  doc.save(fileName);
}


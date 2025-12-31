import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface AnalysisResult {
  charts: any[];
  statistics: Record<string, any>;
  rawData: any[];
  insights: string[];
}

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const fileType = file.type || '';
  const fileName = file.name.toLowerCase();

  console.log('Analyzing file:', { fileType, fileName });

  let rawData: any[] = [];
  let textContent = '';

  try {
    // Parse file based on type or extension
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      try {
        // Dynamic import for server-side only (works in API routes)
        const pdfParse = (await import('pdf-parse')).default;
        // Buffer is available in Node.js runtime
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(buffer);
        textContent = pdfData.text;
        rawData = parseTextToData(textContent);
      } catch (error: any) {
        console.error('PDF parsing error:', error);
        // Fallback: provide basic info
        textContent = 'PDF file uploaded. Text extraction encountered an issue.';
        rawData = [{ 
          filename: fileName,
          type: 'PDF',
          message: 'PDF parsing encountered an error. Trying alternative extraction...',
          error: error?.message || 'Unknown error'
        }];
      }
    } else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      const text = await file.text();
      const parsed = Papa.parse(text, { 
        header: true, 
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });
      rawData = parsed.data as any[];
      // Filter out empty rows
      rawData = rawData.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== ''));
    } else if (
      fileType.includes('spreadsheet') ||
      fileType.includes('excel') ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls')
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rawData = XLSX.utils.sheet_to_json(worksheet);
    } else if (
      fileType.includes('wordprocessingml') ||
      fileType.includes('msword') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx')
    ) {
      // For Word documents, we'll extract text (simplified)
      // Note: Full Word parsing would require additional libraries
      const text = await file.text();
      textContent = text;
      rawData = parseTextToData(textContent);
    } else {
      // Plain text or unknown type - try to parse as text
      const text = await file.text();
      textContent = text;
      
      // Try CSV parsing first (in case file type wasn't detected)
      if (text.includes(',') && text.split('\n').length > 1) {
        try {
          const parsed = Papa.parse(text, { 
            header: true, 
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
          });
          if (parsed.data && parsed.data.length > 0) {
            rawData = parsed.data as any[];
            rawData = rawData.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== ''));
          } else {
            rawData = parseTextToData(textContent);
          }
        } catch {
          rawData = parseTextToData(textContent);
        }
      } else {
        rawData = parseTextToData(textContent);
      }
    }

    console.log('Parsed data rows:', rawData.length);

    // Analyze the data
    return analyzeData(rawData, textContent);
  } catch (error: any) {
    console.error('Error in analyzeFile:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

function parseTextToData(text: string): any[] {
  // Try to extract structured data from text
  const lines = text.split('\n').filter(line => line.trim());
  const data: any[] = [];

  // Look for patterns like "Key: Value" or tab-separated values
  for (const line of lines) {
    if (line.includes(':') || line.includes('\t')) {
      const parts = line.includes(':') 
        ? line.split(':').map(p => p.trim())
        : line.split('\t').map(p => p.trim());
      
      if (parts.length >= 2) {
        const obj: any = {};
        for (let i = 0; i < parts.length - 1; i += 2) {
          obj[parts[i]] = parts[i + 1];
        }
        if (Object.keys(obj).length > 0) {
          data.push(obj);
        }
      }
    } else if (line.match(/^\d+[\s,]+[\d.]+/)) {
      // Number patterns
      const numbers = line.match(/[\d.]+/g);
      if (numbers && numbers.length >= 2) {
        data.push({
          index: numbers[0],
          value: parseFloat(numbers[1]),
        });
      }
    }
  }

  return data.length > 0 ? data : [{ content: text.substring(0, 500) }];
}

function analyzeData(data: any[], textContent: string): AnalysisResult {
  // Filter out completely empty rows
  const filteredData = (data || []).filter(row => {
    if (!row || typeof row !== 'object') return false;
    const values = Object.values(row);
    return values.some(v => v != null && v !== '' && String(v).trim() !== '');
  });

  if (!filteredData || filteredData.length === 0) {
    return {
      charts: [],
      statistics: { 
        message: 'No structured data found',
        file_processed: true
      },
      rawData: data || [],
      insights: [
        'No structured data could be extracted from the file.',
        'The file may contain unstructured text or be in an unsupported format.',
        'Try uploading a CSV, Excel, or structured text file.'
      ],
    };
  }

  const charts: any[] = [];
  const statistics: Record<string, any> = {};
  const insights: string[] = [];

  // Get all numeric columns
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  if (filteredData.length > 0 && filteredData[0] && typeof filteredData[0] === 'object') {
    Object.keys(filteredData[0]).forEach((key) => {
      const values = filteredData.map((row) => row[key]).filter((v) => v != null && v !== '');
      if (values.length === 0) return;
      
      const numericValues = values.filter((v) => {
        const num = Number(v);
        return !isNaN(num) && isFinite(num) && v !== '';
      });
      
      if (numericValues.length > values.length * 0.7) {
        numericColumns.push(key);
      } else {
        categoricalColumns.push(key);
      }
    });
  }

  // Generate statistics
  statistics.total_rows = filteredData.length;
  statistics.total_columns = filteredData.length > 0 && filteredData[0] ? Object.keys(filteredData[0]).length : 0;
  statistics.numeric_columns = numericColumns.length;
  statistics.categorical_columns = categoricalColumns.length;

  // Generate charts for numeric data
  numericColumns.forEach((col) => {
    const values = filteredData
      .map((row) => {
        const val = row[col];
        const num = parseFloat(String(val));
        return isNaN(num) ? null : num;
      })
      .filter((v) => v !== null && isFinite(v)) as number[];

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      statistics[`${col}_avg`] = avg.toFixed(2);
      statistics[`${col}_min`] = min.toFixed(2);
      statistics[`${col}_max`] = max.toFixed(2);
      statistics[`${col}_sum`] = sum.toFixed(2);

      // Create bar chart for distribution
      const bins = createBins(values, 10);
      charts.push({
        type: 'bar',
        title: `Distribution of ${col}`,
        data: bins.map((bin, i) => ({
          name: `${bin.min.toFixed(1)}-${bin.max.toFixed(1)}`,
          value: bin.count,
        })),
        series: [{ key: 'value', name: 'Frequency' }],
      });

      // Create line chart for trend
      if (values.length > 1) {
        charts.push({
          type: 'line',
          title: `Trend of ${col}`,
          data: values.slice(0, 50).map((val, i) => ({
            name: `Item ${i + 1}`,
            value: val,
          })),
          series: [{ key: 'value', name: col }],
        });
      }
    }
  });

  // Generate charts for categorical data
  categoricalColumns.slice(0, 3).forEach((col) => {
    const valueCounts: Record<string, number> = {};
    filteredData.forEach((row) => {
      const value = String(row[col] || 'Unknown').trim();
      if (value) {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      }
    });

    const sortedEntries = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sortedEntries.length > 0) {
      charts.push({
        type: 'pie',
        title: `Distribution of ${col}`,
        data: sortedEntries.map(([name, value]) => ({ name, value })),
      });

      charts.push({
        type: 'bar',
        title: `Count by ${col}`,
        data: sortedEntries.map(([name, value]) => ({ name, value })),
        series: [{ key: 'value', name: 'Count' }],
      });
    }
  });

  // Generate insights
  insights.push(`Analyzed ${filteredData.length} rows of data`);
  if (numericColumns.length > 0) {
    insights.push(`Found ${numericColumns.length} numeric column(s) for quantitative analysis`);
  }
  if (categoricalColumns.length > 0) {
    insights.push(`Found ${categoricalColumns.length} categorical column(s) for distribution analysis`);
  }
  if (filteredData.length > 100) {
    insights.push('Large dataset detected - showing first 100 rows in table view');
  }

  return {
    charts,
    statistics,
    rawData: filteredData,
    insights,
  };
}

function createBins(values: number[], binCount: number): Array<{ min: number; max: number; count: number }> {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / binCount;

  const bins: Array<{ min: number; max: number; count: number }> = [];
  for (let i = 0; i < binCount; i++) {
    bins.push({
      min: min + i * binSize,
      max: min + (i + 1) * binSize,
      count: 0,
    });
  }

  values.forEach((value) => {
    const binIndex = Math.min(
      Math.floor((value - min) / binSize),
      binCount - 1
    );
    bins[binIndex].count++;
  });

  return bins;
}


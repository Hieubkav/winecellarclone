import ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  required?: boolean;
  type?: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

export interface ExcelTemplateOptions {
  sheetName: string;
  columns: ExcelColumn[];
  data?: Record<string, unknown>[];
  includeExample?: boolean;
}

export function createWorkbook(): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WineCellar Admin';
  workbook.created = new Date();
  return workbook;
}

export function styleHeaderRow(worksheet: ExcelJS.Worksheet, rowNumber: number = 1): void {
  const headerRow = worksheet.getRow(rowNumber);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;
  headerRow.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };
}

export function addDataValidation(
  worksheet: ExcelJS.Worksheet,
  column: ExcelColumn,
  startRow: number,
  endRow: number
): void {
  const colLetter = String.fromCharCode(65 + worksheet.columns.findIndex(c => c.key === column.key));
  
  if (column.type === 'select' && column.options && column.options.length > 0) {
    for (let row = startRow; row <= endRow; row++) {
      const cell = worksheet.getCell(`${colLetter}${row}`);
      cell.dataValidation = {
        type: 'list',
        allowBlank: !column.required,
        formulae: [`"${column.options.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Giá trị không hợp lệ',
        error: `Vui lòng chọn một trong: ${column.options.join(', ')}`
      };
    }
  } else if (column.type === 'number') {
    for (let row = startRow; row <= endRow; row++) {
      const cell = worksheet.getCell(`${colLetter}${row}`);
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        formulae: [0],
        allowBlank: !column.required,
        showErrorMessage: true,
        errorTitle: 'Giá trị không hợp lệ',
        error: 'Vui lòng nhập số >= 0'
      };
    }
  } else if (column.type === 'boolean') {
    for (let row = startRow; row <= endRow; row++) {
      const cell = worksheet.getCell(`${colLetter}${row}`);
      cell.dataValidation = {
        type: 'list',
        allowBlank: !column.required,
        formulae: ['"Có,Không"'],
        showErrorMessage: true,
        errorTitle: 'Giá trị không hợp lệ',
        error: 'Vui lòng chọn "Có" hoặc "Không"'
      };
    }
  }
}

export function createTemplateSheet(
  workbook: ExcelJS.Workbook,
  options: ExcelTemplateOptions
): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet(options.sheetName);
  
  worksheet.columns = options.columns.map(col => ({
    header: col.header + (col.required ? ' *' : ''),
    key: col.key,
    width: col.width || 20
  }));
  
  styleHeaderRow(worksheet, 1);
  
  if (options.data && options.data.length > 0) {
    options.data.forEach(row => {
      worksheet.addRow(row);
    });
    
    const maxRows = options.data.length + 100;
    for (const column of options.columns) {
      addDataValidation(worksheet, column, 2, maxRows);
    }
  } else if (options.includeExample) {
    const exampleRow: Record<string, unknown> = {};
    options.columns.forEach(col => {
      if (col.key === 'id') exampleRow[col.key] = '';
      else if (col.key === 'name') exampleRow[col.key] = 'Rượu vang đỏ Chile Reserva';
      else if (col.key === 'slug') exampleRow[col.key] = 'ruou-vang-do-chile-reserva';
      else if (col.key === 'type_name' && col.options) exampleRow[col.key] = col.options[0];
      else if (col.key === 'category_name' && col.options) exampleRow[col.key] = col.options[0];
      else if (col.key === 'price') exampleRow[col.key] = 500000;
      else if (col.key === 'original_price') exampleRow[col.key] = 600000;
      else if (col.key === 'active') exampleRow[col.key] = 'Có';
      else if (col.key === 'description') exampleRow[col.key] = 'Rượu vang đỏ cao cấp từ Chile với hương vị trái cây chín mọng';
      else if (col.key === 'volume_ml') exampleRow[col.key] = 750;
      else if (col.key === 'alcohol_percent') exampleRow[col.key] = 13.5;
      else if (col.key === 'country') exampleRow[col.key] = 'Chile';
      else if (col.key === 'region') exampleRow[col.key] = 'Maipo Valley';
      else if (col.key === 'vintage') exampleRow[col.key] = 2020;
      else exampleRow[col.key] = '';
    });
    worksheet.addRow(exampleRow);
    
    for (const column of options.columns) {
      addDataValidation(worksheet, column, 2, 102);
    }
  }
  
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  
  return worksheet;
}

export async function exportToExcel(
  filename: string,
  sheets: ExcelTemplateOptions[]
): Promise<void> {
  const workbook = createWorkbook();
  
  for (const sheet of sheets) {
    createTemplateSheet(workbook, sheet);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function readExcelFile(file: File): Promise<ExcelJS.Workbook> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

export function worksheetToJson(worksheet: ExcelJS.Worksheet): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = [];
  const headers: string[] = [];
  
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value).replace(' *', '');
  });
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    
    const rowData: Record<string, unknown> = {};
    let hasData = false;
    
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        rowData[header] = cell.value;
        if (cell.value) hasData = true;
      }
    });
    
    if (hasData) {
      data.push(rowData);
    }
  });
  
  return data;
}

export function validateProductRow(row: Record<string, unknown>, columns: ExcelColumn[]): string[] {
  const errors: string[] = [];
  
  columns.forEach(col => {
    const value = row[col.header.replace(' *', '')];
    
    if (col.required && !value) {
      errors.push(`${col.header} là bắt buộc`);
    }
    
    if (value && col.type === 'number' && isNaN(Number(value))) {
      errors.push(`${col.header} phải là số`);
    }
    
    if (value && col.type === 'select' && col.options && !col.options.includes(String(value))) {
      errors.push(`${col.header} phải là một trong: ${col.options.join(', ')}`);
    }
  });
  
  return errors;
}

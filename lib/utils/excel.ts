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
      else if (col.key === 'category_names') exampleRow[col.key] = 'Rượu vang đỏ, Chile';
      else if (col.key === 'price') exampleRow[col.key] = 500000;
      else if (col.key === 'original_price') exampleRow[col.key] = 600000;
      else if (col.key === 'active') exampleRow[col.key] = 'Có';
      else if (col.key === 'cover_image_url') exampleRow[col.key] = 'https://example.com/images/product.jpg';
      else if (col.key === 'additional_images') exampleRow[col.key] = 'https://example.com/images/product-2.jpg; https://example.com/images/product-3.jpg';
      else if (col.key === 'description') exampleRow[col.key] = '<p>Rượu vang đỏ cao cấp từ Chile với hương vị trái cây chín mọng</p>';
      else if (col.key.startsWith('attr_')) {
        if (col.type === 'number') exampleRow[col.key] = col.header.includes('ml') ? 750 : col.header.includes('%') ? 13.5 : 2020;
        else exampleRow[col.key] = col.header.includes('Quốc') ? 'Chile' : 'Example';
      }
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

function createGuideSheet(
  workbook: ExcelJS.Workbook,
  types: Array<{ id: number; name: string; slug: string }>,
  typeAttributesMap: Map<number, any[]>
): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet('📘 Hướng dẫn', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });

  let currentRow = 1;

  // Title
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = '📋 HƯỚNG DẪN CẤU TRÚC DỮ LIỆU SẢN PHẨM';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF1E40AF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDBEAFE' }
  };
  worksheet.getRow(currentRow).height = 30;
  currentRow += 2;

  // Section 1: Product Types
  worksheet.getCell(`A${currentRow}`).value = '1️⃣ DANH SÁCH PHÂN LOẠI SẢN PHẨM';
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 13, color: { argb: 'FF0F766E' } };
  worksheet.getCell(`A${currentRow}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCFBF1' }
  };
  currentRow++;

  // Type headers
  ['STT', 'Tên phân loại', 'Mã (Slug)', 'Số thuộc tính'].forEach((header, idx) => {
    const cell = worksheet.getCell(currentRow, idx + 1);
    cell.value = header;
    cell.font = { bold: true, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  currentRow++;

  // Type data
  types.forEach((type, idx) => {
    const attrs = typeAttributesMap.get(type.id) || [];
    [idx + 1, type.name, type.slug, attrs.length].forEach((val, colIdx) => {
      const cell = worksheet.getCell(currentRow, colIdx + 1);
      cell.value = val;
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;
  });
  currentRow += 2;

  // Section 2: Attributes per Type
  worksheet.getCell(`A${currentRow}`).value = '2️⃣ THUỘC TÍNH THEO TỪNG PHÂN LOẠI';
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 13, color: { argb: 'FF0F766E' } };
  worksheet.getCell(`A${currentRow}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCFBF1' }
  };
  currentRow++;

  types.forEach(type => {
    const attrs = typeAttributesMap.get(type.id) || [];
    
    // Type name
    worksheet.getCell(`A${currentRow}`).value = `📦 ${type.name}`;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12, color: { argb: 'FF1F2937' } };
    worksheet.getCell(`A${currentRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };
    currentRow++;

    // Attribute headers
    ['Tên thuộc tính', 'Loại', 'Kiểu nhập', 'Giá trị'].forEach((header, idx) => {
      const cell = worksheet.getCell(currentRow, idx + 1);
      cell.value = header;
      cell.font = { bold: true, size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;

    // Attribute data
    attrs.forEach(attr => {
      const filterTypeLabel = 
        attr.filter_type === 'checkbox' ? 'Nhiều lựa chọn' :
        attr.filter_type === 'radio' ? 'Một lựa chọn' :
        attr.filter_type === 'range' ? 'Khoảng giá trị' : 
        attr.filter_type === 'nhap_tay' ? 'Nhập tay' : attr.filter_type;
      
      const inputTypeLabel = attr.input_type === 'number' ? 'Số' : 'Chữ';
      
      let valuesText = '';
      if (attr.options && attr.options.length > 0) {
        valuesText = attr.options.slice(0, 5).map((opt: any) => opt.name).join(', ');
        if (attr.options.length > 5) {
          valuesText += ` (+ ${attr.options.length - 5} giá trị khác)`;
        }
      } else if (attr.range) {
        valuesText = `${attr.range.min} - ${attr.range.max}`;
      } else {
        valuesText = 'Nhập tự do';
      }

      [attr.name, filterTypeLabel, inputTypeLabel, valuesText].forEach((val, colIdx) => {
        const cell = worksheet.getCell(currentRow, colIdx + 1);
        cell.value = val;
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      currentRow++;
    });
    
    currentRow++;
  });

  // Section 3: Notes
  currentRow++;
  worksheet.getCell(`A${currentRow}`).value = '💡 GHI CHÚ QUAN TRỌNG';
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 13, color: { argb: 'FFDC2626' } };
  worksheet.getCell(`A${currentRow}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEF2F2' }
  };
  currentRow++;

  const notes = [
    '• Mỗi sản phẩm thuộc 1 PHÂN LOẠI và có thể có nhiều thuộc tính',
    '• Thuộc tính không bắt buộc - nếu không có thì để trống',
    '• Giá trị thuộc tính phải khớp với danh sách trên (nếu có)',
    '• Thuộc tính kiểu "Khoảng giá trị" nhập số trong khoảng cho phép',
    '• Thuộc tính kiểu "Nhập tay" có thể nhập tự do',
  ];

  notes.forEach(note => {
    worksheet.getCell(`A${currentRow}`).value = note;
    worksheet.getCell(`A${currentRow}`).font = { size: 10 };
    currentRow++;
  });

  // Column widths
  worksheet.getColumn(1).width = 35;
  worksheet.getColumn(2).width = 25;
  worksheet.getColumn(3).width = 20;
  worksheet.getColumn(4).width = 50;

  return worksheet;
}

export async function exportToExcel(
  filename: string,
  sheets: ExcelTemplateOptions[],
  metadata?: {
    types?: Array<{ id: number; name: string; slug: string }>;
    typeAttributesMap?: Map<number, any[]>;
  }
): Promise<void> {
  const workbook = createWorkbook();
  
  for (const sheet of sheets) {
    createTemplateSheet(workbook, sheet);
  }
  
  // Add guide sheet if metadata provided
  if (metadata?.types && metadata?.typeAttributesMap) {
    createGuideSheet(workbook, metadata.types, metadata.typeAttributesMap);
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

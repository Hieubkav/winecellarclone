import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  exportToExcel, 
  readExcelFile, 
  worksheetToJson, 
  validateProductRow,
  ExcelColumn,
  ExcelTemplateOptions 
} from '@/lib/utils/excel';
import { AdminProduct, fetchAdminProduct } from '@/lib/api/admin';
import { fetchProductFilters, ProductFilterOption } from '@/lib/api/products';

export interface ProductExcelRow {
  'ID'?: number;
  'Tên sản phẩm': string;
  'Slug': string;
  'Phân loại': string;
  'Danh mục': string;
  'Giá bán': number;
  'Giá gốc'?: number;
  'Trạng thái': 'Có' | 'Không';
  'Mô tả'?: string;
  [key: string]: any;
}

export interface UseProductExcelReturn {
  isExporting: boolean;
  isImporting: boolean;
  exportProducts: (products: AdminProduct[], types: ProductFilterOption[], categories: ProductFilterOption[], includeDynamicAttrs?: boolean) => Promise<void>;
  exportTemplate: (types: ProductFilterOption[], categories: ProductFilterOption[], includeDynamicAttrs?: boolean) => Promise<void>;
  importProducts: (file: File, onImportComplete?: (data: any[]) => void) => Promise<void>;
}

export function useProductExcel(): UseProductExcelReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const buildColumns = useCallback((
    types: ProductFilterOption[], 
    categories: ProductFilterOption[],
    includeDynamicAttrs: boolean = false
  ): ExcelColumn[] => {
    const baseColumns: ExcelColumn[] = [
      { header: 'ID', key: 'id', width: 10, type: 'number' },
      { header: 'Tên sản phẩm', key: 'name', width: 40, required: true, type: 'text' },
      { header: 'Slug', key: 'slug', width: 35, required: true, type: 'text' },
      { 
        header: 'Phân loại', 
        key: 'type_name', 
        width: 20, 
        required: true, 
        type: 'select',
        options: types.map(t => t.name)
      },
      { 
        header: 'Danh mục', 
        key: 'category_names', 
        width: 30, 
        type: 'text'
      },
      { header: 'Giá bán', key: 'price', width: 15, type: 'number' },
      { header: 'Giá gốc', key: 'original_price', width: 15, type: 'number' },
      { 
        header: 'Trạng thái', 
        key: 'active', 
        width: 12, 
        type: 'boolean',
        required: true
      },
      { header: 'Ảnh đại diện', key: 'cover_image_url', width: 60, type: 'text' },
      { header: 'Mô tả (HTML)', key: 'description', width: 80, type: 'text' },
    ];

    if (includeDynamicAttrs) {
      const dynamicColumns: ExcelColumn[] = [
        { header: 'Dung tích (ml)', key: 'volume_ml', width: 15, type: 'number' },
        { header: 'Nồng độ cồn (%)', key: 'alcohol_percent', width: 17, type: 'number' },
        { header: 'Quốc gia', key: 'country', width: 20, type: 'text' },
        { header: 'Vùng miền', key: 'region', width: 25, type: 'text' },
        { header: 'Năm sản xuất', key: 'vintage', width: 15, type: 'number' },
        { header: 'Thuộc tính khác', key: 'other_attrs', width: 50, type: 'text' },
      ];
      return [...baseColumns, ...dynamicColumns];
    }

    return baseColumns;
  }, []);

  const exportProducts = useCallback(async (
    products: AdminProduct[],
    types: ProductFilterOption[],
    categories: ProductFilterOption[],
    includeDynamicAttrs: boolean = false
  ) => {
    setIsExporting(true);
    try {
      const columns = buildColumns(types, categories, includeDynamicAttrs);
      
      toast.info(`Đang tải chi tiết ${products.length} sản phẩm...`, { duration: 2000 });
      
      const detailedProducts = await Promise.all(
        products.map(async (product) => {
          try {
            const { data } = await fetchAdminProduct(product.id);
            return data;
          } catch (error) {
            console.error(`Failed to fetch product ${product.id}:`, error);
            return product;
          }
        })
      );
      
      const data = detailedProducts.map(product => {
        const categoryNames = product.category_ids && product.category_ids.length > 0
          ? product.category_ids.map(id => {
              const cat = categories.find(c => c.id === id);
              return cat?.name || '';
            }).filter(Boolean).join(', ')
          : '';

        const baseData: Record<string, unknown> = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          type_name: product.type_name || '',
          category_names: categoryNames,
          price: product.price || null,
          original_price: product.original_price || null,
          active: product.active ? 'Có' : 'Không',
          cover_image_url: product.cover_image_url || '',
          description: ('description' in product ? product.description : '') || '',
        };

        if (includeDynamicAttrs) {
          if (product.extra_attrs) {
            baseData.volume_ml = product.extra_attrs['dung_tich']?.value || '';
            baseData.alcohol_percent = product.extra_attrs['1abv']?.value || '';
            baseData.country = product.extra_attrs['quoc_gia']?.value || '';
            baseData.region = product.extra_attrs['vung_mien']?.value || '';
            baseData.vintage = product.extra_attrs['nam_san_xuat']?.value || '';
            
            const otherAttrs = Object.entries(product.extra_attrs)
              .filter(([key]) => !['dung_tich', '1abv', 'quoc_gia', 'vung_mien', 'nam_san_xuat'].includes(key))
              .map(([key, attr]) => `${attr.label}: ${attr.value}`)
              .join('; ');
            baseData.other_attrs = otherAttrs;
          } else {
            baseData.volume_ml = '';
            baseData.alcohol_percent = '';
            baseData.country = '';
            baseData.region = '';
            baseData.vintage = '';
            baseData.other_attrs = '';
          }
        }

        return baseData;
      });

      const sheetOptions: ExcelTemplateOptions = {
        sheetName: 'Sản phẩm',
        columns,
        data,
      };

      await exportToExcel('danh-sach-san-pham', [sheetOptions]);
      toast.success(`Đã xuất ${products.length} sản phẩm ra file Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Xuất Excel thất bại. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [buildColumns]);

  const exportTemplate = useCallback(async (
    types: ProductFilterOption[],
    categories: ProductFilterOption[],
    includeDynamicAttrs: boolean = false
  ) => {
    setIsExporting(true);
    try {
      const columns = buildColumns(types, categories, includeDynamicAttrs);
      
      columns.forEach(col => {
        if (col.key === 'id') col.required = false;
      });

      const sheetOptions: ExcelTemplateOptions = {
        sheetName: 'Sản phẩm',
        columns,
        includeExample: true,
      };

      await exportToExcel('mau-import-san-pham', [sheetOptions]);
      toast.success('Đã tải file Excel mẫu');
    } catch (error) {
      console.error('Export template error:', error);
      toast.error('Tải file mẫu thất bại. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [buildColumns]);

  const importProducts = useCallback(async (
    file: File,
    onImportComplete?: (data: Record<string, unknown>[]) => void
  ) => {
    setIsImporting(true);
    try {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
      }

      const filters = await fetchProductFilters();
      const columns = buildColumns(filters.types, filters.categories, true);

      const workbook = await readExcelFile(file);
      const worksheet = workbook.getWorksheet('Sản phẩm') || workbook.worksheets[0];
      
      if (!worksheet) {
        toast.error('Không tìm thấy sheet dữ liệu trong file Excel');
        return;
      }

      const rawData = worksheetToJson(worksheet);
      
      if (rawData.length === 0) {
        toast.error('File Excel không có dữ liệu');
        return;
      }

      const validatedData: Record<string, unknown>[] = [];
      const errors: Array<{ row: number; errors: string[] }> = [];

      rawData.forEach((row, index) => {
        const rowErrors = validateProductRow(row, columns);
        
        if (rowErrors.length > 0) {
          errors.push({ row: index + 2, errors: rowErrors });
        } else {
          const productData: Record<string, unknown> = {
            id: row['ID'] || undefined,
            name: row['Tên sản phẩm'],
            slug: row['Slug'],
            type_name: row['Phân loại'],
            category_name: row['Danh mục'],
            price: row['Giá bán'] ? Number(row['Giá bán']) : null,
            original_price: row['Giá gốc'] ? Number(row['Giá gốc']) : null,
            active: row['Trạng thái'] === 'Có',
            description: row['Mô tả'] || '',
          };

          if (row['Dung tích (ml)']) productData.volume_ml = Number(row['Dung tích (ml)']);
          if (row['Nồng độ cồn (%)']) productData.alcohol_percent = Number(row['Nồng độ cồn (%)']);
          if (row['Quốc gia']) productData.country = row['Quốc gia'];
          if (row['Vùng miền']) productData.region = row['Vùng miền'];
          if (row['Năm sản xuất']) productData.vintage = Number(row['Năm sản xuất']);

          validatedData.push(productData);
        }
      });

      if (errors.length > 0) {
        const errorMessage = errors.slice(0, 5).map(e => 
          `Dòng ${e.row}: ${e.errors.join(', ')}`
        ).join('\n');
        
        toast.error(
          <div>
            <div className="font-semibold mb-1">
              Phát hiện {errors.length} lỗi trong file Excel:
            </div>
            <div className="text-xs whitespace-pre-line">
              {errorMessage}
              {errors.length > 5 && '\n...và các lỗi khác'}
            </div>
          </div>,
          { duration: 10000 }
        );
        return;
      }

      toast.success(`Đọc thành công ${validatedData.length} sản phẩm từ file Excel`);
      
      if (onImportComplete) {
        onImportComplete(validatedData);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Đọc file Excel thất bại. Vui lòng kiểm tra lại file.');
    } finally {
      setIsImporting(false);
    }
  }, [buildColumns]);

  return {
    isExporting,
    isImporting,
    exportProducts,
    exportTemplate,
    importProducts,
  };
}

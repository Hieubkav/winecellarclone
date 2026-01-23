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
    attributeFilters: Array<{ code: string; name: string; filter_type: string; input_type?: string }> = []
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
      { header: 'Ảnh phụ (URLs)', key: 'additional_images', width: 80, type: 'text' },
      { header: 'Mô tả (HTML)', key: 'description', width: 80, type: 'text' },
    ];

    attributeFilters.forEach(attr => {
      const colType = attr.input_type === 'number' || attr.filter_type === 'range' ? 'number' : 'text';
      const colWidth = colType === 'number' ? 15 : 25;
      
      baseColumns.push({
        header: attr.name,
        key: `attr_${attr.code}`,
        width: colWidth,
        type: colType,
      });
    });

    return baseColumns;
  }, []);

  const exportProducts = useCallback(async (
    products: AdminProduct[],
    types: ProductFilterOption[],
    categories: ProductFilterOption[]
  ) => {
    setIsExporting(true);
    try {
      // Fetch ALL attribute groups (not just common ones)
      const allAttributeGroups = new Map<string, { code: string; name: string; filter_type: string; input_type?: string }>();
      
      // Collect attributes from all product types
      for (const type of types) {
        const filters = await fetchProductFilters(type.id);
        filters.attribute_filters.forEach(attr => {
          if (!allAttributeGroups.has(attr.code)) {
            allAttributeGroups.set(attr.code, {
              code: attr.code,
              name: attr.name,
              filter_type: attr.filter_type,
              input_type: attr.input_type,
            });
          }
        });
      }
      
      const attributeFilters = Array.from(allAttributeGroups.values());
      const columns = buildColumns(types, categories, attributeFilters);
      
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
        const typeFound = types.find(t => t.id === product.type_id);
        const typeName = typeFound?.name || product.type_name || '';
        
        const categoryNames = product.category_ids && product.category_ids.length > 0
          ? product.category_ids.map(id => {
              const cat = categories.find(c => c.id === id);
              return cat?.name || '';
            }).filter(Boolean).join(', ')
          : '';

        const additionalImages = ('images' in product && Array.isArray(product.images))
          ? product.images
              .filter((img: any) => img.url && img.url !== product.cover_image_url)
              .map((img: any) => img.url)
              .join('; ')
          : '';

        const baseData: Record<string, unknown> = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          type_name: typeName,
          category_names: categoryNames,
          price: product.price || null,
          original_price: product.original_price || null,
          active: product.active ? 'Có' : 'Không',
          cover_image_url: product.cover_image_url || '',
          additional_images: additionalImages,
          description: ('description' in product ? product.description : '') || '',
        };

        attributeFilters.forEach(attr => {
          const key = `attr_${attr.code}`;
          if (product.extra_attrs && product.extra_attrs[attr.code]) {
            baseData[key] = product.extra_attrs[attr.code].value || '';
          } else {
            baseData[key] = '';
          }
        });

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
    categories: ProductFilterOption[]
  ) => {
    setIsExporting(true);
    try {
      // Fetch ALL attribute groups from all product types
      const allAttributeGroups = new Map<string, { code: string; name: string; filter_type: string; input_type?: string }>();
      const typeAttributesMap = new Map<number, any[]>();
      
      for (const type of types) {
        const filters = await fetchProductFilters(type.id);
        
        // Store attributes per type for guide sheet
        typeAttributesMap.set(type.id, filters.attribute_filters);
        
        filters.attribute_filters.forEach(attr => {
          if (!allAttributeGroups.has(attr.code)) {
            allAttributeGroups.set(attr.code, {
              code: attr.code,
              name: attr.name,
              filter_type: attr.filter_type,
              input_type: attr.input_type,
            });
          }
        });
      }
      
      const attributeFilters = Array.from(allAttributeGroups.values());
      const columns = buildColumns(types, categories, attributeFilters);
      
      columns.forEach(col => {
        if (col.key === 'id') col.required = false;
      });

      const sheetOptions: ExcelTemplateOptions = {
        sheetName: 'Sản phẩm',
        columns,
        includeExample: true,
      };

      await exportToExcel('mau-import-san-pham', [sheetOptions], {
        types,
        typeAttributesMap,
      });
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

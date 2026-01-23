import { ProductFilterOption } from '@/lib/api/products';

export interface ExtraAttr {
  label: string;
  value: string | number;
  type: 'text' | 'number' | 'select';
}

export interface ProductImportData {
  id?: number;
  name: string;
  slug: string;
  type_name: string;
  category_name?: string;
  price: number | null;
  original_price?: number | null;
  active: boolean;
  description?: string;
  volume_ml?: number;
  alcohol_percent?: number;
  country?: string;
  region?: string;
  vintage?: number;
}

export interface BackendProductData {
  id?: number;
  name: string;
  slug: string;
  type_id: number | null;
  category_ids?: number[];
  price: number | null;
  original_price?: number | null;
  active: boolean;
  description?: string;
  extra_attrs: Record<string, ExtraAttr>;
}

export function mapExcelToBackendFormat(
  excelData: ProductImportData,
  types: ProductFilterOption[],
  categories: ProductFilterOption[]
): BackendProductData | null {
  const type = types.find(t => t.name === excelData.type_name);
  if (!type) {
    throw new Error(`Không tìm thấy phân loại: ${excelData.type_name}`);
  }

  const extraAttrs: Record<string, ExtraAttr> = {};

  if (excelData.volume_ml) {
    extraAttrs['dung_tich'] = {
      label: 'Dung tích',
      value: excelData.volume_ml,
      type: 'number',
    };
  }

  if (excelData.alcohol_percent) {
    extraAttrs['1abv'] = {
      label: '%ABV',
      value: excelData.alcohol_percent,
      type: 'number',
    };
  }

  if (excelData.country) {
    extraAttrs['quoc_gia'] = {
      label: 'Quốc gia',
      value: excelData.country,
      type: 'text',
    };
  }

  if (excelData.region) {
    extraAttrs['vung_mien'] = {
      label: 'Vùng miền',
      value: excelData.region,
      type: 'text',
    };
  }

  if (excelData.vintage) {
    extraAttrs['nam_san_xuat'] = {
      label: 'Năm sản xuất',
      value: excelData.vintage,
      type: 'number',
    };
  }

  const categoryIds: number[] = [];
  if (excelData.category_name) {
    const category = categories.find(c => c.name === excelData.category_name);
    if (category) {
      categoryIds.push(category.id);
    }
  }

  const backendData: BackendProductData = {
    name: excelData.name,
    slug: excelData.slug,
    type_id: type.id,
    price: excelData.price,
    original_price: excelData.original_price || null,
    active: excelData.active,
    description: excelData.description || '',
    extra_attrs: extraAttrs,
  };

  if (excelData.id) {
    backendData.id = excelData.id;
  }

  if (categoryIds.length > 0) {
    backendData.category_ids = categoryIds;
  }

  return backendData;
}

export function mapMultipleProducts(
  excelDataList: ProductImportData[],
  types: ProductFilterOption[],
  categories: ProductFilterOption[]
): Array<{ data: BackendProductData | null; error?: string; row: number }> {
  return excelDataList.map((excelData, index) => {
    try {
      const data = mapExcelToBackendFormat(excelData, types, categories);
      return { data, row: index + 2 };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        row: index + 2,
      };
    }
  });
}

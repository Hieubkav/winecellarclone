import { LayoutTemplate, Image, Grid, Package, Award, FileText, Star, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ComponentTypeInfo {
  value: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const COMPONENT_TYPES: ComponentTypeInfo[] = [
  {
    value: 'hero_carousel',
    label: 'Banner chính',
    icon: LayoutTemplate,
    description: 'Banner đầu trang',
  },
  {
    value: 'dual_banner',
    label: '2 banner',
    icon: Image,
    description: 'Hai banner ngang',
  },
  {
    value: 'category_grid',
    label: 'Danh mục',
    icon: Grid,
    description: 'Danh mục có ảnh',
  },
  {
    value: 'collection_showcase',
    label: 'Bộ sưu tập',
    icon: Package,
    description: 'Nhóm sản phẩm nổi bật',
  },
  {
    value: 'brand_showcase',
    label: 'Thương hiệu',
    icon: Award,
    description: 'Logo thương hiệu',
  },
  {
    value: 'editorial_spotlight',
    label: 'Bài viết',
    icon: FileText,
    description: 'Bài viết nổi bật',
  },
  {
    value: 'favourite_products',
    label: 'Yêu thích',
    icon: Star,
    description: 'Sản phẩm nổi bật',
  },
  {
    value: 'speed_dial',
    label: 'Liên hệ nhanh',
    icon: MessageCircle,
    description: 'Nút liên hệ nổi',
  },
];

export function getComponentTypeInfo(type: string): ComponentTypeInfo | undefined {
  return COMPONENT_TYPES.find(t => t.value === type);
}

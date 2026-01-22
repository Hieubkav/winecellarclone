import { LayoutTemplate, Image, Grid, Package, Award, FileText, Star } from 'lucide-react';
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
    label: 'Hero Carousel',
    icon: LayoutTemplate,
    description: 'Banner chính với nhiều slides, tự động chuyển động',
  },
  {
    value: 'dual_banner',
    label: 'Dual Banner',
    icon: Image,
    description: '2 banner ngang nhau, thường dùng cho promotion',
  },
  {
    value: 'category_grid',
    label: 'Category Grid',
    icon: Grid,
    description: 'Lưới danh mục sản phẩm với hình ảnh',
  },
  {
    value: 'collection_showcase',
    label: 'Collection Showcase',
    icon: Package,
    description: 'Giới thiệu bộ sưu tập sản phẩm với description',
  },
  {
    value: 'brand_showcase',
    label: 'Brand Showcase',
    icon: Award,
    description: 'Hiển thị logo các thương hiệu đối tác',
  },
  {
    value: 'editorial_spotlight',
    label: 'Editorial Spotlight',
    icon: FileText,
    description: 'Highlight bài viết nổi bật',
  },
  {
    value: 'favourite_products',
    label: 'Favourite Products',
    icon: Star,
    description: 'Danh sách sản phẩm yêu thích, hot items',
  },
];

export function getComponentTypeInfo(type: string): ComponentTypeInfo | undefined {
  return COMPONENT_TYPES.find(t => t.value === type);
}

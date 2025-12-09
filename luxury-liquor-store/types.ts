export interface ProductSpec {
  label: string;
  value: string;
  iconName: 'MapPin' | 'Droplets' | 'FlaskConical' | 'Globe' | 'Grape' | 'Award';
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  specs: ProductSpec[];
  tags: string[];
  rating: number;
  reviews: number;
}

export interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  discount?: number;
  origin?: string;
  specs?: {
    icon: 'Globe' | 'Grape' | 'Droplets' | 'FlaskConical';
    text: string;
  }[];
}
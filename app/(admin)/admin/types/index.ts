 export interface AdminUser {
   id: string;
   name: string;
   email: string;
   avatar?: string;
 }
 
 export interface NavItem {
   icon: React.ElementType;
   label: string;
   href: string;
   subItems?: { label: string; href: string }[];
 }
 
 export interface StatCard {
   title: string;
   value: string | number;
   icon: React.ElementType;
   trend?: {
     value: number;
     isPositive: boolean;
   };
   color: 'blue' | 'green' | 'amber' | 'purple';
 }
 
 export interface Product {
   id: number;
   name: string;
   slug: string;
   price: number;
   salePrice?: number;
   image?: string;
   categoryId: number;
   categoryName?: string;
   status: 'active' | 'draft' | 'archived';
   createdAt: string;
 }
 
 export interface Category {
   id: number;
   name: string;
   slug: string;
   parentId?: number;
   parentName?: string;
   productCount: number;
   order: number;
   active: boolean;
 }
 
 export interface Article {
   id: number;
   title: string;
   slug: string;
   excerpt?: string;
   image?: string;
   status: 'published' | 'draft';
   publishedAt?: string;
   createdAt: string;
 }
 
 export interface PaginatedResponse<T> {
   data: T[];
   meta: {
     current_page: number;
     last_page: number;
     per_page: number;
     total: number;
   };
 }

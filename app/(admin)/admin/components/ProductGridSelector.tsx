'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Package } from 'lucide-react';
import { Label, Input, Button } from './ui';
import { getImageUrl } from '@/lib/utils/article-content';

interface Product {
  value: number;
  label: string;
  price: number;
  cover_image?: {
    id: number;
    url: string;
    alt: string;
  } | null;
}

interface ProductGridSelectorProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  fetchProducts: (query: string) => Promise<Product[]>;
  required?: boolean;
  helpText?: string;
  maxSelection?: number;
}

export function ProductGridSelector({
  label,
  value,
  onChange,
  fetchProducts,
  required = false,
  helpText,
  maxSelection,
}: ProductGridSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Load initial selected products
  useEffect(() => {
    if (value.length > 0 && selectedProducts.length === 0) {
      loadProducts('');
    }
  }, [value]);

  // Search debounce
  useEffect(() => {
    if (!showSearch) return;
    
    const timer = setTimeout(() => {
      loadProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSearch]);

  const loadProducts = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await fetchProducts(query);
      setSearchResults(results);

      // Update selected products with full data
      const selected = results.filter(p => value.includes(p.value));
      setSelectedProducts(prev => {
        const merged = [...prev];
        selected.forEach(s => {
          if (!merged.find(m => m.value === s.value)) {
            merged.push(s);
          }
        });
        return merged.filter(m => value.includes(m.value));
      });
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (product: Product) => {
    if (maxSelection && value.length >= maxSelection) {
      alert(`Chỉ được chọn tối đa ${maxSelection} sản phẩm`);
      return;
    }
    
    if (!value.includes(product.value)) {
      onChange([...value, product.value]);
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleRemove = (productValue: number) => {
    onChange(value.filter(v => v !== productValue));
    setSelectedProducts(selectedProducts.filter(p => p.value !== productValue));
  };

  // Fix image URL using shared helper
  const fixImageUrl = (imageUrl?: string) => {
    return getImageUrl(imageUrl);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? 'Đóng tìm kiếm' : 'Thêm sản phẩm'}
        </Button>
      </div>

      {/* Search section */}
      {showSearch && (
        <div className="border rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
              {searchResults
                .filter(p => !value.includes(p.value))
                .map(product => {
                  const imageUrl = fixImageUrl(product.cover_image?.url);
                  return (
                    <div
                      key={product.value}
                      className="border rounded-lg p-2 bg-white dark:bg-slate-800 hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => handleAdd(product)}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.cover_image?.alt || product.label}
                          className="w-full aspect-square object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded mb-2">
                          <Package size={24} className="text-slate-400" />
                        </div>
                      )}
                      <p className="text-xs font-medium line-clamp-2 mb-1">{product.label}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        {product.price ? `${product.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-slate-500">
              {searchQuery ? 'Không tìm thấy sản phẩm' : 'Nhập từ khóa để tìm kiếm'}
            </div>
          )}
        </div>
      )}

      {/* Selected products grid - 4 columns */}
      {selectedProducts.length > 0 ? (
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
          <p className="text-sm font-medium mb-3">
            Đã chọn {selectedProducts.length} sản phẩm
            {maxSelection && ` (tối đa ${maxSelection})`}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedProducts.map(product => {
              const imageUrl = fixImageUrl(product.cover_image?.url);
              return (
                <div
                  key={product.value}
                  className="relative border rounded-lg p-2 bg-slate-50 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => handleRemove(product.value)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md z-10"
                  >
                    <X size={14} />
                  </button>
                  
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.cover_image?.alt || product.label}
                      className="w-full aspect-square object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded mb-2">
                      <Package size={24} className="text-slate-400" />
                    </div>
                  )}
                  
                  <p className="text-xs font-medium line-clamp-2 mb-1">{product.label}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {product.price ? `${product.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-dashed rounded-lg p-8 text-center text-slate-500">
          <Package size={48} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Chưa chọn sản phẩm nào</p>
          <p className="text-xs mt-1">Click "Thêm sản phẩm" để bắt đầu</p>
        </div>
      )}

      {helpText && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
}

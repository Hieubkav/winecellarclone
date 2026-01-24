'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, FileText } from 'lucide-react';
import { Label, Input, Button } from './ui';
import { API_BASE_URL } from '@/lib/api/client';

interface Article {
  value: number;
  label: string;
  published_at?: string;
  cover_image?: {
    id: number;
    url: string;
    alt: string;
  } | null;
}

interface ArticleGridSelectorProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  fetchArticles: (query: string) => Promise<Article[]>;
  required?: boolean;
  helpText?: string;
  maxSelection?: number;
}

export function ArticleGridSelector({
  label,
  value,
  onChange,
  fetchArticles,
  required = false,
  helpText,
  maxSelection,
}: ArticleGridSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Load initial selected articles
  useEffect(() => {
    if (value.length > 0 && selectedArticles.length === 0) {
      loadArticles('');
    }
  }, [value]);

  // Search debounce
  useEffect(() => {
    if (!showSearch) return;
    
    const timer = setTimeout(() => {
      loadArticles(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSearch]);

  const loadArticles = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await fetchArticles(query);
      setSearchResults(results);

      // Update selected articles with full data
      const selected = results.filter(a => value.includes(a.value));
      setSelectedArticles(prev => {
        const merged = [...prev];
        selected.forEach(s => {
          if (!merged.find(m => m.value === s.value)) {
            merged.push(s);
          }
        });
        return merged.filter(m => value.includes(m.value));
      });
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (article: Article) => {
    if (maxSelection && value.length >= maxSelection) {
      alert(`Chỉ được chọn tối đa ${maxSelection} bài viết`);
      return;
    }
    
    if (!value.includes(article.value)) {
      onChange([...value, article.value]);
      setSelectedArticles([...selectedArticles, article]);
    }
  };

  const handleRemove = (articleValue: number) => {
    onChange(value.filter(v => v !== articleValue));
    setSelectedArticles(selectedArticles.filter(a => a.value !== articleValue));
  };

  // Fix image URL
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
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
          {showSearch ? 'Đóng tìm kiếm' : 'Thêm bài viết'}
        </Button>
      </div>

      {/* Search section */}
      {showSearch && (
        <div className="border rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm bài viết..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {searchResults
                .filter(a => !value.includes(a.value))
                .map(article => {
                  const imageUrl = getImageUrl(article.cover_image?.url);
                  return (
                    <div
                      key={article.value}
                      className="border rounded-lg p-2 bg-white dark:bg-slate-800 hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => handleAdd(article)}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={article.cover_image?.alt || article.label}
                          className="w-full aspect-video object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded mb-2">
                          <FileText size={24} className="text-slate-400" />
                        </div>
                      )}
                      <p className="text-xs font-medium line-clamp-2 mb-1">{article.label}</p>
                      {article.published_at && (
                        <p className="text-xs text-slate-500">
                          {formatDate(article.published_at)}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-slate-500">
              {searchQuery ? 'Không tìm thấy bài viết' : 'Nhập từ khóa để tìm kiếm'}
            </div>
          )}
        </div>
      )}

      {/* Selected articles grid */}
      {selectedArticles.length > 0 ? (
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
          <p className="text-sm font-medium mb-3">
            Đã chọn {selectedArticles.length} bài viết
            {maxSelection && ` (tối đa ${maxSelection})`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedArticles.map(article => {
              const imageUrl = getImageUrl(article.cover_image?.url);
              return (
                <div
                  key={article.value}
                  className="relative border rounded-lg p-2 bg-slate-50 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => handleRemove(article.value)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md z-10"
                  >
                    <X size={14} />
                  </button>
                  
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={article.cover_image?.alt || article.label}
                      className="w-full aspect-video object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded mb-2">
                      <FileText size={24} className="text-slate-400" />
                    </div>
                  )}
                  
                  <p className="text-xs font-medium line-clamp-2 mb-1">{article.label}</p>
                  {article.published_at && (
                    <p className="text-xs text-slate-500">
                      {formatDate(article.published_at)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-dashed rounded-lg p-8 text-center text-slate-500">
          <FileText size={48} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Chưa chọn bài viết nào</p>
          <p className="text-xs mt-1">Click "Thêm bài viết" để bắt đầu</p>
        </div>
      )}

      {helpText && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
}

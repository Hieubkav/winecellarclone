'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, Trash2 } from 'lucide-react';
import { Button, Input, Label } from './ui';
import { API_BASE_URL } from '@/lib/api/client';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  value?: string;
  path?: string;
  onChange: (url: string, path: string, id?: number) => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | '21:9' | 'auto';
  maxSize?: number;
  folder?: string;
}

function slugifyFilename(filename: string): string {
  const ext = filename.split('.').pop();
  const name = filename.replace(/\.[^/.]+$/, '');

  const slugified = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return `${slugified}-${Date.now()}.${ext}`;
}

async function convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export function ImageUploadField({
  value,
  path,
  onChange,
  onRemove,
  label = 'Hình ảnh',
  aspectRatio = 'auto',
  maxSize = 5,
  folder = 'home-components',
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    '21:9': 'aspect-[21/9]',
    auto: '',
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file hình ảnh');
      return null;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File không được vượt quá ${maxSize}MB`);
      return null;
    }

    setIsUploading(true);
    try {
      const webpBlob = await convertToWebP(file, 0.85);
      const slugName = slugifyFilename(file.name.replace(/\.[^.]+$/, '.webp'));
      const webpFile = new File([webpBlob], slugName, { type: 'image/webp' });

      const formData = new FormData();
      formData.append('image', webpFile);
      formData.append('folder', folder);

      const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      if (result.success && result.data) {
        // Fix relative URL to absolute
        let imageUrl = result.data.url;
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
        }
        onChange(imageUrl, result.data.path, result.data.id);
        toast.success('Đã tải ảnh lên');
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [folder, maxSize, onChange]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await uploadFile(files[0]);
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUrlUpload = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, folder }),
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      if (result.success && result.data) {
        // Fix relative URL to absolute
        let imageUrl = result.data.url;
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
        }
        onChange(imageUrl, result.data.path, result.data.id);
        setUrlInput('');
        setShowUrlInput(false);
        toast.success('Đã tải ảnh từ URL');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh từ URL');
    } finally {
      setIsUploading(false);
    }
  }, [urlInput, folder, onChange]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {value ? (
        <div className="space-y-2">
          <div className={`relative border-2 border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden ${aspectRatioClasses[aspectRatio]}`}>
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Thay ảnh khác
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              disabled={isUploading}
            >
              {showUrlInput ? 'Ẩn URL' : 'Từ URL'}
            </Button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isUploading}
              />
              <Button
                type="button"
                onClick={handleUrlUpload}
                disabled={isUploading || !urlInput.trim()}
              >
                Tải lên
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors
              ${isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500'
              }
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div className="text-center">
              <Upload size={32} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isUploading ? 'Đang tải lên...' : 'Kéo thả hoặc click để tải ảnh'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                WebP 85%, tối đa {maxSize}MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
            <span className="text-xs text-slate-500">hoặc</span>
            <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Nhập URL ảnh"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isUploading}
            />
            <Button
              type="button"
              onClick={handleUrlUpload}
              disabled={isUploading || !urlInput.trim()}
            >
              Tải từ URL
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

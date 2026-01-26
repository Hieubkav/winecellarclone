'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  imageId?: number | null;
  onChange: (imageId: number | null, imageUrl: string | null) => void;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUploadField({
  label,
  value,
  imageId,
  onChange,
  description,
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  maxSizeMB = 5,
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File không được vượt quá ${maxSizeMB}MB`);
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'settings');

      setIsUploading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/upload/image`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Upload thất bại' }));
          console.error('Upload failed:', { status: response.status, error: errorData });
          throw new Error(errorData.message || 'Upload thất bại');
        }

        const result = await response.json();
        if (result.success && result.data) {
          // Remove /api from base URL for storage path
          const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api$/, '');
          const fullUrl = `${backendUrl}${result.data.url}`;
          onChange(result.data.id, fullUrl);
          toast.success('Upload ảnh thành công');
        } else {
          throw new Error(result.message || 'Không nhận được dữ liệu ảnh');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error instanceof Error ? error.message : 'Không thể upload ảnh');
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMB, onChange]
  );

  const uploadImageFromUrl = useCallback(
    async (url: string) => {
      setIsUploading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/upload/image-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, folder: 'settings' }),
        });

        if (!response.ok) {
          throw new Error('Upload từ URL thất bại');
        }

        const result = await response.json();
        if (result.success && result.data) {
          // Remove /api from base URL for storage path
          const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api$/, '');
          const fullUrl = `${backendUrl}${result.data.url}`;
          onChange(result.data.id, fullUrl);
          toast.success('Upload ảnh từ URL thành công');
          setUrlInput('');
          setShowUrlInput(false);
        }
      } catch (error) {
        console.error('Upload from URL error:', error);
        toast.error('Không thể tải ảnh từ URL');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        uploadImage(file);
      } else {
        toast.error('Vui lòng thả file ảnh hợp lệ');
      }
    },
    [uploadImage]
  );

  const handleRemove = useCallback(() => {
    onChange(null, null);
    toast.success('Đã xóa ảnh');
  }, [onChange]);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) {
      toast.error('Vui lòng nhập URL ảnh');
      return;
    }
    uploadImageFromUrl(urlInput.trim());
  }, [urlInput, uploadImageFromUrl]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {!value && !showUrlInput && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput(true)}
            className="h-8 text-xs"
          >
            <LinkIcon size={14} className="mr-1" />
            Từ URL
          </Button>
        )}
      </div>

      {description && <p className="text-xs text-slate-500">{description}</p>}

      {/* URL Input */}
      {showUrlInput && !value && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={isUploading}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button type="button" onClick={handleUrlSubmit} disabled={isUploading} size="sm">
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : 'Tải'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput('');
            }}
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* Preview or Upload Zone */}
      {value ? (
        <div className="relative group">
          <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <img src={value} alt={label} className="w-full h-48 object-contain bg-slate-50 dark:bg-slate-900" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                {isDragging ? (
                  <ImageIcon size={24} className="text-blue-600" />
                ) : (
                  <Upload size={24} className="text-slate-600 dark:text-slate-400" />
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isDragging ? 'Thả ảnh vào đây' : 'Click hoặc kéo thả ảnh'}
              </p>
              <p className="text-xs text-slate-500">
                JPEG, PNG, GIF, WebP • Tối đa {maxSizeMB}MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}

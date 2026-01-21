'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button, Input, Card } from './ui';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

// Danh sách icons phổ biến cho attributes - mở rộng
const COMMON_ICONS = [
  // Đồ uống & Thực phẩm
  'Wine', 'Beer', 'Coffee', 'Milk', 'Soup', 'Pizza', 'Cake', 'Cookie',
  'Apple', 'Cherry', 'Grape', 'Lemon', 'Orange', 'Banana', 'Carrot',
  
  // Địa lý & Vị trí
  'MapPin', 'Globe', 'Map', 'Navigation', 'Compass', 'Mountain', 'Palmtree',
  'Flag', 'Landmark', 'Building', 'Home', 'Store', 'Warehouse',
  
  // Giải thưởng & Chất lượng
  'Award', 'Star', 'Crown', 'Trophy', 'Medal', 'Shield', 'BadgeCheck',
  'Gem', 'Diamond', 'Sparkles', 'Zap', 'Target', 'TrendingUp',
  
  // Thương hiệu & Nhãn
  'Tag', 'Tags', 'Bookmark', 'Hash', 'AtSign', 'Percent', 'DollarSign',
  
  // Đóng gói & Vận chuyển
  'Package', 'Box', 'Archive', 'ShoppingBag', 'ShoppingCart', 'Gift',
  
  // Tự nhiên & Môi trường
  'Droplet', 'Flame', 'Leaf', 'Flower', 'TreePine', 'Sprout', 'Wind',
  'Sun', 'Moon', 'Cloud', 'CloudRain', 'Snowflake', 'Waves',
  
  // Thời gian & Lịch
  'Calendar', 'Clock', 'Timer', 'Hourglass', 'CalendarDays',
  
  // Công cụ & Thiết bị
  'Filter', 'Settings', 'Wrench', 'Hammer', 'Scissors', 'Ruler',
  
  // Hình dạng & Biểu tượng
  'Heart', 'Circle', 'Square', 'Triangle', 'Hexagon',
  'Feather', 'Anchor', 'Key', 'Lock', 'Unlock', 'Eye', 'EyeOff',
  
  // Khác
  'Palette', 'Brush', 'Pen', 'Pencil', 'Image', 'Camera', 'Video',
  'Music', 'Mic', 'Volume2', 'Bell', 'Lightbulb', 'Thermometer',
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = search
    ? COMMON_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : COMMON_ICONS;

  const SelectedIcon = value && (LucideIcons as any)[value] 
    ? (LucideIcons as any)[value] 
    : LucideIcons.HelpCircle;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <SelectedIcon size={16} />
          <span className="text-sm">{value || 'Chọn icon'}</span>
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            className="h-8 w-8"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="p-4 max-h-96 overflow-y-auto">
          <div className="mb-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm icon..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {filteredIcons.map(iconName => {
              const IconComponent = (LucideIcons as any)[iconName];
              if (!IconComponent) return null;
              
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`p-2 rounded-lg border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    value === iconName
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                  title={iconName}
                >
                  <IconComponent size={18} className="mx-auto" />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">
              Không tìm thấy icon phù hợp
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

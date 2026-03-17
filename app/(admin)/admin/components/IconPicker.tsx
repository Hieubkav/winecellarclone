'use client';

import React, { useState } from 'react';
import { HelpCircle, Search, X } from 'lucide-react';
import { Button, Input, Card } from './ui';
import { DYNAMIC_ICON_MAP, DYNAMIC_ICON_NAMES } from '@/lib/icons/dynamicIconRegistry';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

const COMMON_ICONS = DYNAMIC_ICON_NAMES;

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = search
    ? COMMON_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : COMMON_ICONS;

  const SelectedIcon = value && DYNAMIC_ICON_MAP[value]
    ? DYNAMIC_ICON_MAP[value]
    : HelpCircle;

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
              const IconComponent = DYNAMIC_ICON_MAP[iconName];
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

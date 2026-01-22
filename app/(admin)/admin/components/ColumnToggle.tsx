'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from './ui';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnToggleProps {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
}

export default function ColumnToggle({ columns, onChange }: ColumnToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (key: string) => {
    const updated = columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onChange(updated);
  };

  const visibleCount = columns.filter(col => col.visible).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Settings size={16} />
        Cột hiển thị ({visibleCount}/{columns.length})
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Tùy chỉnh cột hiển thị
            </h3>
          </div>
          <div className="p-2 max-h-80 overflow-y-auto">
            {columns.map(col => (
              <label
                key={col.key}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => handleToggle(col.key)}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {col.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

interface Option {
  id: number;
  name: string;
}

interface AttributeComboboxProps {
  options: Option[];
  selectedIds: number[];
  onChange: (nextIds: number[]) => void;
  single?: boolean;
  placeholder?: string;
  emptyText?: string;
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

export function AttributeCombobox({
  options,
  selectedIds,
  onChange,
  single = false,
  placeholder = 'Gõ để tìm...',
  emptyText = 'Không tìm thấy kết quả',
}: AttributeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => normalizeText(option.name).includes(normalizedQuery));
  }, [normalizedQuery, options]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedIds.includes(option.id)),
    [options, selectedIds]
  );

  const handleSelect = (option: Option) => {
    if (single) {
      const nextIds = selectedIds.includes(option.id) ? [] : [option.id];
      onChange(nextIds);
      setIsOpen(false);
      return;
    }

    if (selectedIds.includes(option.id)) {
      onChange(selectedIds.filter((id) => id !== option.id));
      return;
    }

    onChange([...selectedIds, option.id]);
  };

  const handleRemove = (optionId: number) => {
    onChange(selectedIds.filter((id) => id !== optionId));
  };

  return (
    <div className="space-y-2">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
          {selectedOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded text-sm"
            >
              <span>{option.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(option.id)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm hover:border-slate-300 dark:hover:border-slate-600"
        >
          <span className="text-slate-500">
            {selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} mục` : placeholder}
          </span>
          <ChevronsUpDown size={16} className="text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-80 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-slate-500">
                  {emptyText}
                </div>
              ) : (
                <div className="py-1">
                  {filteredOptions.map((option) => {
                    const isSelected = selectedIds.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <span className={isSelected ? 'font-medium text-blue-900 dark:text-blue-100' : ''}>
                          {option.name}
                        </span>
                        {isSelected && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

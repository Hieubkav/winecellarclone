'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { Label } from './ui';

interface Option {
  value: number;
  label: string;
}

interface MultiSelectProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
  fetchOptions: (query: string) => Promise<Option[]>;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export function MultiSelect({
  label,
  value,
  onChange,
  fetchOptions,
  placeholder = 'Tìm kiếm...',
  required = false,
  helpText,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial selected options from IDs
  useEffect(() => {
    if (value.length > 0 && selectedOptions.length === 0) {
      loadOptions('');
    }
  }, [value]);

  // Load options when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOptions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadOptions = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await fetchOptions(query);
      setOptions(results);

      // Update selectedOptions with full data
      const selected = results.filter(opt => value.includes(opt.value));
      setSelectedOptions(prev => {
        // Merge with existing to avoid losing data
        const merged = [...prev];
        selected.forEach(s => {
          if (!merged.find(m => m.value === s.value)) {
            merged.push(s);
          }
        });
        return merged.filter(m => value.includes(m.value));
      });
    } catch (error) {
      console.error('Failed to load options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (option: Option) => {
    if (value.includes(option.value)) {
      // Deselect
      onChange(value.filter(v => v !== option.value));
      setSelectedOptions(selectedOptions.filter(o => o.value !== option.value));
    } else {
      // Select
      onChange([...value, option.value]);
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleRemove = (optionValue: number) => {
    onChange(value.filter(v => v !== optionValue));
    setSelectedOptions(selectedOptions.filter(o => o.value !== optionValue));
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Selected items chips */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
          {selectedOptions.map(option => (
            <div
              key={option.value}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded text-sm"
            >
              <span>{option.label}</span>
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm hover:border-slate-300 dark:hover:border-slate-600"
        >
          <span className="text-slate-500">
            {value.length > 0 ? `Đã chọn ${value.length} mục` : placeholder}
          </span>
          <ChevronsUpDown size={16} className="text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-80 overflow-hidden flex flex-col">
            {/* Search input */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Options list */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                </div>
              ) : options.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-slate-500">
                  Không tìm thấy kết quả
                </div>
              ) : (
                <div className="py-1">
                  {options.map(option => {
                    const isSelected = value.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <span className={isSelected ? 'font-medium text-blue-900 dark:text-blue-100' : ''}>
                          {option.label}
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

      {helpText && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
}

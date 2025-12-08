import React, { useState } from 'react';
import { FILTERS } from '../constants';
import { FilterState } from '../types';
import { Checkbox } from './ui/Checkbox';
import { Button } from './ui/Button';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  className?: string;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 py-4 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-bold uppercase tracking-wide text-stone-900 hover:text-brand-700"
      >
        {title}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {children}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ filters, setFilters, className = '' }) => {
  
  const handleTypeToggle = (type: string) => {
     // Implementation simplified for demo - just visual toggle
     // In real app, update the array in setFilters
  };

  return (
    <aside className={`flex flex-col gap-2 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-brand-700">
          <Filter size={20} />
          Bộ lọc
        </h2>
        <Button variant="ghost" size="sm" className="text-xs text-stone-400 hover:text-brand-600">
          <RotateCcw size={12} className="mr-1" /> Làm mới
        </Button>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <FilterSection title="Phân loại SP">
          <div className="flex flex-col gap-2.5">
            {FILTERS.types.map((type) => (
              <Checkbox 
                key={type} 
                label={type} 
                defaultChecked={type === 'Tất cả'}
              />
            ))}
             <div className="mt-2 text-xs italic text-gold-600 bg-gold-400/10 p-2 rounded-sm">
                💡 Chọn phân loại để xem thêm bộ lọc chi tiết
             </div>
          </div>
        </FilterSection>

        <FilterSection title="Danh mục">
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {FILTERS.categories.map((cat) => (
              <Checkbox key={cat} label={cat} defaultChecked={cat === 'Tất cả'}/>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Xuất xứ">
          <div className="flex flex-col gap-2.5">
             {FILTERS.origins.map((origin) => (
              <div key={origin} className="flex justify-between items-center">
                 <Checkbox label={origin} />
                 <span className="text-[10px] text-stone-400 font-mono">(12)</span>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Khoảng giá">
          <div className="px-2 pt-4 pb-2">
            <div className="relative h-1.5 w-full rounded-full bg-stone-200">
               <div className="absolute left-0 w-1/3 h-full bg-brand-700 rounded-l-full"></div>
               <div className="absolute left-1/3 h-4 w-4 -translate-y-1.5 -translate-x-2 rounded-full border-2 border-brand-700 bg-white shadow-md cursor-grab"></div>
               <div className="absolute right-0 h-4 w-4 -translate-y-1.5 translate-x-2 rounded-full border-2 border-brand-700 bg-white shadow-md cursor-grab"></div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium">
                    0 đ
                </div>
                <span className="text-stone-300">-</span>
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium">
                    10.000.000 đ
                </div>
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
};
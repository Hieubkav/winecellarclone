 'use client';
 
 import React, { useMemo } from 'react';
 import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, X, Columns3 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button, TableHead } from './ui';
 
 interface SortConfig {
   key: string | null;
   direction: 'asc' | 'desc';
 }
 
 interface SortableHeaderProps {
   label: string;
   sortKey: string;
   sortConfig: SortConfig;
   onSort: (key: string) => void;
 }
 
 export const SortableHeader: React.FC<SortableHeaderProps> = ({ label, sortKey, sortConfig, onSort }) => {
   const isActive = sortConfig.key === sortKey;
   
   return (
     <TableHead className="cursor-pointer select-none" onClick={() => onSort(sortKey)}>
       <div className="flex items-center gap-1">
         <span>{label}</span>
         {isActive ? (
           sortConfig.direction === 'asc' ? (
             <ArrowUp size={14} className="text-blue-600" />
           ) : (
             <ArrowDown size={14} className="text-blue-600" />
           )
         ) : (
           <ArrowUpDown size={14} className="text-slate-400" />
         )}
       </div>
     </TableHead>
   );
 };
 
 interface SelectCheckboxProps {
   checked: boolean;
   onChange: () => void;
   indeterminate?: boolean;
 }
 
 export const SelectCheckbox: React.FC<SelectCheckboxProps> = ({ checked, onChange, indeterminate }) => {
   return (
     <input
       type="checkbox"
       checked={checked}
       ref={(el) => {
         if (el) el.indeterminate = indeterminate || false;
       }}
       onChange={onChange}
       className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
     />
   );
 };
 
 interface BulkActionBarProps {
   selectedCount: number;
   onDelete: () => void;
   onClearSelection: () => void;
   isLoading?: boolean;
 }
 
 export const BulkActionBar: React.FC<BulkActionBarProps> = ({ 
   selectedCount, 
   onDelete, 
   onClearSelection,
   isLoading 
 }) => {
   if (selectedCount === 0) return null;
 
   return (
     <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
       <div className="flex items-center gap-2">
         <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
           Đã chọn {selectedCount} mục
         </span>
         <button 
           onClick={onClearSelection}
           className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
           aria-label="Clear selection"
         >
           <X size={16} />
         </button>
       </div>
       <Button 
         variant="destructive" 
         size="sm" 
         onClick={onDelete}
         disabled={isLoading}
         className="gap-2"
       >
         <Trash2 size={16} />
         Xóa đã chọn
       </Button>
     </div>
   );
 };
 
 interface Column {
   key: string;
   label: string;
   required?: boolean;
 }
 
 interface ColumnToggleProps {
   columns: Column[];
   visibleColumns: string[];
   onToggle: (key: string) => void;
 }
 
 export const ColumnToggle: React.FC<ColumnToggleProps> = ({ columns, visibleColumns, onToggle }) => {
   const [isOpen, setIsOpen] = React.useState(false);
 
   return (
     <div className="relative">
       <Button
         variant="outline"
         size="sm"
         onClick={() => setIsOpen(!isOpen)}
         className="gap-2"
       >
         <Columns3 size={16} />
         Cột
       </Button>
       
       {isOpen && (
         <>
           <div 
             className="fixed inset-0 z-10" 
             onClick={() => setIsOpen(false)} 
           />
           <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 min-w-[160px]">
             {columns.map((col) => (
               <label 
                 key={col.key}
                 className={cn(
                   "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-sm",
                   col.required && "opacity-50 cursor-not-allowed"
                 )}
               >
                 <input
                   type="checkbox"
                   checked={visibleColumns.includes(col.key)}
                   onChange={() => !col.required && onToggle(col.key)}
                   disabled={col.required}
                   className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                 />
                 <span className="text-slate-700 dark:text-slate-300">{col.label}</span>
               </label>
             ))}
           </div>
         </>
       )}
     </div>
   );
 };
 
 export function useSortableData<T>(data: T[], sortConfig: SortConfig): T[] {
   return useMemo(() => {
     if (!sortConfig.key) return data;
     
     return [...data].sort((a, b) => {
       const aVal = (a as Record<string, unknown>)[sortConfig.key!];
       const bVal = (b as Record<string, unknown>)[sortConfig.key!];
       
       if (aVal === null || aVal === undefined) return 1;
       if (bVal === null || bVal === undefined) return -1;
       
       if (typeof aVal === 'string' && typeof bVal === 'string') {
         const comparison = aVal.localeCompare(bVal, 'vi');
         return sortConfig.direction === 'asc' ? comparison : -comparison;
       }
       
       if (typeof aVal === 'number' && typeof bVal === 'number') {
         return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
       }
       
       return 0;
     });
   }, [data, sortConfig]);
 }

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, className = '', ...props }) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={generatedId}
          className="peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-stone-300 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-brand-700 checked:border-brand-700"
          {...props}
        />
        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
      </div>
      {label && (
        <label
          htmlFor={generatedId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-stone-600 hover:text-brand-700 cursor-pointer transition-colors"
        >
          {label}
        </label>
      )}
    </div>
  );
};
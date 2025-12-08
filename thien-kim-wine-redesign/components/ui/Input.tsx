import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ className = '', icon, ...props }) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          {icon}
        </div>
      )}
      <input
        className={`flex h-10 w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  );
};
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:pointer-events-none disabled:opacity-50 font-sans tracking-wide';
  
  const variants = {
    primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
    secondary: 'bg-gold-500 text-white hover:bg-gold-600 shadow-sm',
    outline: 'border border-stone-200 bg-transparent hover:bg-stone-100 text-stone-900',
    ghost: 'hover:bg-stone-100 hover:text-stone-900 text-stone-600',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
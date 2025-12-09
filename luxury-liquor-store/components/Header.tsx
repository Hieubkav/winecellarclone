import React from 'react';
import { ShoppingBag, Search, Menu, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <a href="#" className="text-2xl font-serif font-bold text-slate-900 tracking-tighter">
            WINE<span className="text-brand-600">CELLAR</span>
          </a>
        </div>

        <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-600">
          <a href="#" className="hover:text-brand-600 transition-colors">Vang đỏ</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Vang trắng</a>
          <a href="#" className="text-brand-600">Whisky</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Vodka</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Quà tặng</a>
        </nav>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-slate-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-slate-600 transition-colors hidden sm:block">
            <User className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-slate-600 transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
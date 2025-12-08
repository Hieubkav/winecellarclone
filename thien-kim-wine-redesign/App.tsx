import React, { useState } from 'react';
import { MOCK_PRODUCTS } from './constants';
import { FilterState, ViewMode } from './types';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Search, LayoutGrid, List, Filter, X, ArrowUpDown } from 'lucide-react';

function App() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    types: [],
    categories: [],
    origins: [],
    priceRange: [0, 10000000],
    sort: 'name-asc',
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col font-sans text-stone-800 bg-stone-50 min-h-screen">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative flex w-[85%] max-w-xs flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between border-b border-stone-100 p-4 bg-stone-50">
                    <h2 className="font-serif text-lg font-bold text-brand-700 flex items-center gap-2">
                        <Filter size={18} /> Bộ lọc & Tìm kiếm
                    </h2>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-stone-200 rounded-full transition-colors">
                        <X className="text-stone-500" size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Search in Mobile Sidebar */}
                    <div>
                        <label className="text-sm font-bold text-stone-900 mb-2 block">Tìm kiếm</label>
                        <Input 
                            placeholder="Tên rượu, xuất xứ..." 
                            icon={<Search size={16} />} 
                        />
                    </div>
                    <Sidebar filters={filters} setFilters={setFilters} />
                </div>
                <div className="p-4 border-t border-stone-100 bg-stone-50">
                    <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                        Xem {MOCK_PRODUCTS.length} kết quả
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-6 md:py-8">
        {/* Page Title & Search (Desktop) */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:mb-8">
            <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-700">Sản phẩm của chúng tôi</h1>
            </div>
            <div className="hidden w-full max-w-xs md:block">
                 <Input 
                    placeholder="Tìm kiếm sản phẩm..." 
                    icon={<Search size={16} />} 
                    className="bg-white shadow-sm"
                />
            </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden w-64 flex-none lg:block">
            <Sidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Product Grid Area */}
          <div className="flex-1">
             {/* Toolbar - Optimized for Mobile (Sticky) */}
            <div className="sticky top-0 z-30 -mx-4 mb-4 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md transition-all sm:static sm:mx-0 sm:mb-6 sm:rounded-lg sm:border sm:border-stone-100/50 sm:bg-white sm:p-4 sm:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    {/* Filter Button (Mobile) & Count */}
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="lg:hidden gap-2 bg-stone-50 border-stone-200 text-stone-700 h-9"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Filter size={15} /> <span className="text-xs font-medium">Bộ lọc</span>
                        </Button>
                        
                        <div className="text-xs text-stone-500 sm:text-sm">
                            <strong className="text-stone-900">{MOCK_PRODUCTS.length}</strong>
                            <span> SP</span>
                        </div>
                    </div>
                    
                    {/* Controls (Sort & View) */}
                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                         <div className="relative">
                            <select className="h-9 appearance-none rounded-sm border border-stone-200 bg-stone-50 pl-3 pr-8 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-700 cursor-pointer text-stone-700 hover:border-brand-300 sm:text-sm w-[110px] sm:w-auto truncate">
                                <option value="name-asc">Tên: A-Z</option>
                                <option value="price-asc">Giá tăng dần</option>
                                <option value="price-desc">Giá giảm dần</option>
                            </select>
                            <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                         </div>

                         <div className="hidden sm:flex items-center rounded-md border border-stone-200 p-1 bg-stone-50 shrink-0">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`rounded-sm p-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-brand-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                title="Lưới"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`rounded-sm p-1.5 transition-all ${viewMode === 'list' ? 'bg-white text-brand-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                title="Danh sách"
                            >
                                <List size={18} />
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Products Grid - Adjusted Gap */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 gap-4'}`}>
                {MOCK_PRODUCTS.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
            </div>

            {/* Pagination / Load More */}
            <div className="mt-8 flex justify-center pb-8 sm:mt-12">
                <Button variant="ghost" size="md" className="w-full sm:w-auto min-w-[200px] text-stone-500 hover:text-brand-700 hover:bg-stone-100 border border-stone-100 sm:border-0">
                    Xem thêm sản phẩm
                </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
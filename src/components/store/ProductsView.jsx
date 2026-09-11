import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import brandService from '../../services/brandService';
import ProductCard from '../common/ProductCard';
import ProductQuickViewModal from './ProductQuickViewModal';
import {
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  Filter,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function ProductsView() {
  const { currentParams, activeFestival } = useStore();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(currentParams?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(currentParams?.categorySlug || '');
  const [selectedBrand, setSelectedBrand] = useState(currentParams?.brand || '');
  const [selectedFestival, setSelectedFestival] = useState(currentParams?.festivalSlug || '');
  const [priceMax, setPriceMax] = useState(2500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(currentParams?.sortBy || 'featured');

  useEffect(() => {
    if (currentParams) {
      if (currentParams.search !== undefined) setSearchQuery(currentParams.search);
      if (currentParams.categorySlug !== undefined) setSelectedCategory(currentParams.categorySlug);
      if (currentParams.brand !== undefined) setSelectedBrand(currentParams.brand);
      if (currentParams.festivalSlug !== undefined) setSelectedFestival(currentParams.festivalSlug);
      if (currentParams.sortBy !== undefined) setSortBy(currentParams.sortBy);
    }
  }, [currentParams]);

  const rawCategories = categoryService.getCategories();
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const rawBrands = brandService.getBrands();
  const brands = Array.isArray(rawBrands) ? rawBrands : [];

  // Get filtered products
  const products = useMemo(() => {
    let result = productService.getProducts({
      categorySlug: selectedCategory,
      brand: selectedBrand,
      festivalSlug: selectedFestival,
      search: searchQuery,
      maxPrice: priceMax,
      inStockOnly: inStockOnly,
      sortBy: sortBy
    });
    return Array.isArray(result) ? result : [];
  }, [selectedCategory, selectedBrand, selectedFestival, searchQuery, priceMax, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedFestival('');
    setPriceMax(2500);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-neutral-900">
            Catalog Directory
          </h1>
          <p className="text-xs text-neutral-500">
            Showing {products.length} products
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedBrand && ` by ${selectedBrand}`}
          </p>
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white rounded-xl border border-neutral-300 text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-rose-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="bestseller">Sort: Bestseller</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden p-2 bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-md"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center space-x-2">
              <Filter className="w-4 h-4 text-rose-600" />
              <span>Filter Catalog</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-rose-700 font-bold hover:underline flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">Category</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition font-medium ${
                  !selectedCategory ? 'bg-rose-50 text-rose-700 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition font-medium truncate ${
                    selectedCategory === cat.slug ? 'bg-rose-50 text-rose-700 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-neutral-300 text-xs font-medium text-neutral-800"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-neutral-900 uppercase tracking-wider">Max Price</label>
              <span className="font-extrabold text-rose-700">₹{priceMax}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2500"
              step="50"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* In Stock Checkbox */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-center space-x-2 text-xs font-medium text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-neutral-300"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Filter Chips */}
          {(selectedCategory || selectedBrand || selectedFestival || searchQuery || inStockOnly) && (
            <div className="flex items-center gap-2 flex-wrap text-xs bg-rose-50 p-3 rounded-2xl border border-rose-200">
              <span className="font-bold text-rose-900">Active Filters:</span>
              {selectedCategory && (
                <span className="bg-white text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200 flex items-center space-x-1">
                  <span>Cat: {selectedCategory}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                </span>
              )}
              {selectedBrand && (
                <span className="bg-white text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200 flex items-center space-x-1">
                  <span>Brand: {selectedBrand}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('')} />
                </span>
              )}
              {inStockOnly && (
                <span className="bg-white text-rose-700 px-2.5 py-0.5 rounded-full font-bold border border-rose-200 flex items-center space-x-1">
                  <span>In Stock Only</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-800 underline font-bold ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-base">No Matching Products Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                We couldn't find any items matching your selected criteria. Try adjusting your search query or reset your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-rose-700 transition"
              >
                Reset Catalog Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-900 text-sm">Filter Catalog</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-900 uppercase">Category</label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-2 py-1.5 rounded-lg ${!selectedCategory ? 'bg-rose-600 text-white font-bold' : 'text-neutral-700'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg ${selectedCategory === cat.slug ? 'bg-rose-600 text-white font-bold' : 'text-neutral-700'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-900 uppercase">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-neutral-300 text-xs"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Max */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-neutral-900 uppercase">Max Price</label>
                  <span className="font-bold text-rose-700">₹{priceMax}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="50"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-neutral-900 text-white font-bold text-xs rounded-xl shadow-lg"
            >
              Apply & Close
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

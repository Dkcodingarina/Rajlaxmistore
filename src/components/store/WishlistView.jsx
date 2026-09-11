import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import productService from '../../services/productService';
import ProductCard from '../common/ProductCard';
import ProductQuickViewModal from './ProductQuickViewModal';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles, ShoppingCart } from 'lucide-react';

export default function WishlistView() {
  const { wishlist, toggleWishlist, addToCart, navigateTo, showToast } = useStore();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch all products that match IDs in wishlist
  const allProducts = productService.getProducts({ includeInactive: true });
  const wishlistedProducts = allProducts.filter(p => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    if (wishlistedProducts.length === 0) return;
    let addedCount = 0;
    wishlistedProducts.forEach(product => {
      if (product.stock > 0) {
        addToCart(product, 1);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      showToast(`Added ${addedCount} items from your wishlist to cart!`, 'success');
    } else {
      showToast('All items in your wishlist are currently out of stock.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-neutral-900 flex items-center space-x-2">
              <span>My Wishlist</span>
              <Heart className="w-6 h-6 text-rose-600 fill-rose-600 inline" />
            </h1>
            <p className="text-xs text-neutral-500">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddAllToCart}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-4 max-w-lg mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-neutral-900 text-lg">Your Wishlist is Empty</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Explore our wide collection of premium cosmetics, skincare, and stationery items, and tap the heart icon to save your favorite products here!
            </p>
          </div>
          <button
            onClick={() => navigateTo('products')}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Catalog</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
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

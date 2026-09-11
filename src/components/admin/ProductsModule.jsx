import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Star,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  Save,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  Image as ImageIcon
} from 'lucide-react';
import productService from '../../services/productService';
import ImageUploadDropzone from '../common/ImageUploadDropzone';
import ConfirmModal from '../common/ConfirmModal';

export default function ProductsModule({
  products = [],
  setProducts,
  categories = [],
  festivals = [],
  showToast,
  auditLog
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out' | 'in'
  const [badgeFilter, setBadgeFilter] = useState('all'); // 'all' | 'featured' | 'bestseller' | 'newArrival'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null, productName: '' });
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: 25,
    unit: 'piece',
    badge: '',
    description: '',
    brand: '',
    image: '',
    images: [],
    specs: '',
    featured: false,
    bestseller: false,
    newArrival: false,
    festivalSlug: '',
    status: 'active'
  });

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      // Category
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter || p.categorySlug === categoryFilter;

      // Stock Filter
      const stockNum = Number(p.stock) || 0;
      let matchStock = true;
      if (stockFilter === 'low') matchStock = stockNum > 0 && stockNum <= 5;
      else if (stockFilter === 'out') matchStock = stockNum === 0;
      else if (stockFilter === 'in') matchStock = stockNum > 5;

      // Badge Filter
      let matchBadge = true;
      if (badgeFilter === 'featured') matchBadge = Boolean(p.featured);
      else if (badgeFilter === 'bestseller') matchBadge = Boolean(p.bestseller);
      else if (badgeFilter === 'newArrival') matchBadge = Boolean(p.newArrival);

      return matchSearch && matchCategory && matchStock && matchBadge;
    });
  }, [products, searchQuery, categoryFilter, stockFilter, badgeFilter]);

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name || '',
        sku: prod.sku || `SKU-${Date.now().toString().slice(-4)}`,
        category: prod.category || (categories[0]?.name || 'Cosmetics & Makeup'),
        price: prod.price || '',
        originalPrice: prod.originalPrice || prod.mrp || '',
        stock: prod.stock !== undefined ? prod.stock : 20,
        unit: prod.unit || 'piece',
        badge: prod.badge || (prod.bestseller ? 'Bestseller' : prod.featured ? 'Featured Pure' : ''),
        description: prod.description || '',
        brand: prod.brand || '',
        image: prod.image || prod.images?.[0] || '',
        images: Array.isArray(prod.images) ? prod.images : (prod.image ? [prod.image] : []),
        specs: prod.specs || prod.careInstructions || '',
        featured: Boolean(prod.featured),
        bestseller: Boolean(prod.bestseller),
        newArrival: Boolean(prod.newArrival),
        festivalSlug: prod.festivalSlug || (Array.isArray(prod.festivals) && prod.festivals[0]) || '',
        status: prod.status || 'active'
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: categories[0]?.name || 'Cosmetics & Makeup',
        price: '',
        originalPrice: '',
        stock: 30,
        unit: 'piece',
        badge: '',
        description: '',
        brand: '',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        images: [],
        specs: '',
        featured: false,
        bestseller: false,
        newArrival: true,
        festivalSlug: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      showToast('Product name and selling price are required', 'error');
      return;
    }

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : null,
      stock: Number(productForm.stock) || 0,
      images: productForm.images?.length > 0 ? productForm.images : [productForm.image]
    };

    if (editingProduct) {
      productService.updateProduct(editingProduct.id, payload);
      setProducts(productService.getProducts({ includeInactive: true }));
      showToast(`Product "${payload.name}" updated successfully`, 'success');
      if (auditLog) {
        auditLog('UPDATE_PRODUCT', payload.name, `Updated product price to ₹${payload.price} & stock to ${payload.stock}`);
      }
    } else {
      productService.createProduct(payload);
      setProducts(productService.getProducts({ includeInactive: true }));
      showToast(`Product "${payload.name}" added to catalog`, 'success');
      if (auditLog) {
        auditLog('CREATE_PRODUCT', payload.name, `Created SKU ${payload.sku} priced at ₹${payload.price}`);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    setDeleteConfirm({ isOpen: true, productId: id, productName: name });
  };

  const confirmDeleteAction = () => {
    const { productId, productName } = deleteConfirm;
    if (!productId) return;
    productService.deleteProduct(productId);
    setProducts(productService.getProducts({ includeInactive: true }));
    showToast(`Product "${productName}" removed from catalog`, 'info');
    if (auditLog) {
      auditLog('DELETE_PRODUCT', productName, 'Deleted product SKU from catalog');
    }
    setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
  };

  const handleInlineStock = (id, delta, currentStock, name) => {
    const newStock = Math.max(0, (Number(currentStock) || 0) + delta);
    productService.updateStock(id, delta);
    setProducts(productService.getProducts({ includeInactive: true }));
    showToast(`Stock updated for ${name} (${newStock} units remaining)`, 'info');
    if (auditLog) {
      auditLog('QUICK_STOCK_UPDATE', name, `Adjusted stock ${delta > 0 ? `+${delta}` : delta} (New: ${newStock})`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-600" />
            <span>Product Catalog & SKU Inventory Desk</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Manage comprehensive SKU database, pricing markdowns, variant specifications, and stock limits
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New SKU</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU code, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">All Stock Status</option>
              <option value="low">⚠️ Low Stock (≤ 5)</option>
              <option value="out">❌ Out of Stock (0)</option>
              <option value="in">✅ In Stock (&gt; 5)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 text-xs">
          <span className="text-[11px] font-mono text-neutral-400">Quick Filter:</span>
          {['all', 'featured', 'bestseller', 'newArrival'].map((type) => (
            <button
              key={type}
              onClick={() => setBadgeFilter(type)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                badgeFilter === type
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {type === 'newArrival' ? 'New Arrivals' : type}
            </button>
          ))}
          <span className="text-[11px] font-mono text-neutral-400 ml-auto">
            Showing {filteredProducts.length} of {products.length} Products
          </span>
        </div>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">SKU / Product Info</th>
                <th className="p-4">Category & Brand</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Badges & Drops</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-neutral-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                    <p className="font-bold text-neutral-700">No products matching filters</p>
                    <p className="text-[11px]">Try adjusting your search query or category filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const stockNum = Number(prod.stock) || 0;
                  const isLow = stockNum > 0 && stockNum <= 5;
                  const isOut = stockNum === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/70 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-mono text-[10px] text-neutral-400 block">{prod.sku || 'SKU-0000'}</span>
                            <h4 className="font-bold text-neutral-900 truncate leading-snug">{prod.name}</h4>
                            <p className="text-[11px] text-neutral-500 line-clamp-1">{prod.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium block w-max truncate max-w-[140px]">
                          {prod.category || 'General'}
                        </span>
                        {prod.brand && (
                          <span className="text-[10px] font-mono text-neutral-400 mt-0.5 block">{prod.brand}</span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold">
                        <div className="text-sm text-neutral-900">₹{prod.price}</div>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <div className="text-[10px] text-neutral-400 line-through">₹{prod.originalPrice}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                            isOut
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isOut ? 'Out of Stock' : `${stockNum} units`}
                          </span>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleInlineStock(prod.id, -1, prod.stock, prod.name)}
                              className="p-1 rounded hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                              title="Decrease Stock (-1)"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleInlineStock(prod.id, 5, prod.stock, prod.name)}
                              className="p-1 rounded hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                              title="Restock (+5)"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.bestseller && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              Bestseller
                            </span>
                          )}
                          {prod.featured && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                              Featured
                            </span>
                          )}
                          {prod.festivalSlug && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-900 border border-rose-200 font-mono">
                              🎉 {prod.festivalSlug}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(prod)}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
              <div>
                <h3 className="font-serif font-black text-xl text-neutral-900">
                  {editingProduct ? `Edit Product SKU: ${editingProduct.sku || ''}` : 'Add New Product SKU'}
                </h3>
                <p className="text-xs text-neutral-500">Configure catalog specifications, pricing, gallery images & campaign links</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lakmé Absolute Matte Revolution Lipstick"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">SKU Identifier Code</label>
                  <input
                    type="text"
                    placeholder="e.g., SKU-LK89"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category</label>
                  <select
                    value={productForm.category || ''}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Lakmé"
                    value={productForm.brand || ''}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g., 749"
                    value={productForm.price !== undefined && productForm.price !== null ? productForm.price : ''}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g., 850"
                    value={productForm.originalPrice !== undefined && productForm.originalPrice !== null ? productForm.originalPrice : ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Inventory Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock !== undefined && productForm.stock !== null ? productForm.stock : ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Special Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g., Pure Matte Silk"
                    value={productForm.badge || ''}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Assign to Festival Campaign</label>
                  <select
                    value={productForm.festivalSlug || ''}
                    onChange={(e) => setProductForm({ ...productForm, festivalSlug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                  >
                    <option value="">No Festival (Standard Catalog)</option>
                    {festivals.map(f => (
                      <option key={f.id} value={f.slug}>🎉 {f.name} ({f.slug})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Detailed product highlights, ingredients, weight, or dimensions..."
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Primary Product Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productForm.image || ''}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
                <div className="mt-2">
                  <ImageUploadDropzone
                    label="Upload product photography (Clean studio background)"
                    onImageUploaded={(url) => setProductForm({ ...productForm, image: url })}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-neutral-100">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={productForm.bestseller}
                    onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={productForm.newArrival}
                    onChange={(e) => setProductForm({ ...productForm, newArrival: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>New Arrival Drop</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save SKU to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Product SKU?"
        message={`Are you sure you want to remove product "${deleteConfirm.productName}" from the catalog? This will delete its pricing, stock records, and media.`}
        confirmText="Yes, Delete Product"
        cancelText="Keep Product"
        confirmVariant="danger"
        onConfirm={confirmDeleteAction}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null, productName: '' })}
      />
    </div>
  );
}

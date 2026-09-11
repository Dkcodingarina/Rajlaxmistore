import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Package,
  Eye,
  Save,
  CheckCircle
} from 'lucide-react';
import categoryService from '../../services/categoryService';
import ImageUploadDropzone from '../common/ImageUploadDropzone';
import ConfirmModal from '../common/ConfirmModal';

export default function CategoriesModule({
  categories = [],
  setCategories,
  products = [],
  showToast,
  auditLog
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, categoryId: null, categoryName: '' });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    featuredNav: true
  });

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name || '',
        slug: cat.slug || '',
        description: cat.description || '',
        image: cat.image || '',
        featuredNav: cat.featuredNav !== false
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        featuredNav: true
      });
    }
    setShowModal(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    const payload = {
      ...categoryForm,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    if (editingCategory) {
      categoryService.updateCategory(editingCategory.id, payload);
      setCategories(categoryService.getCategories());
      showToast(`Category "${payload.name}" updated`, 'success');
      if (auditLog) {
        auditLog('UPDATE_CATEGORY', payload.name, 'Updated category details and hero image');
      }
    } else {
      categoryService.createCategory(payload);
      setCategories(categoryService.getCategories());
      showToast(`New category "${payload.name}" created`, 'success');
      if (auditLog) {
        auditLog('CREATE_CATEGORY', payload.name, 'Created new category collection');
      }
    }
    setShowModal(false);
  };

  const handleDeleteCategory = (id, name) => {
    setDeleteConfirm({ isOpen: true, categoryId: id, categoryName: name });
  };

  const confirmDeleteCategoryAction = () => {
    const { categoryId, categoryName } = deleteConfirm;
    if (!categoryId) return;
    categoryService.deleteCategory(categoryId);
    setCategories(categoryService.getCategories());
    showToast(`Category "${categoryName}" deleted`, 'info');
    if (auditLog) {
      auditLog('DELETE_CATEGORY', categoryName, 'Deleted category from hierarchy');
    }
    setDeleteConfirm({ isOpen: false, categoryId: null, categoryName: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-black text-neutral-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Category Hierarchy & Navigation Collections</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Organize catalog classifications, cover hero art, and storefront navigation tabs
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter(p => p.category === cat.name || p.categorySlug === cat.slug).length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
            >
              <div className="h-36 w-full relative overflow-hidden bg-neutral-900">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="font-mono text-[10px] text-neutral-300">/{cat.slug}</span>
                  <h3 className="font-bold text-base leading-snug">{cat.name}</h3>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs text-neutral-500 line-clamp-2">{cat.description || 'Collection of curated items'}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                  <span className="font-mono font-bold text-neutral-700 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{productCount} SKUs</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <h3 className="font-serif font-black text-lg text-neutral-900">
                {editingCategory ? 'Edit Category Collection' : 'Create Category Collection'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cosmetics & Makeup"
                  value={categoryForm.name || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">URL Identifier (Slug)</label>
                <input
                  type="text"
                  placeholder="e.g., cosmetics-makeup"
                  value={categoryForm.slug || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Short Description</label>
                <textarea
                  rows="2"
                  placeholder="e.g., Lipsticks, foundations, eyeliners & skincare essentials"
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Cover Hero Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={categoryForm.image || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:bg-white focus:outline-none"
                />
                <div className="mt-2">
                  <ImageUploadDropzone
                    label="Upload cover image"
                    onImageUploaded={(url) => setCategoryForm({ ...categoryForm, image: url })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-sm cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Category?"
        message={`Are you sure you want to delete category "${deleteConfirm.categoryName}"? Existing products under this category might need reassignment.`}
        confirmText="Yes, Delete Category"
        cancelText="Keep Category"
        confirmVariant="danger"
        onConfirm={confirmDeleteCategoryAction}
        onClose={() => setDeleteConfirm({ isOpen: false, categoryId: null, categoryName: '' })}
      />
    </div>
  );
}

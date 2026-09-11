import dataProvider from '../providers/dataProvider';

export const categoryService = {
  getCategories: () => {
    return dataProvider.getCategories();
  },

  getCategoryBySlug: (slug) => {
    return dataProvider.getCategoryBySlug(slug);
  },

  createCategory: (data) => {
    return dataProvider.createCategory(data);
  },

  updateCategory: (id, data) => {
    return dataProvider.updateCategory(id, data);
  },

  deleteCategory: (id) => {
    return dataProvider.deleteCategory(id);
  }
};

export default categoryService;

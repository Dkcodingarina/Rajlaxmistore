import dataProvider from '../providers/dataProvider';

export const productService = {
  getProducts: (filters = {}) => {
    return dataProvider.getProducts(filters);
  },

  getProductById: (id) => {
    return dataProvider.getProductById(id);
  },

  getFeaturedProducts: () => {
    return dataProvider.getProducts({ isFeatured: true });
  },

  getBestsellers: () => {
    return dataProvider.getProducts({ isBestseller: true });
  },

  getNewArrivals: () => {
    return dataProvider.getProducts({ newest: true });
  },

  createProduct: (productData) => {
    return dataProvider.createProduct(productData);
  },

  updateProduct: (id, productData) => {
    return dataProvider.updateProduct(id, productData);
  },

  deleteProduct: (id) => {
    return dataProvider.deleteProduct(id);
  },

  toggleStatus: (id) => {
    const prod = dataProvider.getProductById(id);
    if (!prod) return null;
    const newStatus = prod.status === 'active' ? 'inactive' : 'active';
    return dataProvider.updateProduct(id, { status: newStatus });
  },

  updateStock: (id, deltaOrTotal, isSetDirectly = false) => {
    return dataProvider.updateStock(id, deltaOrTotal, isSetDirectly);
  },

  addProduct: (productData) => {
    return dataProvider.createProduct(productData);
  }
};

export default productService;

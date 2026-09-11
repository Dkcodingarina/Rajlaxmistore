import storage from '../utils/storage';
import {
  seedCategories,
  seedBrands,
  seedFestivals,
  seedBanners,
  seedProducts,
  seedCoupons
} from '../data/seedData';

export const storageService = {
  get: (key, defaultValue = null) => storage.get(key, defaultValue),
  set: (key, value) => storage.set(key, value),
  remove: (key) => storage.remove(key),
  getItem: (key, defaultValue = null) => storage.get(key, defaultValue),
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.remove(key),
  initStorage: () => {
    // Clean initial empty structures if not present
    if (!storage.get('cart')) storage.set('cart', []);
    if (!storage.get('wishlist')) storage.set('wishlist', []);

    // Seed products if missing or empty
    const currentProducts = storage.get('products');
    if (!Array.isArray(currentProducts) || currentProducts.length === 0) {
      storage.set('products', seedProducts);
      localStorage.setItem('rajlaxmi_products', JSON.stringify(seedProducts));
    }

    // Seed categories if missing or empty
    const currentCategories = storage.get('categories');
    if (!Array.isArray(currentCategories) || currentCategories.length === 0) {
      storage.set('categories', seedCategories);
      localStorage.setItem('rajlaxmi_categories', JSON.stringify(seedCategories));
    }

    // Seed festivals if missing or fewer than complete seed catalog
    const currentFestivals = storage.get('festivals');
    if (!Array.isArray(currentFestivals) || currentFestivals.length < seedFestivals.length) {
      storage.set('festivals', seedFestivals);
      localStorage.setItem('rajlaxmi_festivals', JSON.stringify(seedFestivals));
    }

    // Seed banners if missing or empty
    const currentBanners = storage.get('banners');
    if (!Array.isArray(currentBanners) || currentBanners.length === 0) {
      storage.set('banners', seedBanners);
      localStorage.setItem('rajlaxmi_banners', JSON.stringify(seedBanners));
    }

    // Seed brands if missing or empty
    const currentBrands = storage.get('brands');
    if (!Array.isArray(currentBrands) || currentBrands.length === 0) {
      storage.set('brands', seedBrands);
      localStorage.setItem('rajlaxmi_brands', JSON.stringify(seedBrands));
    }

    // Seed coupons if missing or empty
    const currentCoupons = storage.get('coupons');
    if (!Array.isArray(currentCoupons) || currentCoupons.length === 0) {
      storage.set('coupons', seedCoupons);
      localStorage.setItem('rajlaxmi_coupons', JSON.stringify(seedCoupons));
    }
  },
  resetStorage: () => {
    storage.clearAll();
    return true;
  }
};

export default storageService;

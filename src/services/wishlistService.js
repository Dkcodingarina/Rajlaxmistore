import dataProvider from '../providers/dataProvider';

export const wishlistService = {
  getWishlist: (userId) => {
    return dataProvider.getWishlist(userId);
  },

  isInWishlist: (productId, userId) => {
    return dataProvider.isInWishlist(productId, userId);
  },

  toggleWishlist: (productId, userId) => {
    return dataProvider.toggleWishlist(productId, userId);
  },

  clearWishlist: (userId) => {
    return dataProvider.clearWishlist ? dataProvider.clearWishlist(userId) : [];
  }
};

export default wishlistService;

import dataProvider from '../providers/dataProvider';

export const couponService = {
  getCoupons: () => {
    return dataProvider.getCoupons();
  },

  validateCoupon: (code, subtotal, activeFestivalSlug = '') => {
    return dataProvider.validateCoupon(code, subtotal, activeFestivalSlug);
  },

  createCoupon: (data) => {
    return dataProvider.createCoupon(data);
  },

  updateCoupon: (id, data) => {
    return dataProvider.updateCoupon(id, data);
  },

  deleteCoupon: (id) => {
    return dataProvider.deleteCoupon(id);
  }
};

export default couponService;

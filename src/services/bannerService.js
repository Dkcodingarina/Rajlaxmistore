import dataProvider from '../providers/dataProvider';

export const bannerService = {
  getBanners: (activeOnly = false) => {
    return dataProvider.getBanners(activeOnly);
  },

  createBanner: (data) => {
    return dataProvider.createBanner(data);
  },

  updateBanner: (id, data) => {
    return dataProvider.updateBanner(id, data);
  },

  deleteBanner: (id) => {
    return dataProvider.deleteBanner(id);
  }
};

export default bannerService;

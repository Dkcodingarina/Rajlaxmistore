import dataProvider from '../providers/dataProvider';

export const brandService = {
  getBrands: () => {
    return dataProvider.getBrands();
  },

  createBrand: (data) => {
    return dataProvider.createBrand(data);
  },

  updateBrand: (id, data) => {
    return dataProvider.updateBrand(id, data);
  },

  deleteBrand: (id) => {
    return dataProvider.deleteBrand(id);
  }
};

export default brandService;

import dataProvider from '../providers/dataProvider';

export const inventoryService = {
  getInventoryOverview: () => {
    return dataProvider.getInventoryOverview();
  },

  updateStockCount: (productId, newStock) => {
    return dataProvider.updateStockCount(productId, newStock);
  }
};

export default inventoryService;

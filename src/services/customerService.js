import dataProvider from '../providers/dataProvider';

export const customerService = {
  getCustomers: () => {
    return dataProvider.getCustomers();
  },

  getCustomerById: (id) => {
    return dataProvider.getCustomerById(id);
  },

  toggleCustomerStatus: (id) => {
    return dataProvider.toggleCustomerStatus(id);
  },

  deleteCustomer: (id) => {
    return dataProvider.deleteCustomerProfile(id);
  },

  updateCustomerProfile: (id, updatedData) => {
    return dataProvider.updateCustomerProfile(id, updatedData);
  }
};

export default customerService;

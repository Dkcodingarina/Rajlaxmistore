import dataProvider from '../providers/dataProvider';

export const settingsService = {
  getSettings: () => {
    return dataProvider.getSettings();
  },

  updateSettings: (newSettings) => {
    return dataProvider.updateSettings(newSettings);
  }
};

export default settingsService;

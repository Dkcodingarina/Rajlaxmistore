import dataProvider from '../providers/dataProvider';

export const festivalService = {
  getFestivals: () => {
    return dataProvider.getFestivals();
  },

  getActiveFestival: () => {
    return dataProvider.getActiveFestival();
  },

  getFestivalBySlug: (slug) => {
    return dataProvider.getFestivalBySlug(slug);
  },

  activateFestival: (id) => {
    return dataProvider.activateFestival(id);
  },

  deactivateFestival: (id) => {
    return dataProvider.deactivateFestival(id);
  },

  createFestival: (data) => {
    return dataProvider.createFestival(data);
  },

  updateFestival: (id, data) => {
    return dataProvider.updateFestival(id, data);
  },

  deleteFestival: (id) => {
    return dataProvider.deleteFestival(id);
  },

  pauseAllFestivals: () => {
    return dataProvider.pauseAllFestivals ? dataProvider.pauseAllFestivals() : null;
  }
};

export default festivalService;

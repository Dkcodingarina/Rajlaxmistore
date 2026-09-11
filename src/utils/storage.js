/**
 * Centralized Storage Abstraction
 * Handles safe JSON serialization, error handling, and localStorage interaction.
 * React components and services never access localStorage directly.
 */

const PREFIX = 'rlx_store_';

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(PREFIX + key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Storage error reading key "${key}":`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage error writing key "${key}":`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch (error) {
      console.error(`Storage error removing key "${key}":`, error);
      return false;
    }
  },

  clearAll: () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage error clearing data:', error);
      return false;
    }
  }
};

export default storage;

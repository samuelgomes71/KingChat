import api from './api';

export const folderService = {
  // Get user's folders
  async getFolders() {
    try {
      const response = await api.get('/folders');
      return response.data;
    } catch (error) {
      console.error('Get folders failed:', error);
      throw error;
    }
  },

  // Create new folder
  async createFolder(folderData) {
    try {
      const response = await api.post('/folders', folderData);
      return response.data;
    } catch (error) {
      console.error('Create folder failed:', error);
      throw error;
    }
  }
};
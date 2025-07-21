import api from './api';

export const privacyService = {
  // Get privacy settings
  async getPrivacySettings() {
    try {
      const response = await api.get('/privacy');
      return response.data;
    } catch (error) {
      console.error('Get privacy settings failed:', error);
      throw error;
    }
  },

  // Update global privacy settings
  async updateGlobalPrivacySettings(settings) {
    try {
      const response = await api.put('/privacy', settings);
      return response.data;
    } catch (error) {
      console.error('Update privacy settings failed:', error);
      throw error;
    }
  },

  // Update contact-specific privacy settings
  async updateContactPrivacySettings(contactUpdate) {
    try {
      const response = await api.put('/privacy/contacts', contactUpdate);
      return response.data;
    } catch (error) {
      console.error('Update contact privacy settings failed:', error);
      throw error;
    }
  },

  // Get privacy settings for specific contact
  async getContactPrivacySettings(contactId) {
    try {
      const response = await api.get(`/privacy/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Get contact privacy settings failed:', error);
      throw error;
    }
  }
};
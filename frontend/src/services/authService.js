import api from './api';

export const authService = {
  // Demo login for testing
  async demoLogin() {
    try {
      const response = await api.post('/auth/demo-login');
      const { access_token, user } = response.data;
      
      localStorage.setItem('kingchat_token', access_token);
      localStorage.setItem('kingchat_user', JSON.stringify(user));
      
      return { token: access_token, user };
    } catch (error) {
      console.error('Demo login failed:', error);
      throw error;
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('kingchat_token');
    localStorage.removeItem('kingchat_user');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('kingchat_token');
  },

  // Get stored user
  getStoredUser() {
    const userStr = localStorage.getItem('kingchat_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
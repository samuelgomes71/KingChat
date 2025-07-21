import api from './api';

export const chatService = {
  // Get user's chats with folders
  async getUserChatsWithFolders() {
    try {
      const response = await api.get('/users/chats');
      return response.data;
    } catch (error) {
      console.error('Get user chats failed:', error);
      throw error;
    }
  },

  // Get all chats
  async getChats(chatType = null) {
    try {
      const params = chatType ? { chat_type: chatType } : {};
      const response = await api.get('/chats', { params });
      return response.data;
    } catch (error) {
      console.error('Get chats failed:', error);
      throw error;
    }
  },

  // Get specific chat
  async getChat(chatId) {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Get chat failed:', error);
      throw error;
    }
  },

  // Create new chat
  async createChat(chatData) {
    try {
      const response = await api.post('/chats', chatData);
      return response.data;
    } catch (error) {
      console.error('Create chat failed:', error);
      throw error;
    }
  },

  // Update chat
  async updateChat(chatId, updateData) {
    try {
      const response = await api.put(`/chats/${chatId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update chat failed:', error);
      throw error;
    }
  },

  // Delete chat
  async deleteChat(chatId) {
    try {
      await api.delete(`/chats/${chatId}`);
      return true;
    } catch (error) {
      console.error('Delete chat failed:', error);
      throw error;
    }
  },

  // Join public chat/channel
  async joinChat(chatId) {
    try {
      await api.post(`/chats/${chatId}/join`);
      return true;
    } catch (error) {
      console.error('Join chat failed:', error);
      throw error;
    }
  },

  // Leave chat
  async leaveChat(chatId) {
    try {
      await api.post(`/chats/${chatId}/leave`);
      return true;
    } catch (error) {
      console.error('Leave chat failed:', error);
      throw error;
    }
  }
};
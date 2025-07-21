import api from './api';

export const messageService = {
  // Get messages from a chat
  async getChatMessages(chatId, limit = 50, before = null) {
    try {
      const params = { limit };
      if (before) params.before = before;
      
      const response = await api.get(`/chats/${chatId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('Get messages failed:', error);
      throw error;
    }
  },

  // Send message
  async sendMessage(chatId, messageData) {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  },

  // Update/edit message
  async updateMessage(messageId, updateData) {
    try {
      const response = await api.put(`/messages/${messageId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update message failed:', error);
      throw error;
    }
  },

  // Delete message
  async deleteMessage(messageId) {
    try {
      await api.delete(`/messages/${messageId}`);
      return true;
    } catch (error) {
      console.error('Delete message failed:', error);
      throw error;
    }
  },

  // Mark message as read
  async markAsRead(messageId) {
    try {
      await api.post(`/messages/${messageId}/read`);
      return true;
    } catch (error) {
      console.error('Mark as read failed:', error);
      throw error;
    }
  },

  // Add reaction to message
  async addReaction(messageId, emoji) {
    try {
      const response = await api.post(`/messages/${messageId}/react`, null, {
        params: { emoji }
      });
      return response.data;
    } catch (error) {
      console.error('Add reaction failed:', error);
      throw error;
    }
  },

  // Remove reaction from message
  async removeReaction(messageId, emoji) {
    try {
      const response = await api.delete(`/messages/${messageId}/react/${emoji}`);
      return response.data;
    } catch (error) {
      console.error('Remove reaction failed:', error);
      throw error;
    }
  },

  // Forward message
  async forwardMessage(messageId, targetChatId) {
    try {
      const response = await api.post(`/messages/${messageId}/forward`, null, {
        params: { target_chat_id: targetChatId }
      });
      return response.data;
    } catch (error) {
      console.error('Forward message failed:', error);
      throw error;
    }
  },

  // Search messages
  async searchMessages(query, chatId = null, limit = 50) {
    try {
      const params = { q: query, limit };
      if (chatId) params.chat_id = chatId;
      
      const response = await api.get('/search/messages', { params });
      return response.data;
    } catch (error) {
      console.error('Search messages failed:', error);
      throw error;
    }
  }
};
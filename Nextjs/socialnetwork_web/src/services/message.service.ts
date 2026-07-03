import api from '../lib/axios';

export const messageService = {
  getConversations: async () => {
    const res = await api.get('/message');
    return res.data;
  },

  getMessages: async (conversationId: string) => {
    const res = await api.get(`/message/${conversationId}/messages`);
    return res.data;
  },

  sendMessage: async (conversationId: string, content: string, type: string = 'text', attachments: any[] = []) => {
    const res = await api.post(`/message/${conversationId}/send`, { content, type, attachments });
    return res.data;
  },

  createConversation: async (receiverId: string) => {
    const res = await api.post('/message', { receiverId });
    return res.data;
  },

  markAsRead: async (conversationId: string) => {
    const res = await api.post(`/message/${conversationId}/read`);
    return res.data;
  }
};

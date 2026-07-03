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

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/message/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  uploadAudio: async (file: File) => {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await api.post('/message/upload-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/message/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  createConversation: async (receiverId: string) => {
    const res = await api.post('/message', { receiverId });
    return res.data;
  },

  markAsRead: async (conversationId: string) => {
    const res = await api.post(`/message/${conversationId}/read`);
    return res.data;
  },

  getLinkPreview: async (url: string) => {
    const res = await api.get('/message/link-preview', { params: { url } });
    return res.data;
  }
};

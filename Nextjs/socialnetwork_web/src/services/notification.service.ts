import api from '../lib/axios';

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notification');
    return res.data;
  },

  markAllRead: async () => {
    const res = await api.post('/notification/mark-read');
    return res.data;
  }
};

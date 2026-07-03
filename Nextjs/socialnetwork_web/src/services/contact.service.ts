import api from '../lib/axios';

export const contactService = {
  sendRequest: async (receiverId: string) => {
    const res = await api.post('/contact/request', { receiverId });
    return res.data;
  },

  getRelationship: async (userId: string) => {
    const res = await api.get(`/contact/relationship/${userId}`);
    return res.data;
  },

  cancelRequest: async (requestId: string) => {
    const res = await api.post('/contact/cancel', { requestId });
    return res.data;
  },

  acceptRequest: async (requestId: string) => {
    const res = await api.post('/contact/accept', { requestId });
    return res.data;
  },

  rejectRequest: async (requestId: string) => {
    const res = await api.post('/contact/reject', { requestId });
    return res.data;
  },

  removeFriend: async (friendId: string) => {
    const res = await api.post('/contact/remove', { friendId });
    return res.data;
  },

  getFriends: async () => {
    const res = await api.get('/contact/friends');
    return res.data;
  },

  getRequests: async () => {
    const res = await api.get('/contact/requests');
    return res.data;
  }
};

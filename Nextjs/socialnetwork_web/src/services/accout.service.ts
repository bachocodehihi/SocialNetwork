import api from '../lib/axios';

export const accountService = {
  getProfile: async () => {
    const res = await api.get('/account/profile');
    return res.data;
  },

  addAddress: async (address: string) => {
    const res = await api.post('/account/add-address', { address });
    return res.data;
  },

  addPhone: async (phone: string) => {
    const res = await api.post('/account/add-phone', { phone });
    return res.data;
  },

  addJob: async (job: string) => {
    const res = await api.post('/account/add-job', { job });
    return res.data;
  },

  addNationality: async (nationality: string) => {
    const res = await api.post('/account/add-nationality', { nationality });
    return res.data;
  },

  getActivity: async () => {
    const res = await api.get('/account/activity');
    return res.data;
  },

  requestDeleteAccount: async () => {
    const res = await api.post('/account/delete');
    return res.data;
  },

  cancelDeleteAccount: async () => {
    const res = await api.post('/account/cancel-delete');
    return res.data;
  },

  getPrivacy: async () => {
    const res = await api.get('/account/privacy');
    return res.data;
  },

  updatePrivacy: async (settings: Record<string, boolean>) => {
    const res = await api.put('/account/privacy', settings);
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await api.get(`/account/user/${id}`);
    return res.data;
  },
};


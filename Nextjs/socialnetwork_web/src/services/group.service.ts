import api from '../lib/axios';

export const groupService = {
  getGroups: async () => {
    const res = await api.get('/groups');
    return res.data;
  },

  getGroupByInviteCode: async (inviteCode: string) => {
    const res = await api.get(`/groups/invite/${inviteCode}`);
    return res.data;
  },

  joinByInviteCode: async (inviteCode: string) => {
    const res = await api.post('/groups/join-qr', { inviteCode });
    return res.data;
  }
};

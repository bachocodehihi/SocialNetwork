import api from '../lib/axios';

export const groupService = {
  getGroupByInviteCode: async (inviteCode: string) => {
    const res = await api.get(`/group/invite/${inviteCode}`);
    return res.data;
  },

  joinByInviteCode: async (inviteCode: string) => {
    const res = await api.post('/group/join-qr', { inviteCode });
    return res.data;
  }
};

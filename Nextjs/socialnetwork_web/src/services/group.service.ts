import api from '../lib/axios';

export const groupService = {
  getGroupByInviteCode: async (inviteCode: string) => {
    const res = await api.get(`/groups/invite/${inviteCode}`);
    return res.data;
  },

  joinByInviteCode: async (inviteCode: string) => {
    const res = await api.post('/groups/join-qr', { inviteCode });
    return res.data;
  }
};

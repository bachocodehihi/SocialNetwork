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
  },

  getGroupById: async (groupId: string) => {
    const res = await api.get(`/groups/${groupId}`);
    return res.data;
  },

  updateGroup: async (groupId: string, data: any) => {
    const res = await api.put(`/groups/${groupId}`, data);
    return res.data;
  },

  deleteGroup: async (groupId: string) => {
    const res = await api.delete(`/groups/${groupId}`);
    return res.data;
  },

  addMembers: async (groupId: string, members: string[]) => {
    const res = await api.post(`/groups/${groupId}/members`, { members });
    return res.data;
  },

  removeMember: async (groupId: string, memberId: string) => {
    const res = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return res.data;
  },

  inviteToGroup: async (groupId: string, inviteeId: string) => {
    const res = await api.post(`/groups/${groupId}/invite`, { inviteeId });
    return res.data;
  },

  searchGroups: async (q: string) => {
    const res = await api.get('/groups/search', { params: { q } });
    return res.data;
  },

  joinGroup: async (groupId: string) => {
    const res = await api.post(`/groups/${groupId}/join`);
    return res.data;
  },

  getJoinRequests: async (groupId: string) => {
    const res = await api.get(`/groups/${groupId}/join-requests`);
    return res.data;
  },

  handleJoinRequest: async (groupId: string, requestUserId: string, action: 'approve' | 'reject') => {
    const res = await api.post(`/groups/${groupId}/join-requests/${requestUserId}`, { action });
    return res.data;
  },

  getPendingPosts: async (groupId: string) => {
    const res = await api.get(`/groups/${groupId}/pending-posts`);
    return res.data;
  },

  handlePendingPost: async (groupId: string, postId: string, action: 'approve' | 'reject') => {
    const res = await api.post(`/groups/${groupId}/pending-posts/${postId}`, { action });
    return res.data;
  }
};

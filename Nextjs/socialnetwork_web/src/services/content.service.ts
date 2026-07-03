import api from '../lib/axios';

export const contentService = {
  getFeed: async () => {
    const res = await api.get('/content');
    return res.data;
  },

  likePost: async (postId: string) => {
    const res = await api.put(`/content/${postId}/like`);
    return res.data;
  },

  commentPost: async (postId: string, content: string) => {
    const res = await api.post(`/content/${postId}/comment`, { content });
    return res.data;
  },

  likeComment: async (commentId: string) => {
    const res = await api.put(`/content/comment/${commentId}/like`);
    return res.data;
  },

  likeReply: async (commentId: string, replyId: string) => {
    const res = await api.put(`/content/comment/${commentId}/reply/${replyId}/like`);
    return res.data;
  },

  replyComment: async (postId: string, commentId: string, content: string) => {
    const res = await api.post(`/content/${postId}/comment/${commentId}/reply`, { content });
    return res.data;
  },

  createPost: async (formData: FormData) => {
    const res = await api.post('/content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getUserPosts: async (userId: string) => {
    const res = await api.get(`/content/user/${userId}`);
    return res.data;
  },
};


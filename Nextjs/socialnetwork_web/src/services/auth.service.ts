import api from '../lib/axios';

export const authService = {
  generateQR: async () => {
    const res = await api.get('/auth/qr/generate');
    return res.data;
  },

  checkQRStatus: async (sessionId: string) => {
    const res = await api.get(`/auth/qr/status/${sessionId}`);
    return res.data;
  },

  confirmQRLogin: async (sessionId: string, token: string) => {
    const res = await api.post('/auth/qr/confirm', { sessionId, token });
    return res.data;
  },

  checkEmail: async (email: string) => {
    const res = await api.post('/auth/check-email', { email });
    return res.data;
  },

  sendOtp: async (email: string) => {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  forgotPassword: async (email: string, newPassword: string) => {
    const res = await api.post('/auth/forgot-password', { email, newPassword });
    return res.data;
  },

  googleLogin: async (idToken: string) => {
    const res = await api.post('/auth/google-login', { idToken });
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/account/profile');
    return res.data;
  },

  searchUsers: async (q: string) => {
    const res = await api.get(`/account/search?q=${encodeURIComponent(q)}`);
    return res.data;
  }
};

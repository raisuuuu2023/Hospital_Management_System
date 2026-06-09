import axiosInstance from '../utils/axiosInstance';

export const loginUser = (data) => axiosInstance.post('/api/auth/login', data);
export const registerUser = (data) => axiosInstance.post('/api/auth/register', data);
import axiosInstance from '../utils/axiosInstance';

export const getPatientProfile = () => axiosInstance.get('/api/patients/profile');
export const updatePatientProfile = (data) => axiosInstance.put('/api/patients/profile', data);
export const getDoctors = () => axiosInstance.get('/api/patients/doctors');
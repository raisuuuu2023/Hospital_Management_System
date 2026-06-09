import axiosInstance from '../utils/axiosInstance';

export const getAllDoctors = () => axiosInstance.get('/api/doctors/profile');
export const updateDoctorProfile = (data) => axiosInstance.put('/api/doctors/profile', data);
export const createPrescription = (data) => axiosInstance.post('/api/doctors/prescriptions', data);
export const getPrescription = (id) => axiosInstance.get(`/api/doctors/prescriptions/${id}`);
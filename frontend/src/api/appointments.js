import axiosInstance from '../utils/axiosInstance';

export const bookAppointment = (data) => axiosInstance.post('/api/appointments', data);
export const getMyAppointments = () => axiosInstance.get('/api/appointments/my');
export const getDoctorAppointments = () => axiosInstance.get('/api/appointments/doctor');
export const updateAppointmentStatus = (id, status) => axiosInstance.patch(`/api/appointments/${id}/status`, { status });
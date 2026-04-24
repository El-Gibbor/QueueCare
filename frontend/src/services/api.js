import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const client = axios.create({ baseURL: BASE_URL });

// Attach JWT to every outbound request if one is in localStorage.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('qc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the response body and normalise the error message shape the backend uses.
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error ?? err.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// --- Auth ---
export const register = (body) => client.post('/api/auth/register', body);
export const login = (body) => client.post('/api/auth/login', body);

// --- Appointments ---
export const getAppointments = () => client.get('/api/appointments');
export const getAppointmentById = (id) => client.get(`/api/appointments/${id}`);
export const createAppointment = (body) => client.post('/api/appointments', body);
export const updateAppointment = (id, body) => client.patch(`/api/appointments/${id}`, body);
export const cancelAppointment = (id) => client.delete(`/api/appointments/${id}`);

// --- Queue ---
export const getTodaysQueue = () => client.get('/api/queue/today');
export const markServed = (id) => client.patch(`/api/appointments/${id}/serve`);

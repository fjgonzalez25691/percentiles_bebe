import axios from 'axios';

const API_URL = '/api/';  // Usamos path relativo para aprovechar el proxy de Vite

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios para bebés
export const babyService = {
  getAll: () => api.get('babies/'),
  getById: (id) => api.get(`babies/${id}/`),
  create: (data) => api.post('babies/', data),
  update: (id, data) => api.put(`babies/${id}/`, data),
  delete: (id) => api.delete(`babies/${id}/`),
};

// Servicios para mediciones
export const measurementService = {
  getAll: () => api.get('measurements/'),
  getByBaby: (babyId) => api.get(`measurements/?baby=${babyId}`),
  create: (data) => api.post('measurements/', data),
  update: (id, data) => api.put(`measurements/${id}/`, data),
  delete: (id) => api.delete(`measurements/${id}/`),
};

// Servicio para gráficos de crecimiento
export const growthChartService = {
  getData: (babyId) => api.get(`growth-chart/${babyId}/`),
};

export default api;
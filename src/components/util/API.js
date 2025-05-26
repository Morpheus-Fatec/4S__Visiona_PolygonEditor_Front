import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const usuarioJson = localStorage.getItem("usuario");

    if (!usuarioJson) {
      return config;
    }

    try {
      const usuario = JSON.parse(usuarioJson);
      const token = usuario.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

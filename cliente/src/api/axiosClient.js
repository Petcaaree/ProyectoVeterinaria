import axios from "axios";

const VITE_API = import.meta.env.VITE_API_URL;
if (!VITE_API) {
  console.error('VITE_API_URL no está configurada. Configúrala en el archivo .env');
}
export const API_URL = `${VITE_API}/petcare`;

// Interceptor: adjunta el token JWT a cada request si existe en localStorage
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: si el server responde 401, intenta renovar con refresh token antes de cerrar sesion
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // No intentar refresh en rutas de login/signin/refresh
        if (error.response?.status === 401
            && !originalRequest?.url?.includes('/login/')
            && !originalRequest?.url?.includes('/signin/')
            && !originalRequest?.url?.includes('/auth/refresh')
            && !originalRequest._retry) {

            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                if (isRefreshing) {
                    // Si ya hay un refresh en curso, encolar este request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    }).catch(err => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const { data } = await axios.post(`${VITE_API}/petcare/auth/refresh`, { refreshToken });
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    processQueue(null, data.token);
                    return axios(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    // Refresh fallo: limpiar sesion
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('usuario');
                    localStorage.removeItem('tipoUsuario');
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // No hay refresh token: limpiar sesion
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            localStorage.removeItem('tipoUsuario');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axios;

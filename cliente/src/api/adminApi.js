import axios, { API_URL } from './axiosClient.js';

// ─── Auth ────────────────────────────────────────────
export const loginAdmin = (datos) => {
    return axios.post(`${API_URL}/login/admin`, datos);
};

// ─── Metricas ────────────────────────────────────────
export const getMetricas = () => {
    return axios.get(`${API_URL}/admin/metricas`);
};

// ─── Usuarios ────────────────────────────────────────
export const getUsuarios = (tipo, page = 1, limit = 10, search = '') => {
    const params = { page, limit };
    if (search) params.search = search;
    return axios.get(`${API_URL}/admin/usuarios/${tipo}`, { params });
};

export const suspenderUsuario = (tipo, id, motivo) => {
    return axios.put(`${API_URL}/admin/usuarios/${tipo}/${id}/suspender`, { motivo });
};

export const reactivarUsuario = (tipo, id) => {
    return axios.put(`${API_URL}/admin/usuarios/${tipo}/${id}/reactivar`);
};

export const eliminarUsuario = (tipo, id) => {
    return axios.delete(`${API_URL}/admin/usuarios/${tipo}/${id}`);
};

// ─── Servicios ───────────────────────────────────────
export const getServicios = (tipo, page = 1, limit = 10, estado = '') => {
    const params = { page, limit };
    if (estado) params.estado = estado;
    return axios.get(`${API_URL}/admin/servicios/${tipo}`, { params });
};

export const moderarServicio = (tipo, id, accion) => {
    return axios.put(`${API_URL}/admin/servicios/${tipo}/${id}/moderar`, { accion });
};

// ─── Configuracion ───────────────────────────────────
export const getConfiguracion = () => {
    return axios.get(`${API_URL}/admin/configuracion`);
};

export const updateConfiguracion = (datos) => {
    return axios.put(`${API_URL}/admin/configuracion`, datos);
};

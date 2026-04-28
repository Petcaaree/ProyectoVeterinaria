import axios, { API_URL } from './axiosClient.js';

export const getMpStatus = () => {
    return axios.get(`${API_URL}/proveedor/mp-status`);
};

export const getMpAuthUrl = () => {
    return axios.get(`${API_URL}/proveedor/conectar-mp`);
};

export const desconectarMp = () => {
    return axios.delete(`${API_URL}/proveedor/desconectar-mp`);
};

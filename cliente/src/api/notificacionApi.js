import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";

export const obtenerNotificacionesNoLeidas = async (usuarioId, leida, tipoUsuario, pageNumber) => {
    try {
        const response = await axios.get(`${API_URL}/${tipoUsuario}/${usuarioId}/notificaciones/${leida}`, {
            params: {
                page: pageNumber
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener notificaciones no leídas:", error);
        throw error;
    }
};

export const obtenerNotificaciones = async (usuarioId, tipoUsuario, pageNumber) => {
    try {
        const response = await axios.get(`${API_URL}/${tipoUsuario}/${usuarioId}/notificaciones`, {
            params: {
                page: pageNumber
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        throw error;
    }
};

export const marcarLeidaCliente = async (usuarioId, notificacionId) => {
    try {
        await axios.put(`${API_URL}/cliente/${usuarioId}/notificaciones/${notificacionId}`)
    } catch(error) {
        console.error("Error al marcar la notificación como leída");
        throw error;
    }
}

export const marcarLeidaProveedor = async (usuarioId, notificacionId, tipoProveedor) => {
    try {
        await axios.put(`${API_URL}/${tipoProveedor}/${usuarioId}/notificaciones/${notificacionId}`);
    } catch (error) {
        console.error("Error al marcar la notificación como leída");
        throw error;
    }
}

export const marcarTodasLeidasProveedor = async (usuarioId, tipoProveedor) => {
    try {
        await axios.put(`${API_URL}/${tipoProveedor}/${usuarioId}/marcarNotificacionLeidas`);
    } catch (error) {
        console.error("Error al marcar todas las notificaciones como leídas del proveedor");
        throw error;
    }
};

export const marcarTodasLeidasCliente = async (usuarioId) => {
    try {
        await axios.put(`${API_URL}/cliente/${usuarioId}/marcarNotificacionLeidas`);
    } catch (error) {
        console.error("Error al marcar todas las notificaciones como leídas del cliente");
        throw error;
    }
};

export const obtenerContadorNotificacionesNoLeidas = async (usuarioId, tipoUsuario) => {
    try {
        let endpoint;
        if (tipoUsuario === 'cliente') {
            endpoint = `${API_URL}/cliente/${usuarioId}/notificaciones/contador`;
        } else {
            endpoint = `${API_URL}/${tipoUsuario}/${usuarioId}/notificaciones/contador`;
        }

        const response = await axios.get(endpoint);
        return response.data.contador;
    } catch (error) {
        console.error("Error al obtener contador de notificaciones no leídas:", error);
        throw error;
    }
};

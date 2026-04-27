import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";
import type { EstadoVerificacionResponse, PayloadVerificacion, VerificacionResponse } from "../types/verificacion";

export const crearVerificacion = async (payload: PayloadVerificacion): Promise<VerificacionResponse> => {
    try {
        const response = await axios.post(`${API_URL}/veterinaria/verificacion`, payload);
        return response.data;
    } catch (error) {
        console.error('Error al crear verificación:', error);
        throw error;
    }
};

export const consultarEstadoVerificacion = async (): Promise<EstadoVerificacionResponse> => {
    try {
        const response = await axios.get(`${API_URL}/veterinaria/verificacion/estado`);
        return response.data;
    } catch (error) {
        console.error('Error al consultar estado de verificación:', error);
        throw error;
    }
};

export const reenviarVerificacion = async (payload: Partial<PayloadVerificacion>): Promise<VerificacionResponse> => {
    try {
        const response = await axios.put(`${API_URL}/veterinaria/verificacion/reenviar`, payload);
        return response.data;
    } catch (error) {
        console.error('Error al reenviar verificación:', error);
        throw error;
    }
};

import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";
import type { EstadoVerificacionResponse, PayloadVerificacion, VerificacionResponse } from "../types/verificacion";

export const crearVerificacion = async (payload: PayloadVerificacion): Promise<VerificacionResponse> => {
    const response = await axios.post(`${API_URL}/veterinaria/verificacion`, payload);
    return response.data;
};

export const consultarEstadoVerificacion = async (): Promise<EstadoVerificacionResponse> => {
    const response = await axios.get(`${API_URL}/veterinaria/verificacion/estado`);
    return response.data;
};

export const reenviarVerificacion = async (payload: Partial<PayloadVerificacion>): Promise<VerificacionResponse> => {
    const response = await axios.put(`${API_URL}/veterinaria/verificacion/reenviar`, payload);
    return response.data;
};

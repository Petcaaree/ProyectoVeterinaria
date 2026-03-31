import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";

export const registrarMascota = async (clienteId, mascotaData) => {
    try {
        const response = await axios.post(`${API_URL}/cliente/${clienteId}/mascota`, {
            "nombre": mascotaData.nombre,
            "tipo": mascotaData.tipo,
            "raza": mascotaData.raza? mascotaData.raza : null,
            "edad": mascotaData.edad ? parseInt(mascotaData.edad) : null,
            "peso": mascotaData.peso ? parseFloat(mascotaData.peso) : null,
            "fotos": mascotaData.fotos
        });
        return response.data;
    } catch (error) {
        console.error("Error al registrar la mascota:", error);
        throw error;
    }
}

export const obtenerMascotas = async (clienteId) => {
    try {
        const response = await axios.get(`${API_URL}/cliente/${clienteId}/mismascotas`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las mascotas:", error);
        throw error;
    }
};

export const eliminarMascota = async (usuarioId, mascotaId) => {
    try {
        const response = await axios.delete(`${API_URL}/cliente/${usuarioId}/mascota/${mascotaId}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar la mascota:", error);
        throw error;
    }
};

import axios from "./axiosClient.js";
import qs from "qs";
import { API_URL } from "./axiosClient.js";

export const getAlojamientos = async (pageNumber, filtros) => {
    try {
        const filtrosLimpiados = Object.fromEntries(
            Object.entries(filtros).filter(([_, v]) => {
                if (Array.isArray(v)) return v.length > 0;
                return v !== null && v !== undefined && v !== '';
            })
        );

        const response = await axios.get(`${API_URL}/alojamientos`, {
            params: {
                page: pageNumber,
                ...filtrosLimpiados
            },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getDestinos = async (pageNumber) => {
    try {
        const response = await axios.get(`${API_URL}/ciudades`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getAlojamientosAnfitrion = async (id, page=1) => {
    try {
        const response = await axios.get(`${API_URL}/alojamientos/anfitrion/${id}`, {
            params: {
                "page": page,
                "limit": 3
            }
        })
        return response
    } catch (error) {
        console.error("Error al obtener los alojamientos del anfitrión:", error);
        throw error;
    }
}

export const crearAlojamiento = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/alojamientos`, {
            "anfitrion": data.anfitrion,
            "nombre": data.nombre,
            "descripcion": data.descripcion,
            "precioPorNoche": data.precioPorNoche,
            "moneda": data.moneda,
            "horarioCheckIn": data.horarioCheckIn,
            "horarioCheckOut": data.horarioCheckOut,
            "direccion": data.direccion,
            "cantHuespedesMax": data.cantHuespedesMax,
            "caracteristicas": data.caracteristicas,
            "fotos": data.fotos
        })
        return response.data
    } catch(error) {
        console.error("Error al crear el alojamiento:", error);
        throw error;
    }
}

export const getNotificacionesHuesped = async (usuarioId, leida, pageNumber) => {
    try {
        const response = await axios.get(`${API_URL}/huesped/${usuarioId}/notificaciones/${leida}`, {
            params: {
                "page": pageNumber,
                "limit": 4
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener las notificaciones:", error);
        throw error;
    }
};

export const getNotificacionesAnfitrion = async (usuarioId, leida, pageNumber) => {
    try {
        const response = await axios.get(`${API_URL}/anfitrion/${usuarioId}/notificaciones/${leida}`, {
            params: {
                "page": pageNumber,
                "limit": 4
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener las notificaciones:", error);
        throw error;
    }
};

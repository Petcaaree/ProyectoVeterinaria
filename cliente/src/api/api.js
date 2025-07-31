import axios from "axios";
import qs from "qs";

const VITE_API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = `${VITE_API}/petcare`;

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
        console.log("Algo salio mal");
        throw error;
    }
};

export const getDestinos = async (pageNumber) => {
    try {

        const response = await axios.get(`${API_URL}/ciudades`);
        return response;
    } catch (error) {
        console.log("Algo salio mal");
        throw error;

    }
};

export const loginUsuario = async (datos, tipo) => {
    try {
        const response = await axios.post(`${API_URL}/login/${tipo}`, {
            "email": datos.email,
            "contrasenia": datos.contrasenia,
        });
        return response;
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        throw error;
    }
};

export const signinUsuario = async (datos, tipo) => {
    try {
        const response = await axios.post(`${API_URL}/signin/${tipo}`, {
            "nombreUsuario": datos.nombreUsuario,
            "email": datos.email,
            "contrasenia": datos.contrasenia,
            "telefono": datos.telefono,
            "direccion": datos.direccion,
        });
        return response;
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        throw error;
    }
};

export const reservarAlojamiento = async (datos) => {
    try {
        const response = await axios.post(`${API_URL}/reservar`, {
            "reservador": datos.reservador,
            "cantHuespedes": datos.cantHuespedes,
            "alojamiento": datos.alojamiento,
            "rangoFechas": datos.rangoFechas,
        });
        return response;
    } catch (error) {
        console.error("Error al crear la reserva:", error);
        throw error;
    }
};

export const getReservasHuesped = async (usuarioId, page) => {
    try {
        const response = await axios.get(`${API_URL}/reservas/${usuarioId}`, {
            params: { 
                "page": page,
                "limit": 2
            }
        })

        console.log(response)
        return response
    } catch (error) {
        console.error("Error al obtener las reservas del huesped:", error);
        throw error;
    }
}

export const getAlojamientosAnfitrion = async (id, page=1) => {
    try {
        const response = await axios.get(`${API_URL}/alojamientos/anfitrion/${id}`, {
            params: { 
                "page": page,
                "limit": 3
            }
        })

        console.log(response.data)
        return response
    } catch (error) {
        console.error("Error al obtener los alojamientos del anfitrión:", error);
        throw error;
    }
}

export const getReservasAnfitrion = async (anfitrionId, page) => {
    try {
        const response = await axios.get(`${API_URL}/reservas/anfitrion/${anfitrionId}`, {
            params: { 
                "page": page,
                "limit": 2
            }
        })

        return response
    } catch (error) {
        console.error("Error al obtener las reservas del huesped:", error);
        throw error;
    }
}

export const confirmarReserva = async (anfitrionId, reservaId) => {
    try {
        await axios.put(`${API_URL}/anfitrion/${anfitrionId}/confirmar/${reservaId}`);
    } catch (error) {
        throw error;
    }
}

export const cancelarReserva = async (huespedId, reservaId) => {
    try {
        await axios.put(`${API_URL}/huesped/${huespedId}/cancelar/${reservaId}`);
    } catch (error) {
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

export const marcarLeidaHuesped = async (usuarioId, notificacionId) => {
    try {
        await axios.put(`${API_URL}/huesped/${usuarioId}/notificaciones/${notificacionId}`)
    } catch(error) {
        console.error("Error al marcar la notificación como leída");
        throw error;
    }
}

export const marcarLeidaAnfitrion = async (usuarioId, notificacionId) => {
    try {
        await axios.put(`${API_URL}/anfitrion/${usuarioId}/notificaciones/${notificacionId}`);
    } catch (error) {
        console.error("Error al marcar la notificación como leída");
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
import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";

export const createReserva = async (datos) => {
    try {
        const body = {
            clienteId: datos.clienteId,
            serviciOfrecido: datos.serviciOfrecido,
            servicioReservadoId: datos.servicioReservadoId,
            IdMascota: datos.mascota,
            rangoFechas: {
                fechaInicio: datos.rangoFechas.fechaInicio,
                fechaFin: datos.rangoFechas.fechaFin
            },
            notaAdicional: datos.notaAdicional,
            nombreDeContacto: datos.nombreDeContacto,
            telefonoContacto: datos.telefonoContacto,
            emailContacto: datos.emailContacto
        };
        if (datos.serviciOfrecido !== "ServicioCuidador" && datos.horario) {
            body.horario = datos.horario;
        }
        const response = await axios.post(`${API_URL}/reservar`, body);
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
        return response
    } catch (error) {
        console.error("Error al obtener las reservas del huesped:", error);
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

export const getReservasPorEstado = async (userId, userType, estado, page) => {
    try {
        let tipoUsuario;
        if (userType === 'cliente'){
            tipoUsuario = 'cliente';
        } else {
            tipoUsuario = 'proveedor';
        }
        const response = await axios.get(`${API_URL}/reservas/${tipoUsuario}/${userId}/${estado}`, {
            params: { page }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener todas las reservas:", error);
        throw error;
    }
};

export const getTodasReservas = async (userId, userType, estado, page) => {
    try {
        let tipoUsuario;
        if (userType === 'cliente'){
            tipoUsuario = 'cliente';
        } else {
            tipoUsuario = 'proveedor';
        }
        const response = await axios.get(`${API_URL}/reservas/${tipoUsuario}/${userId}/${estado}`, {
            params: { page }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener todas las reservas:", error);
        throw error;
    }
};

export const cambiarEstadoReserva = async (idUsuario, reservaId, estado) => {
    try {
        const response = await axios.put(`${API_URL}/usuario/${idUsuario}/reserva/${reservaId}/${estado}`);
        return response.data;
    } catch (error) {
        console.error("Error al cambiar el estado de la reserva:", error);
        throw error;
    }
};

// Reintentar la creación de preferencia de pago para una reserva existente
export const reintentarPago = async (reservaId) => {
    try {
        const response = await axios.post(`${API_URL}/pagos/reintentar/${reservaId}`);
        return response.data;
    } catch (error) {
        console.error("Error al reintentar el pago:", error);
        throw error;
    }
};

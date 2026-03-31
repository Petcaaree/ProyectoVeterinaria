import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";

export const loginUsuario = async (datos, tipo) => {
    try {
        const response = await axios.post(`${API_URL}/login/${tipo}`, {
            "email": datos.email,
            "contrasenia": datos.contrasenia,
        });
        return response;
    } catch (error) {
        console.error("Error al obtener el usuario:", error);

        if (error.response?.status === 404) {
            const errorMessage = error.response.data?.message || "Email o contraseña incorrectos";
            throw new Error(errorMessage);
        }

        if (error.response?.status === 400) {
            const errorMessage = error.response.data?.message || "Datos de login inválidos";
            throw new Error(errorMessage);
        }

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
        }

        throw new Error("Error al iniciar sesión. Intenta nuevamente.");
    }
};

export const signinUsuario = async (datos, tipo) => {
    try {
        const requestData = {
            "nombreUsuario": datos.nombreUsuario,
            "email": datos.email,
            "contrasenia": datos.contrasenia,
            "telefono": datos.telefono,
            "direccion": datos.direccion,
        };

        if (tipo === 'veterinaria' && datos.nombreClinica) {
            requestData.nombreClinica = datos.nombreClinica;
        }

        const response = await axios.post(`${API_URL}/signin/${tipo}`, requestData);
        return response;
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        throw error;
    }
};

export const solicitarResetPassword = async (email, tipoUsuario) => {
    try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, {
            email,
            tipoUsuario
        });
        return response.data;
    } catch (error) {
        console.error("Error al solicitar reset de contraseña:", error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Error al procesar la solicitud. Intentá nuevamente.");
    }
};

export const resetearPassword = async (token, contrasenia) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, {
            token,
            contrasenia
        });
        return response.data;
    } catch (error) {
        console.error("Error al resetear contraseña:", error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Error al restablecer la contraseña. Intentá nuevamente.");
    }
};

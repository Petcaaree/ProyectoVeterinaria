import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";

export const crearResena = async ({ reservaId, puntuacion, comentario }) => {
  const response = await axios.post(`${API_URL}/resena`, {
    reservaId,
    puntuacion,
    comentario: comentario || "",
  });
  return response.data;
};

export const getResenasByServicio = async (servicioId, { page = 1, limit = 10 } = {}) => {
  const response = await axios.get(`${API_URL}/resenas/servicio/${servicioId}`, {
    params: { page, limit },
  });
  return response.data;
};

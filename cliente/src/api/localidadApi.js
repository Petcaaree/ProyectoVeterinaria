import axios from "./axiosClient.js";
import { API_URL } from "./axiosClient.js";

export const getLocalidades = async () => {
    try {
        const response = await axios.get(`${API_URL}/localidades`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener localidades:", error);
        throw error;
    }
};

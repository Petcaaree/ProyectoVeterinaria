import axios from "./axiosClient.js";
import qs from "qs";
import { API_URL } from "./axiosClient.js";

export const crearServicioVeterinaria = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/servicioVet`, {
            "idVeterinaria": data.idVeterinaria,
            "nombreServicio": data.nombreServicio,
            "tipoServicio": data.tipoServicio,
            "duracionMinutos": data.duracionMinutos,
            "precio": data.precio,
            "descripcion": data.descripcion,
            "nombreClinica": data.nombreClinica,
            "emailClinica": data.emailClinica,
            "telefonoClinica": data.telefonoClinica,
            "diasDisponibles": data.diasDisponibles,
            "horariosDisponibles": data.horariosDisponibles,
            "mascotasAceptadas": data.mascotasAceptadas,
            "direccion": {
              "calle": data.direccion.calle,
              "altura": data.direccion.altura,
              "localidad": {
                "nombre": data.direccion.localidad.nombre,
                "ciudad": {
                  "nombre": data.direccion.localidad.ciudad.nombre
                }
              }
            }
          }
        );
        return response.data
   } catch(error) {
        console.error("Error al crear el servicio:", error);
        throw error;
    }
}

export const crearServicioPaseador = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/servicioPaseadores`, {
                "idPaseador": data.idPaseador,
                "nombreServicio": data.nombreServicio,
                "duracionMinutos": data.duracionMinutos,
                "precio": data.precio,
                "descripcion": data.descripcion,
                "nombreContacto": data.nombreContacto,
                "emailContacto": data.emailContacto,
                "telefonoContacto": data.telefonoContacto,
                "diasDisponibles": data.diasDisponibles,
                "horariosDisponibles": data.horariosDisponibles,
                "direccion": {
                    "calle": data.direccion.calle,
                    "altura": data.direccion.altura,
                    "localidad": {
                        "nombre": data.direccion.localidad.nombre,
                        "ciudad": {
                            "nombre": data.direccion.localidad.ciudad.nombre
                        }
                    }
                },
                "maxPerros": data.maxPerros
        });
        return response.data
   } catch(error) {
        console.error("Error al crear el servicio:", error);
        throw error;
    }
}

export const crearServicioCuidador = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/servicioCuidador`, {
            "idCuidador": data.idCuidador,
            "nombreServicio": data.nombreServicio,
            "precio": data.precio,
            "descripcion": data.descripcion,
            "nombreContacto": data.nombreContacto,
            "emailContacto": data.emailContacto,
            "telefonoContacto": data.telefonoContacto,
            "diasDisponibles": data.diasDisponibles,
            "mascotasAceptadas": data.mascotasAceptadas,
            "direccion": {
              "calle": data.direccion.calle,
              "altura": data.direccion.altura,
              "localidad": {
                "nombre": data.direccion.localidad.nombre,
                "ciudad": {
                  "nombre": data.direccion.localidad.ciudad.nombre
                }
              }
            }
        });
        return response.data
   } catch(error) {
        console.error("Error al crear el servicio:", error);
        throw error;
    }
}

export const getServiciosVeterinariaByUsuario = async (usuarioId, page, estado) => {
    try {
        const response = await axios.get(`${API_URL}/veterinaria/${usuarioId}/serviciosVeterinaria/${estado}`, {
            params: {
                "page": page,
                "limit": 3
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener servicios de veterinaria:", error);
        throw error;
    }
};

export const getServiciosPaseadorByUsuario = async (usuarioId, page, estado) => {
    try {
        const response = await axios.get(`${API_URL}/paseador/${usuarioId}/serviciosPaseador/${estado}`, {
            params: {
                "page": page,
                "limit": 3
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener servicios de paseador:", error);
        throw error;
    }
};

export const getServiciosCuidadorByUsuario = async (usuarioId, page, estado) => {
    try {
        const response = await axios.get(`${API_URL}/cuidador/${usuarioId}/serviciosCuidador/${estado}`, {
            params: {
                "page": page,
                "limit": 3
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener servicios de cuidador:", error);
        throw error;
    }
};

export const cambiarEstadoServicio = async (serviceId, estado, tipoUsuario) => {
    const usuario = tipoUsuario === 'servicioCuidador' ? 'cuidador' : tipoUsuario === 'servicioPaseador' ? 'paseador' : 'veterinaria';
    try {
        await axios.put(`${API_URL}/${usuario}/${serviceId}/${tipoUsuario}/${estado}`);
    } catch (error) {
        console.error("Error al cambiar el estado del servicio:", error);
        throw error;
    }
};

const limpiarFiltros = (filtros) => Object.fromEntries(
    Object.entries(filtros).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== null && v !== undefined && v !== '';
    })
);

export const obtenerServiciosCuidadores = async (pageNumber, filtros) => {
    try {
        const response = await axios.get(`${API_URL}/serviciosCuidadores`, {
            params: {
                page: pageNumber,
                ...limpiarFiltros(filtros)
            },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener servicios de cuidadores:", error);
        throw error;
    }
};

export const obtenerServiciosPaseadores = async (pageNumber, filtros) => {
    try {
        const response = await axios.get(`${API_URL}/serviciosPaseadores`, {
            params: {
                page: pageNumber,
                ...limpiarFiltros(filtros)
            },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener servicios de paseadores:", error);
        throw error;
    }
};

export const obtenerServiciosVeterinarias = async (pageNumber, filtros) => {
    try {
        const response = await axios.get(`${API_URL}/serviciosVet`, {
            params: {
                page: pageNumber,
                ...limpiarFiltros(filtros)
            },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener servicios de veterinarias:", error);
        throw error;
    }
};

export const obtenerServicioVeterinariaPorId = async (id) => {
    const response = await axios.get(`${API_URL}/serviciosVet/${id}`);
    return response.data;
};

export const obtenerServicioPaseadorPorId = async (id) => {
    const response = await axios.get(`${API_URL}/serviciosPaseadores/${id}`);
    return response.data;
};

export const obtenerServicioCuidadorPorId = async (id) => {
    const response = await axios.get(`${API_URL}/servicioCuidador/${id}`);
    return response.data;
};

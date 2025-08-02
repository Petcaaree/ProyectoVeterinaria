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

export const crearServiciooVeterinaria = async (data) => {
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

        console.log("Servicio creado:", response.data);

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
            }
        });

        console.log("Servicio creado:", response.data);

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

        console.log("Servicio creado:", response.data);

        return response.data
   } catch(error) {
        console.error("Error al crear el servicio:", error);
        throw error;
    }
}

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
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Paseador } from '../models/entidades/Paseador.js';
import { Notificacion } from '../models/entidades/Notificacion.js';
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"
import {ServicioPaseador} from "../models/entidades/ServicioPaseador.js"
import { EstadoServicio } from "../models/entidades/enums/enumEstadoServicio.js"
import { EstadoReserva } from "../models/entidades/enums/EstadoReserva.js"
import mongoose from "mongoose"

export class ServicioPaseadorService {

    constructor(servicioPaseadorRepository, paseadorRepository, ciudadRepository, localidadRepository, reservaRepository) {
        this.servicioPaseadorRepository = servicioPaseadorRepository;
        this.paseadorRepository = paseadorRepository;
        this.ciudadRepository = ciudadRepository;
        this.localidadRepository = localidadRepository;
        this.reservaRepository = reservaRepository;
    }

    async findAll({page = 1, limit = 6}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Buscar paseadores distintos
        /* let paseadores = await this.paseadorRepository.findByPage(pageNum, limit)

        // console.log("Paseadores encontrados:", paseadores.length)

        // Extraer los IDs de los paseadores
        const paseadorIds = paseadores.map(v => v.id)

        // Buscar todos los servicios de estos paseadores
        const todosLosServiciosPorPaseador = await Promise.all(
            paseadorIds.map(async (paseadorId) => {
                return await this.servicioPaseadorRepository.findByPaseadorId(paseadorId);
            })
        );

        // Filtrar solo los paseadores que tienen servicios
        const paseadoresConServicios = [];
        const serviciosValidos = [];

        for (let i = 0; i < paseadorIds.length; i++) {
            const serviciosDePaseador = todosLosServiciosPorPaseador[i];
            if (serviciosDePaseador && serviciosDePaseador.length > 0) {
                paseadoresConServicios.push(paseadorIds[i]);
                serviciosValidos.push(...serviciosDePaseador);
            }
        }

        // Aplanar el array de servicios (solo de paseadores con servicios)
        const todosLosServicios = serviciosValidos
 */

        const todosLosServiciosPorPagina = await this.servicioPaseadorRepository.findByPage(pageNum, limitNum)
        const todosLosServicios = await this.servicioPaseadorRepository.findAll()

        // Obtener paseadores distintos de todos los servicios
        const paseadoresDistintosIds = new Set(todosLosServicios.map(s => s.usuarioProveedor.id))
        const totalPaseadoresDistintos = paseadoresDistintosIds.size

        // Obtener paseadores distintos de los servicios de esta página
        const paseadoresDistintosPagina = new Set(todosLosServiciosPorPagina.map(s => s.usuarioProveedor.id))

        const total = await this.servicioPaseadorRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServiciosPorPagina.map(s => this.toDTO(s))

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: todosLosServicios.length,
            totalPaseadores: totalPaseadoresDistintos,
            paseadoresPagina: paseadoresDistintosPagina.size,
            total_pages: total_pages,
            data: data
        };
    }

    async findByFilters(filtro,{page=1,limit=4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        /* let paseadores = await this.paseadorRepository.findByPage(pageNum, limit)
        const paseadorIds = paseadores.map(v => v.id) */

        let serviciosPaseadores = await this.servicioPaseadorRepository.findByFilters(filtro);

        // Verificar que serviciosPaseadores sea un array válido
        

        let paseadorIds = [];
        for (let i = 0; i < serviciosPaseadores.length; i++) {
            const servicio = serviciosPaseadores[i];
            if (servicio.usuarioProveedor && servicio.usuarioProveedor.id) {
                // Asegurarse de que el ID del paseador esté en formato ObjectId
                if (!mongoose.Types.ObjectId.isValid(servicio.usuarioProveedor.id)) {
                    throw new ValidationError(`El ID de paseador ${servicio.usuarioProveedor.id} no es válido`);
                }
                // Solo agregar si no está ya en el array
                if (!paseadorIds.includes(servicio.usuarioProveedor.id)) {
                    paseadorIds.push(servicio.usuarioProveedor.id);
                }
            }
        }

        //console.log("Paseadores IDs encontrados:", paseadorIds)
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paseadoresPaginasID = paseadorIds.slice(startIndex, endIndex);
       // console.log("Paseadores Paginas ID despues:", paseadoresPaginasID)
        let todosLosServiciosFiltradosDeEstosPaseadores = serviciosPaseadores.filter(s => paseadoresPaginasID.includes(s.usuarioProveedor.id))

        // Calcular totales basándose en los servicios después del filtro por veterinarias distintas
        const total = todosLosServiciosFiltradosDeEstosPaseadores.length;
        const total_pages = Math.ceil(paseadoresPaginasID.length / limitNum);
        
        // Aplicar paginación
       
    
        const data = todosLosServiciosFiltradosDeEstosPaseadores.map(a => this.toDTO(a));

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: total,
            totalPaseadores: paseadoresPaginasID.length ,  // Total real de servicios disponibles
            total_pages: total_pages,
            data: data
        };
    }

        async findById(id) {
        const servicioPaseador = await this.servicioPaseadorRepository.findById(id)
        if(!servicioPaseador) {
            throw new NotFoundError(`Servicio Paseador con id ${id} no encontrado`)
        }
        return this.toDTO(servicioPaseador)
    }

    async findByPaseador(id, {page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let serviciosPaseadores = await this.servicioPaseadorRepository.findByPaseadorId(id);

        const total = serviciosPaseadores.length;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const total_pages = Math.ceil(total / limitNum);

        const data = serviciosPaseadores.slice(startIndex, endIndex).map(a => this.toDTO(a));

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        };
    }

   async create(servicioPaseador) {
        const { idPaseador, nombreServicio, precio, descripcion, duracionMinutos, nombreContacto, emailContacto, telefonoContacto, diasDisponibles, horariosDisponibles, direccion } = servicioPaseador

        if(!idPaseador || !nombreServicio  || !precio || !descripcion || !duracionMinutos || !nombreContacto  || !emailContacto || !telefonoContacto || !diasDisponibles || !horariosDisponibles || !direccion) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const existente = await this.servicioPaseadorRepository.findByName(nombreServicio)

        if(existente) {
            throw new ConflictError(`Servicio Paseador con nombre ${nombreServicio} ya existe`)
        }

        if(!mongoose.Types.ObjectId.isValid(idPaseador)) {
            throw new ValidationError(`El ID de paseador ${idPaseador} no es válido`)
        }

        const existentePaseador = await this.paseadorRepository.findById(idPaseador)

        if(!existentePaseador) {
            throw new NotFoundError(`Paseador con id ${idPaseador} no encontrada`)
        }

        
        // Función auxiliar para comparar direcciones
        const compararDirecciones = (dir1, dir2) => {
            if (!dir1 || !dir2) return false;
            
            return dir1.calle === dir2.calle &&
                   dir1.altura === dir2.altura &&
                   dir1.localidad?.nombre === dir2.localidad?.nombre &&
                   dir1.localidad?.ciudad?.nombre === dir2.localidad?.ciudad?.nombre;
        };
        
        // Verificar que la direccion sea la misma que la del paseador
        if (existentePaseador.direccion && !compararDirecciones(existentePaseador.direccion, direccion)) {
             throw new ValidationError("La dirección del servicio debe coincidir con la del paseador");
        }
        

        // Validar que direccion tenga la estructura esperada
         if(!direccion.calle || !direccion.altura || !direccion.localidad || !direccion.localidad.nombre || !direccion.localidad.ciudad || !direccion.localidad.ciudad.nombre) {
            throw new ValidationError("La direccion debe tener calle, altura, ciudad y localidad completas")
        }

        let ciudadExistente = await this.ciudadRepository.findByName(direccion.localidad.ciudad.nombre)
        if(!ciudadExistente) {
            ciudadExistente = new Ciudad(direccion.localidad.ciudad.nombre)
            ciudadExistente = await this.ciudadRepository.save(ciudadExistente)
        }

        let localidadExistente = await this.localidadRepository.findByName(direccion.localidad.nombre)
        if(!localidadExistente) {
            localidadExistente = new Localidad(direccion.localidad.nombre, ciudadExistente)
            localidadExistente = await this.localidadRepository.save(localidadExistente)
        }

        

        const objectDireccion = new Direccion(direccion.calle, direccion.altura, localidadExistente)

        const nuevoServicioPaseador = new ServicioPaseador(
            existentePaseador,           // usuarioProveedor
            nombreServicio,                 // nombreServicio
            precio,                        // precio
            descripcion,                   // descripcion
            duracionMinutos,               // duracionMinutos
            nombreContacto,                 // nombreContacto
            emailContacto,                  // emailContacto
            telefonoContacto,               // telefonoContacto
            diasDisponibles,               // diasDisponibles
            horariosDisponibles,           // horariosDisponibles
            objectDireccion                 // direccion
        )

        const servicioGuardado = await this.servicioPaseadorRepository.save(nuevoServicioPaseador)

        return this.toDTO(servicioGuardado)
    }

async delete(id) {
        const borrado = await this.servicioPaseadorRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Servicio Paseador con id ${id} no encontrado`);
        }
        return borrado;
    }

    async cambiarEstadoServicioPaseador(id, nuevoEstado) {
        console.log("🔄 Iniciando cambio de estado servicio paseador");
        console.log("ID:", id);
        console.log("Nuevo estado solicitado:", nuevoEstado);
        
        const servicioPaseador = await this.servicioPaseadorRepository.findById(id)
        if(!servicioPaseador) {
            throw new NotFoundError(`Servicio Paseador con id ${id} no encontrado`);
        }

        console.log("Estado actual del servicio:", servicioPaseador.estado);

        if(nuevoEstado === "Activada" ) {
            if(servicioPaseador.estado === EstadoServicio.ACTIVO) {
                throw new ConflictError(`Servicio Paseador con id ${id} ya está activada`);
            }
            servicioPaseador.estado = EstadoServicio.ACTIVO
        } else if(nuevoEstado === "Desactivada") {
            if(servicioPaseador.estado === EstadoServicio.DESACTIVADA) {
                throw new ConflictError(`Servicio Paseador con id ${id} ya está desactivada`);
            }
            
            // Verificar si hay reservas pendientes antes de desactivar
            const reservasDelServicio = await this.reservaRepository.findByServicioReservado(id)
            const reservasPendientes = reservasDelServicio.filter(reserva => 
                reserva.estado === EstadoReserva.PENDIENTE || reserva.estado === EstadoReserva.CONFIRMADA
            )
            
            if(reservasPendientes.length > 0) {
                throw new ConflictError(`No se puede desactivar el servicio. Hay ${reservasPendientes.length} reserva(s) pendiente(s) o confirmada(s)`);
            }
            
            servicioPaseador.estado = EstadoServicio.DESACTIVADA
        }
        
        console.log("Estado después del cambio:", servicioPaseador.estado);
        console.log("Llamando a save...");
        
        const servicioActualizado = await this.servicioPaseadorRepository.save(servicioPaseador)
        
        console.log("Servicio actualizado devuelto por save:", {
            id: servicioActualizado.id,
            estado: servicioActualizado.estado
        });
        
        return this.toDTO(servicioActualizado)
    }

    async findByEstado(estado, paseadorId, { page = 1, limit = 4 }) {
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Math.max(Number(limit), 1), 100);

        const servicios = await this.servicioPaseadorRepository.findByEstadoByPaseador(estado, paseadorId);

        const total = servicios.length;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const total_pages = Math.ceil(total / limitNum);

        const data = servicios.slice(startIndex, endIndex).map(s => this.toDTO(s));

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        };
    }



    toDTO(servicoPaseador) {
        return {
            id: servicoPaseador.id,
            usuarioProveedor: {
                nombre: servicoPaseador.usuarioProveedor.nombreUsuario,
                email: servicoPaseador.usuarioProveedor.email,
            },
            nombreServicio: servicoPaseador.nombreServicio,
            direccion: servicoPaseador.direccion ,
            precio: servicoPaseador.precio,
            descripcion: servicoPaseador.descripcion,   
            duracionMinutos: servicoPaseador.duracionMinutos,
            nombreContacto: servicoPaseador.nombreContacto,
            emailContacto: servicoPaseador.emailContacto,
            telefonoContacto: servicoPaseador.telefonoContacto,
            diasDisponibles: servicoPaseador.diasDisponibles,
            horariosDisponibles: servicoPaseador.horariosDisponibles,
            fechasNoDisponibles: servicoPaseador.fechasNoDisponibles,
            estado: servicoPaseador.estado,
            fechaCreacion: servicoPaseador.fechaCreacion,
            cantidadReservas: servicoPaseador.cantidadReservas
        }
    }
    notificacionToDTO(notificacion) {
        return {
            id: notificacion.id,
            mensaje: notificacion.mensaje,
            fechaAlta: notificacion.fechaAlta,
            fechaLeida: notificacion.fechaLeida
        }
    }

}


 









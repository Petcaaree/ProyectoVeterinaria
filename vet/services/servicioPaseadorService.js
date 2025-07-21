import {servicioPaseador} from '../models/servicioPaseador.js';
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Paseador } from '../models/entidades/Paseador.js';
import { Notificacion } from '../models/entidades/Notificacion.js';
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"
import mongoose from "mongoose"

export class ServicioPaseadorService {

    constructor(servicioPaseadorRepository,paseadorRepository,localidadRepository,ciudadRepository) {
        this.servicioPaseadorRepository = servicioPaseadorRepository;
        this.paseadorRepository = paseadorRepository;
        this.localidadRepository = localidadRepository;
        this.ciudadRepository = ciudadRepository;
    }

    async findAll({page = 1, limit = 4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Buscar paseadores distintos
        let paseadores = await this.paseadorRepositoryfindByPage(pageNum, limit)

        console.log("Paseadores encontrados:", paseadores.length)
        
        
        // Extraer los IDs de las paseadores
        const paseadoresIds = paseadores.map(v => v.id)
        
        // Buscar todos los servicios de estos paseadoeres
        const todosLosServiciosPorPaseador = await Promise.all(
            paseadoresIds.map(async (paseadoresId) => {
                return await this.servicioPaseadorRepository.findByPaseadorId(paseadorId);
            })
        );

        // Aplanar el array de servicios (cada paseador devuelve un array)
        const todosLosServicios = todosLosServiciosPorPaseador.flat()

        const total = todosLosServicios.length
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServicios.map(s => this.toDTO(s))

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: total,
            totalPaseadores: paseadores.length,
            total_pages: total_pages,
            data: data
        };
    }

    async findAll({page = 1, limit = 4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Buscar paseadores distintas
        let paseadores = await this.paseadorRepository.findByPage(pageNum, limit)

        console.log("Paseadores encontradas:", paseadores.length)
        
        
        // Extraer los IDs de las paseadores
        const paseadorIds = paseadores.map(v => v.id)
        
        // Buscar todos los servicios de estas paseadores
        const todosLosServiciosPorPaseador = await Promise.all(
            paseadorIds.map(async (paseadorId) => {
                return await this.servicioPaseadorRepository.findByPaseadorId(paseadorId);
            })
        );

        // Aplanar el array de servicios (cada paseador devuelve un array)
        const todosLosServicios = todosLosServiciosPorPaseador.flat()

        const total = todosLosServicios.length
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServicios.map(s => this.toDTO(s))

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: total,
            totalPaseadores: paseadores.length,
            total_pages: total_pages,
            data: data
        };
    }

    async findByFilters(filtro,{page=1,limit=4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let paseadores = await this.paseadorRepository.findByPage(pageNum, limit)
        const paseadorIds = paseadores.map(v => v.id)

        let serviciosPaseadores = await this.servicioPaseadorRepository.findByFilters(filtro);

        let todosLosServiciosFiltradosDeEstasPaseadores = serviciosPaseadores.filter(s => paseadorIds.includes(s.usuarioProveedor.id))

        // Calcular totales basándose en los servicios después del filtro por paseadores distintas
        const totalServiciosDisponibles = todosLosServiciosFiltradosDeEstasPaseadores.length;
        const total_pages = Math.ceil(totalServiciosDisponibles / limitNum);
        
        // Aplicar paginación
       /*  const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum; 
        const serviciosPaginados = todosLosServiciosFiltradosDeEstasPaseadores.slice(startIndex, endIndex);
        */
        const data = todosLosServiciosFiltradosDeEstasPaseadores.map(a => this.toDTO(a));

        return {
            page: pageNum,
            per_page: limitNum,
            totalPaseadores: data.length ,  // Total real de servicios disponibles
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
        const { idPaseador, nombreServicio, tipoServicio, precio, descripcion, duracionMinutos, nombreClinica, direccion, emailClinica, telefonoClinica, diasDisponibles, horariosDisponibles, mascotasAceptadas } = servicioPaseador

        if(!idPaseador || !nombreServicio || !tipoServicio || !precio || !descripcion || !duracionMinutos || !nombreClinica || !direccion || !emailClinica || !telefonoClinica || !diasDisponibles || !horariosDisponibles || !mascotasAceptadas) {
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

        // Validar que direccion tenga la estructura esperada
        if(!direccion.calle || !direccion.altura || !direccion.ciudad || !direccion.ciudad.nombre || !direccion.ciudad.localidad || !direccion.ciudad.localidad.nombre) {
            throw new ValidationError("La direccion debe tener calle, altura, ciudad y localidad completas")
        }

        let localidadExistente = await this.localidadRepository.findByName(direccion.ciudad.localidad.nombre)
        if(!localidadExistente) {
            localidadExistente = new Localidad(direccion.ciudad.localidad.nombre)
            localidadExistente = await this.localidadRepository.save(localidadExistente)
        }

        let ciudadExistente = await this.ciudadRepository.findByName(direccion.ciudad.nombre)
        if(!ciudadExistente) {
            ciudadExistente = new Ciudad(direccion.ciudad.nombre, localidadExistente)
            ciudadExistente = await this.ciudadRepository.save(ciudadExistente)
        }

        const objectDireccion = new Direccion(direccion.calle, direccion.altura, ciudadExistente)

        const nuevoServicioPaseador = new ServicioPaseador(
            existentePaseador,           // usuarioProveedor
            nombreServicio,                 // nombreServicio
            tipoServicio,                  // tipoServicio
            precio,                        // precio
            descripcion,                   // descripcion
            duracionMinutos,               // duracionMinutos
            nombreClinica,                 // nombreClinica
            objectDireccion,               // direccion
            emailClinica,                  // emailClinica
            telefonoClinica,               // telefonoClinica
            diasDisponibles,               // diasDisponibles
            horariosDisponibles,           // horariosDisponibles
            mascotasAceptadas              // mascotasAceptadas
        )

        await this.servicioPaseadorRepository.save(nuevoServicioPaseador)

        return this.toDTO(nuevoServicioPaseador)
    }

async delete(id) {
        const borrado = await this.servicioPaseadorRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Servicio Paseador con id ${id} no encontrado`);
        }
        return borrado;
    }

    async cambiarEstadoServicioPaseador(id, nuevoEstado) {
        const servicioPaseador = await this.servicioPaseadorRepository.findById(id)
        if(!servicioPaseador) {
            throw new NotFoundError(`Servicio Paseador con id ${id} no encontrado`);
        }

        if(nuevoEstado === "Activada" ) {
            if(servicioPaseador.estado === EstadoServicio.ACTIVO) {
                throw new ConflictError(`Servicio Paseador con id ${id} ya está activada`);
            }
            servicioPaseador.estado = EstadoServicio.ACTIVO
        } else if(nuevoEstado === "Desactivada") {
            if(servicioPaseador.estado === EstadoServicio.DESACTIVADO) {
                throw new ConflictError(`Servicio Paseador con id ${id} ya está desactivada`);
            }
            servicioPaseador.estado = EstadoServicio.DESACTIVADO
        }
        await this.servicioPaseadorRepository.save(servicioPaseador)
        return this.toDTO(servicioPaseador)
    }

    toDTO(servicoPaseador) {
        return {
            id: servicoPaseador.id,
            usuarioProveedor: {
                nombre: servicoPaseador.usuarioProveedor.nombreUsuario,
                email: servicoPaseador.usuarioProveedor.email,
            },
            nombreServicio: servicoPaseador.nombreServicio,
            precio: servicoPaseador.precio,
            descripcion: servicoPaseador.descripcion,
            duracionMinutos: servicoPaseador.duracionMinutos,
            nombreContacto: servicoPaseador.nombreContacto,
            direccion: servicoPaseador.direccion,
            emailContacto: servicoPaseador.emailContacto,
            telefonoContacto: servicoPaseador.telefonoContacto,
            diasDisponibles: servicoPaseador.diasDisponibles,
            horariosDisponibles: servicoPaseador.horariosDisponibles,
            fechasNoDisponibles: servicoPaseador.fechasNoDisponibles,
            estado: servicoPaseador.estado
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


 









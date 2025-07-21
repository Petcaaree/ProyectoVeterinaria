import { Cuidador } from "../models/entidades/Cuidador.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { ServicioCuidador } from "../models/entidades/ServicioCuidador.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"
import { EstadoServicio } from "../models/entidades/enums/enumEstadoServicio.js"

import mongoose from "mongoose"


export class ServicioCuidadorService {

    constructor(servicioCuidadorRepository,cuidadorRepository, localidadRepository, ciudadRepository) {
        this.servicioCuidadorRepository = servicioCuidadorRepository
        this.cuidadorRepository = cuidadorRepository
        this.localidadRepository = localidadRepository
        this.ciudadRepository = ciudadRepository
    }

    async findAll({page = 1, limit = 4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Buscar cuidadores distintos
        let cuidadores = await this.cuidadorRepository.findByPage(pageNum, limit)

        // console.log("Cuidadores encontrados:", cuidadores.length)


        // Extraer los IDs de los cuidadores
        const cuidadorIds = cuidadores.map(v => v.id)

        // Buscar todos los servicios de estos cuidadores
        const todosLosServiciosPorCuidador = await Promise.all(
            cuidadorIds.map(async (cuidadorId) => {
                return await this.servicioCuidadorRepository.findByCuidadorId(cuidadorId);
            })
        );

        // Filtrar solo los cuidadores que tienen servicios
        const cuidadoresConServicios = [];
        const serviciosValidos = [];

        for (let i = 0; i < cuidadorIds.length; i++) {
            const serviciosDeCuidador = todosLosServiciosPorCuidador[i];
            if (serviciosDeCuidador && serviciosDeCuidador.length > 0) {
                cuidadoresConServicios.push(cuidadorIds[i]);
                serviciosValidos.push(...serviciosDeCuidador);
            }
        }

        // Aplanar el array de servicios (solo de cuidadores con servicios)
        const todosLosServicios = serviciosValidos

        const total = await this.cuidadorRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServicios.map(s => this.toDTO(s))

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: todosLosServicios.length,
            totalCuidadores: cuidadoresConServicios.length,
            total_pages: total_pages,
            data: data
        };
    }

    async findByFilters(filtro,{page=1,limit=4}) {
        console.log("Filtro recibido:", filtro);
                const pageNum = Math.max(Number(page), 1)
                const limitNum = Math.min(Math.max(Number(limit), 1), 100)
        
                /* let cuidadores = await this.cuidadorRepository.findByPage(pageNum, limit)
                const cuidadorIds = cuidadores.map(v => v.id) */
        
        
        
                let serviciosCuidadores = await this.servicioCuidadorRepository.findByFilters(filtro);
        
                let cuidadorIds = [];
                for (let i = 0; i < serviciosCuidadores.length; i++) {
                    const servicio = serviciosCuidadores[i];
                    if (servicio.usuarioProveedor && servicio.usuarioProveedor.id) {
                        // Asegurarse de que el ID del cuidador esté en formato ObjectId
                        if (!mongoose.Types.ObjectId.isValid(servicio.usuarioProveedor.id)) {
                            throw new ValidationError(`El ID de cuidador ${servicio.usuarioProveedor.id} no es válido`);
                        }
                        // Solo agregar si no está ya en el array
                        if (!cuidadorIds.includes(servicio.usuarioProveedor.id)) {
                            cuidadorIds.push(servicio.usuarioProveedor.id);
                        }
                    }
                }
        
                
                const startIndex = (pageNum - 1) * limitNum;
                const endIndex = startIndex + limitNum;
                const cuidadoresPaginasID = cuidadorIds.slice(startIndex, endIndex);
                // console.log("Cuidadores Paginas ID:", cuidadoresPaginasID)
                let todosLosServiciosFiltradosDeEstosCuidadores = serviciosCuidadores.filter(s => cuidadoresPaginasID.includes(s.usuarioProveedor.id))
        
                // Calcular totales basándose en los servicios después del filtro por cuidadores distintas
                const total = todosLosServiciosFiltradosDeEstosCuidadores.length;
                const total_pages = Math.ceil(cuidadorIds.length / limitNum);
                
                // Aplicar paginación
               
            
                const data = todosLosServiciosFiltradosDeEstosCuidadores.map(a => this.toDTO(a));
        
                return {
                    page: pageNum,
                    per_page: limitNum,
                    totalServicios: total,
                    totalCuidadores: cuidadoresPaginasID.length ,  // Total real de servicios disponibles
                    total_pages: total_pages,
                    data: data
                };
            }

    async findById(id) {
        const servicioCuidador = await this.servicioCuidadorRepository.findById(id)
        if(!servicioCuidador) {
            throw new NotFoundError(`Servicio Cuidador con id ${id} no encontrado`)
        }
        return this.toDTO(servicioCuidador)
    }

    async findByCuidador(id, {page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let serviciosCuidadors = await this.servicioCuidadorRepository.findByCuidadorId(id);

        const total = serviciosCuidadors.length;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const total_pages = Math.ceil(total / limitNum);

        const data = serviciosCuidadors.slice(startIndex, endIndex).map(a => this.toDTO(a));

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        };
    }

    async create(servicioCuidador) {
        const { idCuidador, nombreServicio, precio, descripcion, nombreContacto, emailContacto, telefonoContacto, diasDisponibles, mascotasAceptadas } = servicioCuidador

        if(!idCuidador || !nombreServicio  || !precio || !descripcion  || !nombreContacto  || !emailContacto || !telefonoContacto || !diasDisponibles || !mascotasAceptadas) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const existente = await this.servicioCuidadorRepository.findByName(nombreServicio)

        if(existente) {
            throw new ConflictError(`Servicio Cuidador con nombre ${nombreServicio} ya existe`)
        }

        if(!mongoose.Types.ObjectId.isValid(idCuidador)) {
            throw new ValidationError(`El ID de cuidador ${idCuidador} no es válido`)
        }

        const existenteCuidador = await this.cuidadorRepository.findById(idCuidador)

        if(!existenteCuidador) {
            throw new NotFoundError(`Cuidador con id ${idCuidador} no encontrada`)
        }

        // Validar que direccion tenga la estructura esperada
        /* if(!direccion.calle || !direccion.altura || !direccion.ciudad || !direccion.ciudad.nombre || !direccion.ciudad.localidad || !direccion.ciudad.localidad.nombre) {
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

        const objectDireccion = new Direccion(direccion.calle, direccion.altura, ciudadExistente) */


            const nuevoServicioCuidador = new ServicioCuidador(
                existenteCuidador,           // usuarioProveedor
                nombreServicio,                 // nombreServicio
                precio,                        // precio
                descripcion,                   // descripcion
                nombreContacto,                 // nombreContacto
                emailContacto,                  // emailContacto
                telefonoContacto,               // telefonoContacto
                diasDisponibles,               // diasDisponibles
                mascotasAceptadas              // mascotasAceptadas
            )

        await this.servicioCuidadorRepository.save(nuevoServicioCuidador)

        return this.toDTO(nuevoServicioCuidador)
    }

    async delete(id) {
        const borrado = await this.servicioCuidadorRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Servicio Cuidador con id ${id} no encontrado`);
        }
        return borrado;
    }

    async cambiarEstadoServicioCuidador(id, nuevoEstado) {
        const servicioCuidador = await this.servicioCuidadorRepository.findById(id)
        if(!servicioCuidador) {
            throw new NotFoundError(`Servicio Cuidador con id ${id} no encontrado`);
        }

        if(nuevoEstado === "Activada" ) {
            if(servicioCuidador.estado === EstadoServicio.ACTIVO) {
                throw new ConflictError(`Servicio Cuidador con id ${id} ya está activada`);
            }
            servicioCuidador.estado = EstadoServicio.ACTIVO
        } else if(nuevoEstado === "Desactivada") {
            if(servicioCuidador.estado === EstadoServicio.DESACTIVADA) {
                throw new ConflictError(`Servicio Cuidador con id ${id} ya está desactivada`);
            }
            servicioCuidador.estado = EstadoServicio.DESACTIVADA
        }
        await this.servicioCuidadorRepository.save(servicioCuidador)
        return this.toDTO(servicioCuidador)
    }

    toDTO(servicoCuidador) {
        return {
            id: servicoCuidador.id,
            usuarioProveedor: {
                nombre: servicoCuidador.usuarioProveedor.nombreUsuario,
                email: servicoCuidador.usuarioProveedor.email,
            },
            nombreServicio: servicoCuidador.nombreServicio,
            precio: servicoCuidador.precio,
            descripcion: servicoCuidador.descripcion,
            nombreContacto: servicoCuidador.nombreContacto,
            emailContacto: servicoCuidador.emailContacto,
            telefonoContacto: servicoCuidador.telefonoContacto,
            diasDisponibles: servicoCuidador.diasDisponibles,
            mascotasAceptadas: servicoCuidador.mascotasAceptadas,
            fechasNoDisponibles: servicoCuidador.fechasNoDisponibles,
            estado: servicoCuidador.estado
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
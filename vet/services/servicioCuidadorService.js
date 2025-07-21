import { Cuidador } from "../models/entidades/Cuidador.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { ServicioCuidador } from "../models/entidades/ServicioCuidador.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"
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

        // Buscar cuidadors distintas
        let cuidadors = await this.cuidadorRepository.findByPage(pageNum, limit)

        console.log("Cuidadors encontradas:", cuidadors.length)
        
        
        // Extraer los IDs de las cuidadors
        const cuidadorIds = cuidadors.map(v => v.id)
        
        // Buscar todos los servicios de estas cuidadors
        const todosLosServiciosPorCuidador = await Promise.all(
            cuidadorIds.map(async (cuidadorId) => {
                return await this.servicioCuidadorRepository.findByCuidadorId(cuidadorId);
            })
        );

        // Aplanar el array de servicios (cada cuidador devuelve un array)
        const todosLosServicios = todosLosServiciosPorCuidador.flat()

        const total = todosLosServicios.length
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServicios.map(s => this.toDTO(s))

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: total,
            totalCuidadors: cuidadors.length,
            total_pages: total_pages,
            data: data
        };
    }

    async findByFilters(filtro,{page=1,limit=4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let cuidadors = await this.cuidadorRepository.findByPage(pageNum, limit)
        const cuidadorIds = cuidadors.map(v => v.id)



        let serviciosCuidadors = await this.servicioCuidadorRepository.findByFilters(filtro);



        let todosLosServiciosFiltradosDeEstasCuidadors = serviciosCuidadors.filter(s => cuidadorIds.includes(s.usuarioProveedor.id))

        // Calcular totales basándose en los servicios después del filtro por cuidadors distintas
        const total = todosLosServiciosFiltradosDeEstasCuidadors.length;
        const total_pages = Math.ceil(total / limitNum);
        
        // Aplicar paginación
       /*  const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum; 
        const serviciosPaginados = todosLosServiciosFiltradosDeEstasCuidadors.slice(startIndex, endIndex);
        */
        const data = todosLosServiciosFiltradosDeEstasCuidadors.map(a => this.toDTO(a));

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: total,
            totalCuidadors: cuidadors.length ,  // Total real de servicios disponibles
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
        const { idCuidador, nombreServicio, tipoServicio, precio, descripcion, duracionMinutos, nombreClinica, direccion, emailClinica, telefonoClinica, diasDisponibles, horariosDisponibles, mascotasAceptadas } = servicioCuidador

        if(!idCuidador || !nombreServicio || !tipoServicio || !precio || !descripcion || !duracionMinutos || !nombreClinica || !direccion || !emailClinica || !telefonoClinica || !diasDisponibles || !horariosDisponibles || !mascotasAceptadas) {
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

        const nuevoServicioCuidador = new ServicioCuidador(
            existenteCuidador,           // usuarioProveedor
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

    async cambiarEstadoServicioVet(id, nuevoEstado) {
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
            if(servicioCuidador.estado === EstadoServicio.DESACTIVADO) {
                throw new ConflictError(`Servicio Cuidador con id ${id} ya está desactivada`);
            }
            servicioCuidador.estado = EstadoServicio.DESACTIVADO
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
            tipoServicio: servicoCuidador.tipoServicio,
            precio: servicoCuidador.precio,
            descripcion: servicoCuidador.descripcion,
            duracionMinutos: servicoCuidador.duracionMinutos,
            nombreClinica: servicoCuidador.nombreClinica,
            direccion: servicoCuidador.direccion,
            emailClinica: servicoCuidador.emailClinica,
            telefonoClinica: servicoCuidador.telefonoClinica,
            diasDisponibles: servicoCuidador.diasDisponibles,
            horariosDisponibles: servicoCuidador.horariosDisponibles,
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
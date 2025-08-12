import { Veterinaria } from "../models/entidades/Veterinaria.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { ServicioVeterinaria } from "../models/entidades/ServicioVeterinaria.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"
import { EstadoServicio } from "../models/entidades/enums/enumEstadoServicio.js"
import { EstadoReserva } from "../models/entidades/enums/EstadoReserva.js"

import mongoose from "mongoose"


export class ServicioVeterinariaService {

    constructor(servicioVeterinariaRepository, veterinariaRepository, ciudadRepository, localidadRepository, reservaRepository) {
        this.servicioVeterinariaRepository = servicioVeterinariaRepository
        this.veterinariaRepository = veterinariaRepository
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
        this.reservaRepository = reservaRepository
    }

    async findAll({page = 1, limit = 4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Buscar veterinarias distintas
        let veterinarias = await this.veterinariaRepository.findByPage(pageNum, limit)

        // console.log("Veterinarias encontradas:", veterinarias.length)
        
        // Extraer los IDs de las veterinarias
        const veterinariaIds = veterinarias.map(v => v.id)
        
        // Buscar todos los servicios de estas veterinarias
        const todosLosServiciosPorVeterinaria = await Promise.all(
            veterinariaIds.map(async (veterinariaId) => {
                return await this.servicioVeterinariaRepository.findByVeterinariaId(veterinariaId);
            })
        );

        // Filtrar solo las veterinarias que tienen servicios
        const veterinariasConServicios = [];
        const serviciosValidos = [];

        for (let i = 0; i < veterinariaIds.length; i++) {
            const serviciosDeVeterinaria = todosLosServiciosPorVeterinaria[i];
            if (serviciosDeVeterinaria && serviciosDeVeterinaria.length > 0) {
                veterinariasConServicios.push(veterinariaIds[i]);
                serviciosValidos.push(...serviciosDeVeterinaria);
            }
        }

        // Aplanar el array de servicios (solo de veterinarias con servicios)
        const todosLosServicios = serviciosValidos

        const total = await this.veterinariaRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServicios.map(s => this.toDTO(s))

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: todosLosServicios.length,
            totalVeterinarias: veterinariasConServicios.length,
            total_pages: total_pages,
            data: data
        };
    }

    async findByFilters(filtro,{page=1,limit=4}) {
            const pageNum = Math.max(Number(page), 1)
            const limitNum = Math.min(Math.max(Number(limit), 1), 100)

            console.log("Filtro recibido:", filtro);
    
            /* let veterinarias = await this.veterinariaRepository.findByPage(pageNum, limit)
            const veterinariaIds = veterinarias.map(v => v.id) */
    
    
    
            let serviciosVeterinarias = await this.servicioVeterinariaRepository.findByFilters(filtro);
    
            let veterinariaIds = [];
            for (let i = 0; i < serviciosVeterinarias.length; i++) {
                const servicio = serviciosVeterinarias[i];
                if (servicio.usuarioProveedor && servicio.usuarioProveedor.id) {
                    // Asegurarse de que el ID del veterinaria esté en formato ObjectId
                    if (!mongoose.Types.ObjectId.isValid(servicio.usuarioProveedor.id)) {
                        throw new ValidationError(`El ID de veterinaria ${servicio.usuarioProveedor.id} no es válido`);
                    }
                    // Solo agregar si no está ya en el array
                    if (!veterinariaIds.includes(servicio.usuarioProveedor.id)) {
                        veterinariaIds.push(servicio.usuarioProveedor.id);
                    }
                }
            }
    
            //console.log("Veterinarias Paginas ID antes:", veterinariaIds)
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const veterinariasPaginasID = veterinariaIds.slice(startIndex, endIndex);
            //console.log("Veterinarias Paginas ID:", veterinariasPaginasID)
            let todosLosServiciosFiltradosDeEstosVeterinarias = serviciosVeterinarias.filter(s => veterinariasPaginasID.includes(s.usuarioProveedor.id))
    
            // Calcular totales basándose en los servicios después del filtro por veterinarias distintas
            const total = todosLosServiciosFiltradosDeEstosVeterinarias.length;
            const total_pages = Math.ceil(veterinariaIds.length / limitNum);
            
            // Aplicar paginación
           
        
            const data = todosLosServiciosFiltradosDeEstosVeterinarias.map(a => this.toDTO(a));
    
            return {
                page: pageNum,
                per_page: limitNum,
                totalServicios: total,
                totalVeterinarias: veterinariasPaginasID.length ,  // Total real de servicios disponibles
                total_pages: total_pages,
                data: data
            };
        }

    async findById(id) {
        const servicioVeterinaria = await this.servicioVeterinariaRepository.findById(id)
        if(!servicioVeterinaria) {
            throw new NotFoundError(`Servicio Veterinaria con id ${id} no encontrado`)
        }
        return this.toDTO(servicioVeterinaria)
    }

    async findByVeterinaria(id, {page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let serviciosVeterinarias = await this.servicioVeterinariaRepository.findByVeterinariaId(id);

        const total = serviciosVeterinarias.length;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const total_pages = Math.ceil(total / limitNum);

        const data = serviciosVeterinarias.slice(startIndex, endIndex).map(a => this.toDTO(a));

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        };
    }

    async create(servicioVeterinaria) {
        const { idVeterinaria, nombreServicio, tipoServicio, precio, descripcion, duracionMinutos, nombreClinica, direccion, emailClinica, telefonoClinica, diasDisponibles, horariosDisponibles, mascotasAceptadas } = servicioVeterinaria

        if(!idVeterinaria || !nombreServicio || !tipoServicio || !precio || !descripcion || !duracionMinutos || !nombreClinica || !direccion || !emailClinica || !telefonoClinica || !diasDisponibles || !horariosDisponibles || !mascotasAceptadas) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const existente = await this.servicioVeterinariaRepository.findByName(nombreServicio)

        if(existente) {
            throw new ConflictError(`Servicio Veterinaria con nombre ${nombreServicio} ya existe`)
        }

        if(!mongoose.Types.ObjectId.isValid(idVeterinaria)) {
            throw new ValidationError(`El ID de veterinaria ${idVeterinaria} no es válido`)
        }

        const existenteVeterinaria = await this.veterinariaRepository.findById(idVeterinaria)

        if(!existenteVeterinaria) {
            throw new NotFoundError(`Veterinaria con id ${idVeterinaria} no encontrada`)
        }

        /* const compararDirecciones = (dir1, dir2) => {
            if (!dir1 || !dir2) return false;
            
            return dir1.calle === dir2.calle &&
                   dir1.altura === dir2.altura &&
                   dir1.localidad?.nombre === dir2.localidad?.nombre &&
                   dir1.localidad?.ciudad?.nombre === dir2.localidad?.ciudad?.nombre;
        };
        
        // Verificar que la direccion sea la misma que la del veterinaria
        if (existenteVeterinaria.direccion && !compararDirecciones(existenteVeterinaria.direccion, direccion)) {
            throw new ValidationError("La dirección del servicio debe coincidir con la del veterinaria");
        }
        if (existenteVeterinaria.direccion && !compararDirecciones(existenteVeterinaria.direccion, direccion)) {
             throw new ValidationError("La dirección del servicio debe coincidir con la del paseador");
        } */

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


        const nuevoServicioVeterinaria = new ServicioVeterinaria(
            existenteVeterinaria,           // usuarioProveedor
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

        const servicioGuardado = await this.servicioVeterinariaRepository.save(nuevoServicioVeterinaria)

        return this.toDTO(servicioGuardado)
    }

    async delete(id) {
        const borrado = await this.servicioVeterinariaRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Servicio Veterinaria con id ${id} no encontrado`);
        }
        return borrado;
    }

    async cambiarEstadoServicioVeterinaria(id, nuevoEstado) {
        const servicioVeterinaria = await this.servicioVeterinariaRepository.findById(id)
        if(!servicioVeterinaria) {
            throw new NotFoundError(`Servicio Veterinaria con id ${id} no encontrado`);
        }

        if(nuevoEstado === "Activada" ) {
            if(servicioVeterinaria.estado === EstadoServicio.ACTIVO) {
                throw new ConflictError(`Servicio Veterinaria con id ${id} ya está activada`);
            }
            servicioVeterinaria.estado = EstadoServicio.ACTIVO
        } else if(nuevoEstado === "Desactivada") {
            if(servicioVeterinaria.estado === EstadoServicio.DESACTIVADA) {
                throw new ConflictError(`Servicio Veterinaria con id ${id} ya está desactivada`);
            }
            
            // Verificar si hay reservas pendientes antes de desactivar
            const reservasDelServicio = await this.reservaRepository.findByServicioReservado(id)
            const reservasPendientes = reservasDelServicio.filter(reserva => 
                reserva.estado === EstadoReserva.PENDIENTE || reserva.estado === EstadoReserva.CONFIRMADA
            )
            
            if(reservasPendientes.length > 0) {
                throw new ConflictError(`No se puede desactivar el servicio. Hay ${reservasPendientes.length} reserva(s) pendiente(s) o confirmada(s)`);
            }
            
            servicioVeterinaria.estado = EstadoServicio.DESACTIVADA
        }
        await this.servicioVeterinariaRepository.save(servicioVeterinaria)
        return this.toDTO(servicioVeterinaria)
    }

    async findByEstado(estado, veterinariaID, { page = 1, limit = 4 }) {
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Math.max(Number(limit), 1), 100);

        const servicios = await this.servicioVeterinariaRepository.findByEstadoByVeterinaria(estado, veterinariaID);

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

    toDTO(servicoVeterinaria) {
        return {
            id: servicoVeterinaria.id,
            usuarioProveedor: {
                nombre: servicoVeterinaria.usuarioProveedor.nombreUsuario,
                email: servicoVeterinaria.usuarioProveedor.email,
            },
            nombreServicio: servicoVeterinaria.nombreServicio,
            tipoServicio: servicoVeterinaria.tipoServicio,
            precio: servicoVeterinaria.precio,
            descripcion: servicoVeterinaria.descripcion,
            duracionMinutos: servicoVeterinaria.duracionMinutos,
            nombreClinica: servicoVeterinaria.nombreClinica,
            direccion: servicoVeterinaria.direccion,
            emailClinica: servicoVeterinaria.emailClinica,
            telefonoClinica: servicoVeterinaria.telefonoClinica,
            diasDisponibles: servicoVeterinaria.diasDisponibles,
            horariosDisponibles: servicoVeterinaria.horariosDisponibles,
            mascotasAceptadas: servicoVeterinaria.mascotasAceptadas,
            fechasNoDisponibles: servicoVeterinaria.fechasNoDisponibles,
            estado: servicoVeterinaria.estado,
            fechaCreacion: servicoVeterinaria.fechaCreacion,
            cantidadReservas: servicoVeterinaria.cantidadReservas
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

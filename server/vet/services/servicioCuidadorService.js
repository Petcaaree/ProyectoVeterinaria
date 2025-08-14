import { Cuidador } from "../models/entidades/Cuidador.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { ServicioCuidador } from "../models/entidades/ServicioCuidador.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"
import { EstadoServicio } from "../models/entidades/enums/enumEstadoServicio.js"
import { EstadoReserva } from "../models/entidades/enums/EstadoReserva.js"

import mongoose from "mongoose"


export class ServicioCuidadorService {

    constructor(servicioCuidadorRepository, cuidadorRepository, ciudadRepository, localidadRepository, reservaRepository) {
        this.servicioCuidadorRepository = servicioCuidadorRepository
        this.cuidadorRepository = cuidadorRepository
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
        this.reservaRepository = reservaRepository
    }

    async findAll({page = 1, limit = 6}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Buscar cuidadores distintos
        /* let cuidadores = await this.cuidadorRepository.findByPage(pageNum, limit)


       
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
        const todosLosServicios = serviciosValidos */


        const todosLosServiciosPorPagina = await this.servicioCuidadorRepository.findByPage(pageNum, limitNum)
        const todosLosServicios = await this.servicioCuidadorRepository.findAll()

        // Obtener cuidadores distintos de todos los servicios
        const cuidadoresDistintosIds = new Set(todosLosServicios.map(s => s.usuarioProveedor.id))
        const totalCuidadoresDistintos = cuidadoresDistintosIds.size

        // Obtener cuidadores distintos de los servicios de esta página
        const cuidadoresDistintosPagina = new Set(todosLosServiciosPorPagina.map(s => s.usuarioProveedor.id))

        const total = await this.servicioCuidadorRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServiciosPorPagina.map(s => this.toDTO(s))

        /* const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const cuidadoresPaginasID = cuidadorIds.slice(startIndex, endIndex); */

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: todosLosServicios.length,
            totalCuidadores: totalCuidadoresDistintos,
            cuidadoresPagina: cuidadoresDistintosPagina.size,
            total_pages: total_pages,
            data: data
        };
    }

    async findByFilters(filtro,{page=1,limit=6}) {
        console.log("Filtro recibido:", filtro);
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Obtener todos los servicios que cumplen con los filtros
        let serviciosCuidadores = await this.servicioCuidadorRepository.findByFilters(filtro);

        // Calcular totales basándose en los servicios encontrados
        const totalServicios = serviciosCuidadores.length;
        const total_pages = Math.ceil(totalServicios / limitNum);

        // Aplicar paginación directamente a los servicios
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const serviciosPaginados = serviciosCuidadores.slice(startIndex, endIndex);

        // Obtener cuidadores únicos de los servicios paginados
        const cuidadoresUnicosIds = new Set(serviciosPaginados.map(s => s.usuarioProveedor.id));
        const totalCuidadoresEnPagina = cuidadoresUnicosIds.size;

        // Obtener total de cuidadores únicos en todos los resultados filtrados
        const todosCuidadoresUnicos = new Set(serviciosCuidadores.map(s => s.usuarioProveedor.id));
        const totalCuidadoresUnicos = todosCuidadoresUnicos.size;

        const data = serviciosPaginados.map(a => this.toDTO(a));

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: totalServicios,
            totalCuidadores: totalCuidadoresUnicos,  // Total de cuidadores únicos en todos los resultados
            cuidadoresEnPagina: totalCuidadoresEnPagina, // Cuidadores únicos en esta página
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

    async findByCuidador(id, {page = 1, limit = 3}) {
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
        const { idCuidador, nombreServicio, precio, descripcion, nombreContacto, emailContacto, telefonoContacto, diasDisponibles, mascotasAceptadas, direccion } = servicioCuidador

        // Validar campos obligatorios
        const camposFaltantes = [];
        if (!idCuidador) camposFaltantes.push('idCuidador');
        if (!nombreServicio) camposFaltantes.push('nombreServicio');
        if (!precio) camposFaltantes.push('precio');
        if (!descripcion) camposFaltantes.push('descripcion');
        if (!nombreContacto) camposFaltantes.push('nombreContacto');
        if (!emailContacto) camposFaltantes.push('emailContacto');
        if (!telefonoContacto) camposFaltantes.push('telefonoContacto');
        if (!diasDisponibles || diasDisponibles.length === 0) camposFaltantes.push('diasDisponibles');
        if (!mascotasAceptadas || mascotasAceptadas.length === 0) camposFaltantes.push('mascotasAceptadas');
        if (!direccion) camposFaltantes.push('direccion');

        if (camposFaltantes.length > 0) {
            throw new ValidationError(`Faltan los siguientes datos obligatorios: ${camposFaltantes.join(', ')}`);
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

        // Verificar que la direccion sea la misma que la del cuidador
        const compararDirecciones = (dir1, dir2) => {
            if (!dir1 || !dir2) return false;
            
            return dir1.calle === dir2.calle &&
                   dir1.altura === dir2.altura &&
                   dir1.localidad?.nombre === dir2.localidad?.nombre &&
                   dir1.localidad?.ciudad?.nombre === dir2.localidad?.ciudad?.nombre;
        };

        // Verificar que la direccion sea la misma que la del cuidador
        if (existenteCuidador.direccion && !compararDirecciones(existenteCuidador.direccion, direccion)) {
             throw new ValidationError("La dirección del servicio debe coincidir con la del cuidador");
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

        const nuevoServicioCuidador = new ServicioCuidador(
            existenteCuidador,           // usuarioProveedor
            nombreServicio,                 // nombreServicio
            precio,                        // precio
            descripcion,                   // descripcion
            nombreContacto,                 // nombreContacto
            emailContacto,                  // emailContacto
            telefonoContacto,               // telefonoContacto
            diasDisponibles,               // diasDisponibles
            mascotasAceptadas,
            objectDireccion                  // direccion
        )

        const servicioGuardado = await this.servicioCuidadorRepository.save(nuevoServicioCuidador)

        return this.toDTO(servicioGuardado)
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
            
            // Verificar si hay reservas pendientes antes de desactivar
            const reservasDelServicio = await this.reservaRepository.findByServicioReservado(id)
            const reservasPendientes = reservasDelServicio.filter(reserva => 
                reserva.estado === EstadoReserva.PENDIENTE || reserva.estado === EstadoReserva.CONFIRMADA
            )
            
            if(reservasPendientes.length > 0) {
                throw new ConflictError(`No se puede desactivar el servicio. Hay ${reservasPendientes.length} reserva(s) pendiente(s) o confirmada(s)`);
            }
            
            servicioCuidador.estado = EstadoServicio.DESACTIVADA
        }
        await this.servicioCuidadorRepository.save(servicioCuidador)
        return this.toDTO(servicioCuidador)
    }

    async findByEstado(estado, cuidadorID, { page = 1, limit = 4 }) {
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Math.max(Number(limit), 1), 100);

        const servicios = await this.servicioCuidadorRepository.findByEstadoByCuidador(estado, cuidadorID);

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


    toDTO(servicoCuidador) {
        return {
            id: servicoCuidador.id,
            usuarioProveedor: {
                nombre: servicoCuidador.usuarioProveedor.nombreUsuario,
                email: servicoCuidador.usuarioProveedor.email,
            },
            nombreServicio: servicoCuidador.nombreServicio,
            direccion: servicoCuidador.direccion ,
            precio: servicoCuidador.precio,
            descripcion: servicoCuidador.descripcion,
            nombreContacto: servicoCuidador.nombreContacto,
            emailContacto: servicoCuidador.emailContacto,
            telefonoContacto: servicoCuidador.telefonoContacto,
            diasDisponibles: servicoCuidador.diasDisponibles,
            mascotasAceptadas: servicoCuidador.mascotasAceptadas,
            fechasNoDisponibles: servicoCuidador.fechasNoDisponibles,
            estado: servicoCuidador.estado,
            fechaCreacion: servicoCuidador.fechaCreacion,
            cantidadReservas: servicoCuidador.cantidadReservas
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

import { Veterinaria } from "../models/entidades/Veterinaria.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { ServicioVeterinaria } from "../models/entidades/ServicioVeterinaria.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"
import mongoose from "mongoose"


export class ServicioVeterinariaService {

    constructor(servicioVeterinariaRepository,veterinariaRepository, localidadRepository, ciudadRepository) {
        this.servicioVeterinariaRepository = servicioVeterinariaRepository
        this.veterinariaRepository = veterinariaRepository
        this.localidadRepository = localidadRepository
        this.ciudadRepository = ciudadRepository
    }

    async findAll({page = 1, limit = 4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        // Buscar veterinarias distintas
        let veterinarias = await this.veterinariaRepository.findByPage(pageNum, limit)

        console.log("Veterinarias encontradas:", veterinarias.length)
        
        
        // Extraer los IDs de las veterinarias
        const veterinariaIds = veterinarias.map(v => v.id)
        
        // Buscar todos los servicios de estas veterinarias
        const todosLosServiciosPorVeterinaria = await Promise.all(
            veterinariaIds.map(async (veterinariaId) => {
                return await this.servicioVeterinariaRepository.findByVeterinariaId(veterinariaId);
            })
        );

        // Aplanar el array de servicios (cada veterinaria devuelve un array)
        const todosLosServicios = todosLosServiciosPorVeterinaria.flat()

        const total = todosLosServicios.length
        const total_pages = Math.ceil(total / limitNum)
        const data = todosLosServicios.map(s => this.toDTO(s))

        return {
            page: pageNum,
            per_page: limitNum,
            totalServicios: total,
            totalVeterinarias: veterinarias.length,
            total_pages: total_pages,
            data: data
        };
    }

    async findByFilters(filtro,{page=1,limit=4}) {
            const pageNum = Math.max(Number(page), 1)
            const limitNum = Math.min(Math.max(Number(limit), 1), 100)
    
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
    
    
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const veterinariasPaginasID = veterinariaIds.slice(startIndex, endIndex);
            console.log("Veterinarias Paginas ID:", veterinariasPaginasID)
            let todosLosServiciosFiltradosDeEstosVeterinarias = serviciosVeterinarias.filter(s => veterinariasPaginasID.includes(s.usuarioProveedor.id))
    
            // Calcular totales basándose en los servicios después del filtro por veterinarias distintas
            const total = todosLosServiciosFiltradosDeEstosVeterinarias.length;
            const total_pages = Math.ceil(total / limitNum);
            
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

        await this.servicioVeterinariaRepository.save(nuevoServicioVeterinaria)

        return this.toDTO(nuevoServicioVeterinaria)
    }

    async delete(id) {
        const borrado = await this.servicioVeterinariaRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Servicio Veterinaria con id ${id} no encontrado`);
        }
        return borrado;
    }

    async cambiarEstadoServicioVet(id, nuevoEstado) {
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
            if(servicioVeterinaria.estado === EstadoServicio.DESACTIVADO) {
                throw new ConflictError(`Servicio Veterinaria con id ${id} ya está desactivada`);
            }
            servicioVeterinaria.estado = EstadoServicio.DESACTIVADO
        }
        await this.servicioVeterinariaRepository.save(servicioVeterinaria)
        return this.toDTO(servicioVeterinaria)
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
            estado: servicoVeterinaria.estado
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
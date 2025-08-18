import { Veterinaria } from "../models/entidades/Veterinaria.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"


export class VeterinariaService {

    constructor(veterinariaRepository, ciudadRepository, localidadRepository) {
        this.veterinariaRepository = veterinariaRepository
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
    }

    async findAll({page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let veterinarias = await this.veterinariaRepository.findByPage(pageNum, limit)

        const total = await this.veterinariaRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = veterinarias.map(a => this.toDTO(a))

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        };
    }

    async logIn(datos) {
        const {email, contrasenia} = datos

        if(!email || !contrasenia) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const usuario = await this.veterinariaRepository.findByEmail(email)
        if(!usuario) {
            throw new NotFoundError("Email o Contraseña incorrectas")
        }

        if(usuario.contrasenia != contrasenia) {
            throw new ValidationError("Email o Contraseña incorrectas")
        }

        return this.toDTO(usuario)
    }

    async create(veterinaria) {
        const { nombreUsuario, nombreClinica, email, contrasenia, telefono, direccion } = veterinaria

        if(!nombreUsuario || !nombreClinica || !email || !contrasenia || !telefono || !direccion) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const mailExistente = await this.veterinariaRepository.findByEmail(email)

        if(mailExistente) {
            throw new ConflictError(`Email ya registrado`)
        }

        const nombreUsuarioExistente = await this.veterinariaRepository.findByNombreUsuario(nombreUsuario)
        if(nombreUsuarioExistente) {
            throw new ConflictError(`Nombre de usuario ${nombreUsuario} ya registrado`)
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

        const nuevoVeterinaria = new Veterinaria(nombreUsuario, nombreClinica, email, objectDireccion, telefono, contrasenia)

        const veterinariaGuardada = await this.veterinariaRepository.save(nuevoVeterinaria)

        return this.toDTO(veterinariaGuardada)
    }

    async delete(id) {
        const borrado = await this.veterinariaRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Veterinaria con id ${id} no encontrado`);
        }
        return borrado;
    }

    async update(id, datos) {
        const veterinaria = await this.veterinariaRepository.findById(id)
        if(!veterinaria) {
            throw new NotFoundError(`Veterinaria con id ${id} no encontrado`)
        }

        if(datos.nombreUsuario) {
            veterinaria.nombreUsuario = datos.nombreUsuario
        }

        if (datos.telefono) {
            veterinaria.telefono = datos.telefono
        }

        if(datos.direccion) {
            veterinaria.direccion = datos.direccion
        }

        if(datos.email) {
            const otroMismoEmail = await this.veterinariaRepository.findByEmail(datos.email)
            if(otroMismoEmail && otroMismoEmail.id !== id) {
                throw new ConflictError(`Veterinaria con email ${datos.email} ya existe`)
            }

            veterinaria.email = datos.email
        }

        

        const actualizado = await this.veterinariaRepository.save(veterinaria)
        return this.toDTO(actualizado)
    }

    async updateNotificacion(id, notificacion) {
        const veterinaria = await this.veterinariaRepository.findById(id)
        if(!veterinaria) {
            throw new NotFoundError(`Veterinaria con id ${id} no encontrado`)
        }

        veterinaria.recibirNotificacion(notificacion)

        const actualizado = await this.veterinariaRepository.save(veterinaria)
        return this.toDTO(actualizado)
    }

    async getNotificacionesLeidasOnoLeidas(id, leida, { page=1, limit=5 }) {
        const veterinaria = await this.veterinariaRepository.findById(id)
        if(!veterinaria) {
            throw new NotFoundError(`Veterinaria con id ${id} no encontrado`)
        }

        leida = leida.toLowerCase()
        const notificaciones = veterinaria.notificaciones;

        let data
        if(leida == "true") {
            data = notificaciones.filter(n => n.leida).map(n => this.notificacionToDTO(n))
        } else if(leida == "false") {
            data = notificaciones.filter(n => !n.leida).map(n => this.notificacionToDTO(n))
        } else {
            throw new ValidationError(`${leida} no corresponde a true o false`)
        }

        const total = data.length
        const total_pages = Math.ceil(total / limit)
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const dataNew = data.slice(startIndex, endIndex)

        return {
            page: Number(page),
            per_page: Number(limit),
            total: total,
            total_pages: total_pages,
            data: dataNew
        }
    }

     async getAllNotificaciones(id, { page=1, limit=5 }) {
        console.log('🔍 getAllNotificaciones SERVICE - page:', page, 'type:', typeof page);
        const veterinaria = await this.veterinariaRepository.findById(id)
        if(!veterinaria) {
            throw new NotFoundError(`Veterinaria con id ${id} no encontrado`)
        }

        const notificaciones = veterinaria.notificaciones.map(n => this.notificacionToDTO(n))

        const total = notificaciones.length
        const total_pages = Math.ceil(total / limit)
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const dataNew = notificaciones.slice(startIndex, endIndex)

        const result = {
            page: Number(page),
            per_page: Number(limit),
            total: total,
            total_pages: total_pages,
            data: dataNew
        }
        console.log('🔍 getAllNotificaciones SERVICE - result.page:', result.page, 'type:', typeof result.page);
        return result
    } 

    async leerNotificacion(idUsuario, idNotificacion) {
        const veterinaria = await this.veterinariaRepository.findById(idUsuario)
        if(!veterinaria) {
            throw new NotFoundError(`Veterinaria con id ${id} no encontrado`)
        }

        const index = veterinaria.notificaciones.findIndex(n => n.id == idNotificacion)
        if(index == -1) {
            throw new NotFoundError(`Notificacion con ${idNotificacion} no encontrada`)
        }

        const notificacion = veterinaria.notificaciones[index]
        notificacion.leida = true
        notificacion.fechaLeida = new Date()
        veterinaria.notificaciones[index] = notificacion

        await this.veterinariaRepository.save(veterinaria)

        return this.notificacionToDTO(notificacion)
    }

    async marcarTodasLeidas(id) {
        const veterinaria = await this.veterinariaRepository.findById(id)
        if(!veterinaria) {
            throw new NotFoundError(`Veterinaria con id ${id} no encontrado`)
        }

        veterinaria.notificaciones.forEach(n => {
            if (!n.leida) {
                n.leida = true
                n.fechaLeida = new Date()
            }
        })

        await this.veterinariaRepository.save(veterinaria)

        return veterinaria.notificaciones.map(n => this.notificacionToDTO(n))
    }

    

    toDTO(veterinaria) {
        return {
            id: veterinaria.id,
            nombreUsuario: veterinaria.nombreUsuario,
            nombreClinica: veterinaria.nombreClinica,
            telefono: veterinaria.telefono,
            email: veterinaria.email,
            notificaciones: veterinaria.notificaciones,
            direccion: {
                calle: veterinaria.direccion.calle,
                altura: veterinaria.direccion.altura,
                localidad: {
                    nombre: veterinaria.direccion.localidad.nombre,
                    ciudad: veterinaria.direccion.localidad.ciudad.nombre // Esto debería funcionar si está poblado
                }
            }
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

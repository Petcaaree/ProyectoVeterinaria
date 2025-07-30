import { Cuidador } from "../models/entidades/Cuidador.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"


export class CuidadorService {

    constructor(cuidadorRepository, ciudadRepository, localidadRepository) {
        this.cuidadorRepository = cuidadorRepository
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
    }

    async findAll({page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let cuidadors = await this.cuidadorRepository.findByPage(pageNum, limit)

        const total = await this.cuidadorRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = cuidadors.map(a => this.toDTO(a))

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

        const usuario = await this.cuidadorRepository.findByEmail(email)
        if(!usuario) {
            throw new NotFoundError("Email o Contraseña incorrectas")
        }

        if(usuario.contrasenia != contrasenia) {
            throw new ValidationError("Email o Contraseña incorrectas")
        }

        return this.toDTO(usuario)
    }

    async create(cuidador) {
        const { nombreUsuario, email, contrasenia, telefono, direccion } = cuidador

        if(!nombreUsuario || !email || !contrasenia || !telefono || !direccion) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const mailExistente = await this.cuidadorRepository.findByEmail(email)

        if(mailExistente) {
            throw new ConflictError(`Email ya registrado`)
        }

        const nombreUsuarioExistente = await this.cuidadorRepository.findByNombreUsuario(nombreUsuario)
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

        const nuevoCuidador = new Cuidador(nombreUsuario, email,objectDireccion, telefono,  contrasenia)

        const cuidadorGuardado = await this.cuidadorRepository.save(nuevoCuidador)

        return this.toDTO(cuidadorGuardado)
    }

    async delete(id) {
        const borrado = await this.cuidadorRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Cuidador con id ${id} no encontrado`);
        }
        return borrado;
    }

    async update(id, datos) {
        const cuidador = await this.cuidadorRepository.findById(id)
        if(!cuidador) {
            throw new NotFoundError(`Cuidador con id ${id} no encontrado`)
        }

        if(datos.nombreUsuario) {
            cuidador.nombreUsuario = datos.nombreUsuario
        }

        if (datos.telefono) {
            cuidador.telefono = datos.telefono
        }

        if(datos.direccion) {
            cuidador.direccion = datos.direccion
        }

        if(datos.email) {
            const otroMismoEmail = await this.cuidadorRepository.findByEmail(datos.email)
            if(otroMismoEmail && otroMismoEmail.id !== id) {
                throw new ConflictError(`Cuidador con email ${datos.email} ya existe`)
            }

            cuidador.email = datos.email
        }

        

        const actualizado = await this.cuidadorRepository.save(cuidador)
        return this.toDTO(actualizado)
    }

    async updateNotificacion(id, notificacion) {
        const cuidador = await this.cuidadorRepository.findById(id)
        if(!cuidador) {
            throw new NotFoundError(`Cuidador con id ${id} no encontrado`)
        }

        cuidador.recibirNotificacion(notificacion)

        const actualizado = await this.cuidadorRepository.save(cuidador)
        return this.toDTO(actualizado)
    }

    async getNotificaciones(id, leida, { page=1, limit=5 }) {
        const cuidador = await this.cuidadorRepository.findById(id)
        if(!cuidador) {
            throw new NotFoundError(`Cuidador con id ${id} no encontrado`)
        }

        leida = leida.toLowerCase()
        const notificaciones = cuidador.notificaciones;

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
            page: page,
            per_page: limit,
            total: total,
            total_pages: total_pages,
            data: dataNew
        }
    }

    async leerNotificacion(idUsuario, idNotificacion) {
        const cuidador = await this.cuidadorRepository.findById(idUsuario)
        if(!cuidador) {
            throw new NotFoundError(`Cuidador con id ${id} no encontrado`)
        }

        const index = cuidador.notificaciones.findIndex(n => n.id == idNotificacion)
        if(index == -1) {
            throw new NotFoundError(`Notificacion con ${idNotificacion} no encontrada`)
        }

        const notificacion = cuidador.notificaciones[index]
        notificacion.leida = true
        notificacion.fechaLeida = new Date()
        cuidador.notificaciones[index] = notificacion

        await this.cuidadorRepository.save(cuidador)

        return this.notificacionToDTO(notificacion)
    }

    async marcarTodasLeidas(id) {
        const cuidador = await this.cuidadorRepository.findById(id)
        if(!cuidador) {
            throw new NotFoundError(`Cuidador con id ${id} no encontrado`)
        }

        cuidador.notificaciones.forEach(n => {
            if (!n.leida) {
                n.leida = true
                n.fechaLeida = new Date()
            }
        })

        await this.cuidadorRepository.save(cuidador)

        return cuidador.notificaciones.map(n => this.notificacionToDTO(n))
    }
    

    toDTO(cuidador) {
        return {
            id: cuidador.id,
            nombreUsuario: cuidador.nombreUsuario,
            telefono: cuidador.telefono,
            email: cuidador.email,
            notificaciones: cuidador.notificaciones,
            direccion: {
                calle: cuidador.direccion.calle,
                altura: cuidador.direccion.altura,
                localidad: {
                    nombre: cuidador.direccion.localidad.nombre,
                    ciudad: cuidador.direccion.localidad.ciudad.nombre // Esto debería funcionar si está poblado
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
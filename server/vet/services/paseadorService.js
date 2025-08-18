import { Paseador } from "../models/entidades/Paseador.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"


export class PaseadorService {
    constructor(paseadorRepository, ciudadRepository, localidadRepository) {
        this.paseadorRepository = paseadorRepository
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
    }

    async findAll({page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let paseadors = await this.paseadorRepository.findByPage(pageNum, limit)

        const total = await this.paseadorRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = paseadors.map(a => this.toDTO(a))

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

        const usuario = await this.paseadorRepository.findByEmail(email)
        if(!usuario) {
            throw new NotFoundError("Email o Contraseña incorrectas")
        }

        if(usuario.contrasenia != contrasenia) {
            throw new ValidationError("Email o Contraseña incorrectas")
        }

        return this.toDTO(usuario)
    }

    async create(paseador) {
        const { nombreUsuario, email, contrasenia, telefono, direccion } = paseador

        if(!nombreUsuario || !email || !contrasenia || !telefono || !direccion) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const mailExistente = await this.paseadorRepository.findByEmail(email)

        if(mailExistente) {
            throw new ConflictError(`Email ya registrado`)
        }

        const nombreUsuarioExistente = await this.paseadorRepository.findByNombreUsuario(nombreUsuario)
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

        const nuevoPaseador = new Paseador(nombreUsuario, email,objectDireccion, telefono,  contrasenia)

        const paseadorGuardado = await this.paseadorRepository.save(nuevoPaseador)

        return this.toDTO(paseadorGuardado)
    }

    async delete(id) {
        const borrado = await this.paseadorRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Paseador con id ${id} no encontrado`);
        }
        return borrado;
    }

    async update(id, datos) {
        const paseador = await this.paseadorRepository.findById(id)
        if(!paseador) {
            throw new NotFoundError(`Paseador con id ${id} no encontrado`)
        }

        if(datos.nombreUsuario) {
            paseador.nombreUsuario = datos.nombreUsuario
        }

        if (datos.telefono) {
            paseador.telefono = datos.telefono
        }

        if(datos.direccion) {
            paseador.direccion = datos.direccion
        }

        if(datos.email) {
            const otroMismoEmail = await this.paseadorRepository.findByEmail(datos.email)
            if(otroMismoEmail && otroMismoEmail.id !== id) {
                throw new ConflictError(`Paseador con email ${datos.email} ya existe`)
            }

            paseador.email = datos.email
        }

        

        const actualizado = await this.paseadorRepository.save(paseador)
        return this.toDTO(actualizado)
    }

    async updateNotificacion(id, notificacion) {
        const paseador = await this.paseadorRepository.findById(id)
        if(!paseador) {
            throw new NotFoundError(`Paseador con id ${id} no encontrado`)
        }

        paseador.recibirNotificacion(notificacion)

        const actualizado = await this.paseadorRepository.save(paseador)
        return this.toDTO(actualizado)
    }

     async getNotificacionesLeidasOnoLeidas(id, leida, { page=1, limit=5 }) {
        const paseador = await this.paseadorRepository.findById(id)
        if(!paseador) {
            throw new NotFoundError(`Paseador con id ${id} no encontrado`)
        }

        leida = leida.toLowerCase()
        const notificaciones = paseador.notificaciones;

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

    async getAllNotificaciones(id, { page=1, limit=5 }) {
        const paseador = await this.paseadorRepository.findById(id)
        if(!paseador) {
            throw new NotFoundError(`Paseador con id ${id} no encontrado`)
        }

        const notificaciones = paseador.notificaciones.map(n => this.notificacionToDTO(n))

        const total = notificaciones.length
        const total_pages = Math.ceil(total / limit)
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const dataNew = notificaciones.slice(startIndex, endIndex)

        return {
            page: page,
            per_page: limit,
            total: total,
            total_pages: total_pages,
            data: dataNew
        }
    }
    async leerNotificacion(idUsuario, idNotificacion) {
        const paseador = await this.paseadorRepository.findById(idUsuario)
        if(!paseador) {
            throw new NotFoundError(`Paseador con id ${id} no encontrado`)
        }

        const index = paseador.notificaciones.findIndex(n => n.id == idNotificacion)
        if(index == -1) {
            throw new NotFoundError(`Notificacion con ${idNotificacion} no encontrada`)
        }

        const notificacion = paseador.notificaciones[index]
        notificacion.leida = true
        notificacion.fechaLeida = new Date()
        paseador.notificaciones[index] = notificacion

        await this.paseadorRepository.save(paseador)

        return this.notificacionToDTO(notificacion)
    }

    async marcarTodasLeidas(id) {
        const paseador = await this.paseadorRepository.findById(id)
        if(!paseador) {
            throw new NotFoundError(`Paseador con id ${id} no encontrado`)
        }

        paseador.notificaciones.forEach(n => {
            if (!n.leida) {
                n.leida = true
                n.fechaLeida = new Date()
            }
        })

        await this.paseadorRepository.save(paseador)

        return paseador.notificaciones.map(n => this.notificacionToDTO(n))
    }

    

    toDTO(paseador) {
        return {
            id: paseador.id,
            nombreUsuario: paseador.nombreUsuario,
            telefono: paseador.telefono,
            email: paseador.email,
            notificaciones: paseador.notificaciones,
            direccion: {
                calle: paseador.direccion.calle,
                altura: paseador.direccion.altura,
                localidad: {
                    nombre: paseador.direccion.localidad.nombre,
                    ciudad: paseador.direccion.localidad.ciudad.nombre // Esto debería funcionar si está poblado
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

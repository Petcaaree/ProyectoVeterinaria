import { Cuidador } from "../models/entidades/Cuidador.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"


export class CuidadorService {

    constructor(cuidadorRepository, localidadRepository, ciudadRepository) {
        this.cuidadorRepository = cuidadorRepository
        this.localidadRepository = localidadRepository
        this.ciudadRepository = ciudadRepository
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

        const nuevoCuidador = new Cuidador(nombreUsuario, email,objectDireccion, telefono,  contrasenia)

        await this.cuidadorRepository.save(nuevoCuidador)

        return this.toDTO(nuevoCuidador)
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

     async updateNotificacionLeida(id, idNotificacion) {
          const cuidador = await this.cuidadorRepository.findById(id)
          if(!cuidador) {
              throw new NotFoundError(`Cuidador con id ${id} no encontrado`)
          }
          const notificacion = cuidador.notificaciones.find(n => n.id == idNotificacion)
          if(!notificacion) {
              throw new NotFoundError(`Notificacion con id ${idNotificacion} no encontrada`)
          }
          notificacion.leida = true
          notificacion.fechaLeida = new Date()
          cuidador.notificaciones[indexNotificacion] = notificacion
          const actualizado = await this.cuidadorRepository.save(cuidador)
          return this.toDTO(actualizado)
      }


    async getNotificaciones(id, leida, page, limit) {
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

    

    toDTO(cuidador) {
        return {
            id: cuidador.id,
            nombre: cuidador.nombreUsuario,
            apellido: cuidador.direccion,
            telefono: cuidador.telefono,
            email: cuidador.email,
            direccion: {
                calle: cuidador.direccion.calle,
                altura: cuidador.direccion.altura,
                ciudad: {
                    nombre: cuidador.direccion.ciudad.nombre,
                    localidad: cuidador.direccion.ciudad.localidad.nombre
                }
            },
            notificaciones: cuidador.notificaciones,
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
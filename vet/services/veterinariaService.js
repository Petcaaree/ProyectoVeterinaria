import { Veterinaria } from "../models/entidades/Veterinaria.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"


export class VeterinariaService {

    constructor(veterinariaRepository, localidadRepository, ciudadRepository) {
        this.veterinariaRepository = veterinariaRepository
        this.localidadRepository = localidadRepository
        this.ciudadRepository = ciudadRepository
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
        const { nombreUsuario, email, contrasenia, telefono, direccion } = veterinaria

        if(!nombreUsuario || !email || !contrasenia || !telefono || !direccion) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const mailExistente = await this.veterinariaRepository.findByEmail(email)

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

        const nuevoVeterinaria = new Veterinaria(nombreUsuario, email,objectDireccion, telefono,  contrasenia)

        await this.veterinariaRepository.save(nuevoVeterinaria)

        return this.toDTO(nuevoVeterinaria)
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

     async updateNotificacionLeida(id, idNotificacion) {
          const veterinaria = await this.veterinariaRepository.findById(id)
          if(!veterinaria) {
              throw new NotFoundError(`Veterinaria con id ${id} no encontrado`)
          }
          const notificacion = veterinaria.notificaciones.find(n => n.id == idNotificacion)
          if(!notificacion) {
              throw new NotFoundError(`Notificacion con id ${idNotificacion} no encontrada`)
          }
          notificacion.leida = true
          notificacion.fechaLeida = new Date()
          veterinaria.notificaciones[indexNotificacion] = notificacion
          const actualizado = await this.veterinariaRepository.save(veterinaria)
          return this.toDTO(actualizado)
      }


    async getNotificaciones(id, leida, page, limit) {
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
            page: page,
            per_page: limit,
            total: total,
            total_pages: total_pages,
            data: dataNew
        }
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

    

    toDTO(veterinaria) {
        return {
            id: veterinaria.id,
            nombre: veterinaria.nombreUsuario,
            apellido: veterinaria.direccion,
            telefono: veterinaria.telefono,
            email: veterinaria.email,
            notificaciones: veterinaria.notificaciones,
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
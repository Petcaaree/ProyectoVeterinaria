import { Cliente } from "../models/entidades/Cliente.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"


export class ClienteService {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository
    }

    async findAll({page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let clientes = await this.clienteRepository.findByPage(pageNum, limit)

        const total = await this.clienteRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = clientes.map(a => this.toDTO(a))

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

        const usuario = await this.clienteRepository.findByEmail(email)
        if(!usuario) {
            throw new NotFoundError("Email o Contraseña incorrectas")
        }

        if(usuario.contrasenia != contrasenia) {
            throw new ValidationError("Email o Contraseña incorrectas")
        }

        return this.toDTO(usuario)
    }

    async create(cliente) {
        const { nombreUsuario, email, contrasenia, telefono, direccion } = cliente

        if(!nombreUsuario || !email || !contrasenia || !telefono || !direccion) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const mailExistente = await this.clienteRepository.findByEmail(email)

        if(mailExistente) {
            throw new ConflictError(`Email ya registrado`)
        }

        const nuevoCliente = new Cliente(nombreUsuario, email, telefono, direccion, contrasenia)

        await this.clienteRepository.save(nuevoCliente)

        return this.toDTO(nuevoCliente)
    }

    async delete(id) {
        const borrado = await this.clienteRepository.deleteById(id)
        if(!borrado){
            throw new NotFoundError(`Cliente con id ${id} no encontrado`);
        }
        return borrado;
    }

    async update(id, datos) {
        const cliente = await this.clienteRepository.findById(id)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${id} no encontrado`)
        }

        if(datos.nombreUsuario) {
            cliente.nombreUsuario = datos.nombreUsuario
        }

        if (datos.telefono) {
            cliente.telefono = datos.telefono
        }

        if(datos.direccion) {
            cliente.direccion = datos.direccion
        }

        if(datos.email) {
            const otroMismoEmail = await this.clienteRepository.findByEmail(datos.email)
            if(otroMismoEmail && otroMismoEmail.id !== id) {
                throw new ConflictError(`Cliente con email ${datos.email} ya existe`)
            }

            cliente.email = datos.email
        }

        if(datos.mascotas) {
            cliente.mascotas = datos.mascotas
        }

        const actualizado = await this.clienteRepository.save(cliente)
        return this.toDTO(actualizado)
    }

    async updateNotificacion(id, notificacion) {
        const cliente = await this.clienteRepository.findById(id)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${id} no encontrado`)
        }

        cliente.recibirNotificacion(notificacion)

        const actualizado = await this.clienteRepository.save(cliente)
        return this.toDTO(actualizado)
    }

     async updateNotificacionLeida(id, idNotificacion) {
          const cliente = await this.clienteRepository.findById(id)
          if(!cliente) {
              throw new NotFoundError(`Cliente con id ${id} no encontrado`)
          }
          const notificacion = cliente.notificaciones.find(n => n.id == idNotificacion)
          if(!notificacion) {
              throw new NotFoundError(`Notificacion con id ${idNotificacion} no encontrada`)
          }
          notificacion.leida = true
          notificacion.fechaLeida = new Date()
          cliente.notificaciones[indexNotificacion] = notificacion
          const actualizado = await this.clienteRepository.save(cliente)
          return this.toDTO(actualizado)
      }


    async getNotificaciones(id, leida, page, limit) {
        const cliente = await this.clienteRepository.findById(id)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${id} no encontrado`)
        }

        leida = leida.toLowerCase()
        const notificaciones = cliente.notificaciones;

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
        const cliente = await this.clienteRepository.findById(idUsuario)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${id} no encontrado`)
        }

        const index = cliente.notificaciones.findIndex(n => n.id == idNotificacion)
        if(index == -1) {
            throw new NotFoundError(`Notificacion con ${idNotificacion} no encontrada`)
        }

        const notificacion = cliente.notificaciones[index]
        notificacion.leida = true
        notificacion.fechaLeida = new Date()
        cliente.notificaciones[index] = notificacion

        await this.clienteRepository.save(cliente)

        return this.notificacionToDTO(notificacion)
    }

    async getMascotas(idUsuario) {
        const mascotas = await this.clienteRepository.findMascotasByCliente(idUsuario)
        if(!mascotas) {
            throw new NotFoundError(`No se encontraron mascotas para el cliente con id ${idUsuario}`)
        }

        return mascotas.map(m => this.mascotaToDTO(m))
    }


    async updateMascota(idUsuario, mascotaActualizada) {
        const cliente = await this.clienteRepository.findById(idUsuario)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${idUsuario} no encontrado`)
        }

        const mascotaExistente = await this.clienteRepository.findByMascota(mascotaActualizada.id)
        if(!mascotaExistente) {
            throw new NotFoundError(`Mascota con id ${mascotaActualizada.id} no encontrada`)
        }

        if (mascotaActualizada.nombre) {
            mascotaExistente.nombre = mascotaActualizada.nombre
        }

        if (mascotaActualizada.tipo) {
            mascotaExistente.tipo = mascotaActualizada.tipo
        }
        if (mascotaActualizada.raza) {
            mascotaExistente.raza = mascotaActualizada.raza
        }
        if (mascotaActualizada.edad) {
            mascotaExistente.edad = mascotaActualizada.edad
        }
        if (mascotaActualizada.peso) {
            mascotaExistente.peso = mascotaActualizada.peso
        }
        if (mascotaActualizada.fotos) {
            mascotaExistente.fotos = mascotaActualizada.fotos
        }

        const indexMascota = cliente.mascotas.findIndex(m => m.id == mascotaExistente.id)
       

        cliente.mascotas[indexMascota] = mascotaExistente
        await this.clienteRepository.save(cliente)

        return this.mascotaToDTO(mascotaExistente)
    }

    async addMascotaCreada(idUsuario, mascota) {
        const cliente = await this.clienteRepository.findById(idUsuario)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${idUsuario} no encontrado`)
        }

        cliente.agregarMascota(mascota)

        await this.clienteRepository.save(cliente)

        return this.mascotaToDTO(mascota)
    }

    async eliminarMascota(idUsuario, idMascota) {
        const cliente = await this.clienteRepository.findById(idUsuario)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${idUsuario} no encontrado`)
        }

        const mascota = cliente.mascotas.find(m => m.id == idMascota)
        if(!mascota) {
            throw new NotFoundError(`Mascota con id ${idMascota} no encontrada`)
        }

        cliente.eliminarMascota(mascota)
        await this.clienteRepository.save(cliente)
    }

    toDTO(cliente) {
        return {
            id: cliente.id,
            nombre: cliente.nombreUsuario,
            apellido: cliente.direccion,
            telefono: cliente.telefono,
            email: cliente.email,
            notificaciones: cliente.notificaciones,
            mascotas: cliente.mascotas
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

    mascotaToDTO(mascota) {
        return {
            id: mascota.id,
            nombre: mascota.nombre,
            tipo: mascota.tipo,
            raza: mascota.raza,
            edad: mascota.edad,
            peso: mascota.peso, // Peso en kg
            fotos: mascota.fotos // URL de la foto
        }
    }

   
}
import { Cliente } from "../models/entidades/Cliente.js"
import { Localidad } from "../models/entidades/Localidad.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Direccion } from "../models/entidades/Direccion.js"
import { Mascota } from "../models/entidades/Mascota.js"
import { Notificacion } from "../models/entidades/Notificacion.js"
import { ValidationError, ConflictError, NotFoundError } from "../errors/AppError.js"


export class ClienteService {
    constructor(clienteRepository, ciudadRepository, localidadRepository, reservaRepository) {
        this.clienteRepository = clienteRepository
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
        this.reservaRepository = reservaRepository
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

        const nombreUsuarioExistente = await this.clienteRepository.findByNombreUsuario(nombreUsuario)
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
        } else if (localidadExistente.ciudad.id !== ciudadExistente.id) {
            localidadExistente.ciudad = ciudadExistente
            localidadExistente = await this.localidadRepository.save(localidadExistente)
        }

        const objectDireccion = new Direccion(direccion.calle, direccion.altura, localidadExistente)

        const nuevoCliente = new Cliente(nombreUsuario, email, objectDireccion, telefono, contrasenia)

        const clienteGuardado = await this.clienteRepository.save(nuevoCliente)

        return this.toDTO(clienteGuardado)
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

    /* async updateNotificacion(id, notificacion) {
        const cliente = await this.clienteRepository.findById(id)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${id} no encontrado`)
        }

        cliente.recibirNotificacion(notificacion)

        const actualizado = await this.clienteRepository.save(cliente)
        return this.toDTO(actualizado)
    } */




    async getNotificaciones(id, leida, { page=1, limit=5 }) {
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

    async marcarTodasLeidas(id) {
        const cliente = await this.clienteRepository.findById(id)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${id} no encontrado`)
        }

        cliente.notificaciones.forEach(n => {
            if (!n.leida) {
                n.leida = true
                n.fechaLeida = new Date()
            }
        })

        await this.clienteRepository.save(cliente)

        return cliente.notificaciones.map(n => this.notificacionToDTO(n))
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
        const { nombre, tipo, raza, edad, peso, fotos } = mascota
        if(!nombre || !tipo || !raza || !edad || !peso || !fotos) {
            throw new ValidationError("Faltan datos obligatorios para crear la mascota")
        }
        const mascotaCreada = new Mascota(nombre, tipo, edad, raza, peso, fotos)
        cliente.agregarMascota(mascotaCreada)

        await this.clienteRepository.save(cliente)

        return this.mascotaToDTO(mascota)
    }

    async eliminarMascota(idUsuario, idMascota) {
        const cliente = await this.clienteRepository.findById(idUsuario)
        if(!cliente) {
            throw new NotFoundError(`Cliente con id ${idUsuario} no encontrado`)
        }

        console.log(cliente.mascotas)

        const mascota = cliente.mascotas.find(m => m._id.toString() == idMascota)
        if(!mascota) {
            throw new NotFoundError(`Mascota con id ${idMascota} no encontrada`)
        }

        const totalReservas = await this.reservaRepository.findAllByMacota(idMascota)
        if (totalReservas.length > 0) {
            throw new ConflictError(`No se puede eliminar la mascota porque tiene reservas activas`)
        }

        cliente.eliminarMascota(mascota)
        const clienteConMascotaBorrada = await this.clienteRepository.save(cliente)
        return this.toDTO(clienteConMascotaBorrada)
    }

    toDTO(cliente) {
        return {
            id: cliente.id,
            nombreUsuario: cliente.nombreUsuario,
            telefono: cliente.telefono,
            email: cliente.email,
            notificaciones: cliente.notificaciones,
            direccion: {
                calle: cliente.direccion.calle,
                altura: cliente.direccion.altura,
                localidad: {
                    nombre: cliente.direccion.localidad.nombre,
                    ciudad: cliente.direccion.localidad.ciudad.nombre // Esto debería funcionar si está poblado
                }
            },
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
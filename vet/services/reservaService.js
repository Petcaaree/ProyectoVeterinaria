import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { RangoFechas } from "../models/entidades/RangoFechas.js"
import { Reserva } from "../models/entidades/Reserva.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { EstadoReserva } from "../models/entidades/enums/EstadoReserva.js";
import {ServicioOfrecido} from "../models/entidades/enums/ServiciOfrecido.js"
import { FechaHorarioTurno } from "../models/entidades/FechaHorarioTurno.js";


dayjs.extend(customParseFormat)

export class ReservaService {
    constructor(reservaRepository, servicioVeterinariaRepository, servicioCuidadorRepository, servicioPaseadorRepository, clienteRepository, cuidadorRepository, paseadorRepository, veterinariaRepository) {
        this.reservaRepository = reservaRepository
        this.servicioVeterinariaRepository = servicioVeterinariaRepository
        this.servicioCuidadorRepository = servicioCuidadorRepository
        this.servicioPaseadorRepository = servicioPaseadorRepository
        this.clienteRepository = clienteRepository
        this.cuidadorRepository = cuidadorRepository
        this.paseadorRepository = paseadorRepository
        this.veterinariaRepository = veterinariaRepository
    }

    async findAll({page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        const reservas = await this.reservaRepository.findAll();

        // Aplicar paginación manualmente en el servicio
        const skip = (pageNum - 1) * limitNum;
        const reservasPaginadas = reservas.slice(skip, skip + limitNum);

        const total = reservas.length;
        const total_pages = Math.ceil(total / limitNum);
        const data = reservasPaginadas.map(r => this.toDTO(r));

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        };
    }

    async findById(id) {
        let reserva = await this.reservaRepository.findById(id);
        return reserva ? this.toDTO(reserva) : null;
    }

    async findByCliente({page = 1, limit = 10, id}) {

        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        const cliente = await this.clienteRepository.findById(id)
        if(!cliente) {
            throw new NotFoundError("Cliente no existente")
        }



        const reservas = await this.reservaRepository.findByCliente(pageNum, limitNum, id)

        const total = reservas.length;
        const total_pages = Math.ceil(total / limitNum);

        const data = reservas.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(r => this.toDTO(r))

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        }
    }

    async findByProveedorServicio(id, {page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        const veterinaria = await this.veterinariaRepository.findById(id)
        const cuidador = await this.cuidadorRepository.findById(id)
        const paseador = await this.paseadorRepository.findById(id)

        if (!veterinaria && !cuidador && !paseador) {
            throw new NotFoundError("Proveedor de servicio no encontrado")
        }

        let servicios

        if (veterinaria) {
            servicios = await this.servicioVeterinariaRepository.findByVeterinariaId(id)
        } else if (cuidador) {
             servicios = await this.servicioCuidadorRepository.findByCuidadorId(id)
        } else if (paseador) {
             servicios = await this.servicioPaseadorRepository.findByPaseadorId(id)
        }

        const serviciosIds = servicios.map(s => s.id)

        const reservas = await this.reservaRepository.findByUsuarioProveedor(serviciosIds)

        const total = reservas.length
        const total_pages = Math.ceil(total / limitNum);
        const data = reservas.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(r => this.toDTO(r))

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        }
    }

    async create(reserva) {
        const { clienteId, serviciOfrecido, servicioReservadoId, IdMascota, rangoFechas, horario, notaAdicional, nombreDeContacto, telefonoContacto, emailContacto } = reserva

        // Validar datos obligatorios básicos (sin horario, que es condicional)
        if(!clienteId || !serviciOfrecido || !servicioReservadoId || !IdMascota || !rangoFechas || !notaAdicional || !nombreDeContacto || !telefonoContacto || !emailContacto) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        
        // Validar horario solo si NO es un servicio de cuidador
        if (serviciOfrecido !== ServicioOfrecido.SERVICIOCUIDADOR && (horario === undefined || horario === '' || horario === null)) {
            throw new ValidationError("El horario es obligatorio para servicios de veterinaria y paseador")
        }

       

        const cliente = await this.clienteRepository.findById(clienteId)
        if(!cliente) {
            throw new NotFoundError("Cliente no existente")
        }
        
        const mascota = await this.clienteRepository.findMascotaByCliente(clienteId, IdMascota)


        let servicio;
        if (serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
             servicio = await this.servicioVeterinariaRepository.findById(servicioReservadoId)
        } else if (serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
             servicio = await this.servicioCuidadorRepository.findById(servicioReservadoId)
        } else if (serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
             servicio = await this.servicioPaseadorRepository.findById(servicioReservadoId)
        }

        if (servicio.mascotasAceptadas && !servicio.mascotasAceptadas.includes(mascota.tipo)) {
            throw new ValidationError("La mascota no es aceptada por el servicio");
        }

        if(!servicio) {
            throw new NotFoundError("Servicio no existente")
        }

        const parsearFecha = (fechaStr, formato) => {
            const fecha = dayjs(fechaStr, formato, true) // true = modo estricto
            if (!fecha.isValid()) {
                throw new ValidationError(`Fecha inválida: ${fechaStr}. Formato requerido: ${formato}`);
            }
            return fecha.toDate();
        };


        const objectFechas = new RangoFechas(
            parsearFecha(rangoFechas.fechaInicio, "DD/MM/YYYY"),
            parsearFecha(rangoFechas.fechaFin, "DD/MM/YYYY")
        )

        if (serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
            
            if (!servicio.estasDisponibleEn(objectFechas)) {
            throw new ValidationError("El servicio no está disponible en las fechas indicadas")
            }
            servicio.agregarFechasReserva(objectFechas)
        } else {
            const objectFechaHorarioTurno = new FechaHorarioTurno(
                parsearFecha(rangoFechas.fechaInicio, "DD/MM/YYYY"),
                horario
            )
            if (!servicio.estaDisponibleParaFechaYHorario(objectFechaHorarioTurno)) {
                throw new ValidationError("El servicio no está disponible en el horario indicado")
            } else {
                servicio.agregarFechasReserva(objectFechaHorarioTurno)
            }
        }
        

        const fechaActual = new Date()

        let nuevaReserva;

        if (horario === "null"){
         nuevaReserva = new Reserva(cliente, servicio, mascota, objectFechas,  null, notaAdicional, serviciOfrecido, nombreDeContacto, telefonoContacto, emailContacto, fechaActual);
        } else {
             nuevaReserva = new Reserva(cliente, servicio, mascota, objectFechas, horario, notaAdicional, serviciOfrecido, nombreDeContacto, telefonoContacto, emailContacto, fechaActual);
        }
        
        const proveedorActualizado = nuevaReserva.notificar()
        if (serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
            await this.servicioCuidadorRepository.save(servicio)
            if (proveedorActualizado) {
                await this.cuidadorRepository.save(proveedorActualizado)
            }
        } else if (serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
            await this.servicioVeterinariaRepository.save(servicio)
            if (proveedorActualizado) {
                await this.veterinariaRepository.save(proveedorActualizado)
            }
        } else if (serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
            await this.servicioPaseadorRepository.save(servicio)
            if (proveedorActualizado) {
                await this.paseadorRepository.save(proveedorActualizado)
            }
        }
        await this.reservaRepository.save(nuevaReserva)
        return this.toDTO(nuevaReserva)
    }

    async modificarEstado(idUsuario, idReserva, nuevoEstado, motivo=null) {
        nuevoEstado = nuevoEstado.toUpperCase()
        const reserva = await this.reservaRepository.findById(idReserva)
        if(!reserva) {
            throw new NotFoundError(`Reserva ${idReserva} inexistente`)
        }

        if(nuevoEstado == "CONFIRMADA") {
            if(reserva.estado == EstadoReserva.CONFIRMADA) {
                throw new ValidationError("Reserva ya confirmada")
            }
            
            const anfitrion = await this.anfitrionRepository.findById(idUsuario)
            if(!anfitrion) {
                throw new NotFoundError("Anfitrion no encontrado")
            }
            if(anfitrion.nombre !== reserva.alojamiento.anfitrion.nombre) {
                throw new ValidationError("Anfitrion pasado no corresponde al del alojamiento")
            }

            const huespedActualizado = reserva.notificarCambioEstado(EstadoReserva.CONFIRMADA)
            await this.huespedRepository.save(huespedActualizado)
            await this.reservaRepository.save(reserva)
        
        } else if(nuevoEstado == "CANCELADA") {
            if(reserva.estado == EstadoReserva.CANCELADA) {
                throw new ValidationError("Reserva ya cancelada")
            }

            const huesped = await this.huespedRepository.findById(idUsuario)
            if(!huesped) {
                throw new NotFoundError("Huesped no encontrado")
            }
            if(huesped.nombre !== reserva.huespedReservador.nombre) {
                throw new ValidationError("Huesped pasado no corresponde al de la reserva")
            }

            const fechaActual = new Date()
            if(reserva.rangoFechas.fechaInicio < fechaActual) {
                throw new ValidationError("No se puede cancelar luego de pasada la fecha inicio")
            }

            const fechasReserva = reserva.rangoFechas
            const alojamiento = reserva.alojamiento

            alojamiento.eliminarFechasReserva(fechasReserva)
            await this.alojamientoRepository.save(alojamiento)

            const anfitrionActualizado = reserva.notificarCambioEstado(EstadoReserva.CANCELADA, motivo)
            await this.anfitrionRepository.save(anfitrionActualizado)
            await this.reservaRepository.save(reserva)

        } else {
            throw new ValidationError(`Estado ${nuevoEstado} desconocido`)
        }
    }

    async update(reserva, idHuesped) {
        const {idReserva, cantHuespedes, rangoFechas} = reserva
        if(!idReserva || !cantHuespedes || !rangoFechas) {
            throw new ValidationError("Faltan datos obligatorios")
        }

        const reservaExistente = await this.reservaRepository.findById(idReserva)
        if(!reservaExistente) {
            throw new NotFoundError("Reserva no existente")
        }

        const huespedExistente = await this.huespedRepository.findById(idHuesped)
        if(!huespedExistente) {
            throw new NotFoundError("Huesped no existente")
        }
        if(reserva.huespedReservador.nombre !== huespedExistente.nombre) {
            throw new ValidationError(`La reserva no esta a nombre del huesped ${huespedExistente.nombre}`)
        }

        const alojamiento = reserva.alojamiento

        const objectFechas = new RangoFechas(
            dayjs(rangoFechas.fechaInicio, "DD/MM/YYYY"),
            dayjs(rangoFechas.fechaFin, "DD/MM/YYYY")
        )
        
        if (!alojamiento.puedenAlojarse(cantHuespedes)) {
            throw new ValidationError("Cantidad de huéspedes supera la capacidad")
        }
        
        if (!alojamiento.estasDisponibleEn(objectFechas)) {
            throw new ValidationError("El alojamiento no está disponible en las fechas indicadas")
        }
        
        const anfitrionActualizado = reservaExistente.notificarActualizacion()
        await this.anfitrionRepository.save(anfitrionActualizado)

        reservaExistente.cantHuespedes = cantHuespedes
        reservaExistente.rangoFechas = objectFechas

        await this.reservaRepository.save(reservaExistente)
        return this.toDTO(reservaExistente)
    }

    async delete(id) {
        const borrado = await this.reservaRepository.deleteById(id);
        if(!borrado){
            throw new NotFoundError(`Reserva con id ${id} no encontrado`);
        }
        return borrado;
    }

    toDTO(reserva) {
        const fechaInicio = dayjs(reserva.rangoFechas.fechaInicio).format("DD/MM/YYYY");
        const fechaFin = dayjs(reserva.rangoFechas.fechaFin).format("DD/MM/YYYY");

        
        return {
            id: reserva.id,
            cliente: {
                nombreUsuario: reserva.cliente.nombreUsuario,
                email: reserva.cliente.email
            },
            mascota: reserva.mascota,
            serviciOfrecido: reserva.serviciOfrecido,
            servicioReservado: reserva.servicioReservado,
            rangoFechas: {
                fechaInicio: fechaInicio,
                fechaFin: fechaFin
            },
            estado: reserva.estado,
            horario: reserva.horario,
            notaAdicional: reserva.notaAdicional,
            cantidadDias: reserva.cantidadDias,
            nombreDeContacto: reserva.nombreDeContacto,
            telefonoContacto: reserva.telefonoContacto,
            emailContacto: reserva.emailContacto,
            fechaAlta: reserva.fechaAlta
        }
    }
}
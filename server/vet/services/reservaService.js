import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { RangoFechas } from "../models/entidades/RangoFechas.js"
import { Reserva } from "../models/entidades/Reserva.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { EstadoReserva } from "../models/entidades/enums/EstadoReserva.js";
import {ServicioOfrecido} from "../models/entidades/enums/ServiciOfrecido.js"
import { FechaHorarioTurno } from "../models/entidades/FechaHorarioTurno.js";
import { FactoryNotificacion } from "../models/entidades/FactorYNotificacion.js";
import { enviarEmailReservaConfirmada, enviarEmailReservaCancelada } from "./emailService.js";
import logger from "../utils/logger.js";


dayjs.extend(customParseFormat)

export class ReservaService {
    constructor(reservaRepository, servicioVeterinariaRepository, servicioCuidadorRepository, servicioPaseadorRepository, clienteRepository, cuidadorRepository, paseadorRepository, veterinariaRepository, reservaPendienteRepository) {
        this.reservaRepository = reservaRepository
        this.servicioVeterinariaRepository = servicioVeterinariaRepository
        this.servicioCuidadorRepository = servicioCuidadorRepository
        this.servicioPaseadorRepository = servicioPaseadorRepository
        this.clienteRepository = clienteRepository
        this.cuidadorRepository = cuidadorRepository
        this.paseadorRepository = paseadorRepository
        this.veterinariaRepository = veterinariaRepository
        this.reservaPendienteRepository = reservaPendienteRepository
    }

    // Ventana (minutos) durante la cual la ReservaPendiente mantiene el cupo bloqueado.
    // Si el pago no se completa antes, el job de limpieza libera el slot.
    static PENDIENTE_TTL_MINUTOS = 30;

    async findAll({page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        const reservas = await this.reservaRepository.findAll();

        // Invertir array para mostrar las más recientes primero
        const reservasInvertidas = reservas.reverse();

        // Aplicar paginación manualmente en el servicio
        const skip = (pageNum - 1) * limitNum;
        const reservasPaginadas = reservasInvertidas.slice(skip, skip + limitNum);

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

    async findByCliente({page = 1, limit = 4}, id, estado) {

        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        const cliente = await this.clienteRepository.findById(id)
        if(!cliente) {
            throw new NotFoundError("Cliente no existente")
        }


        let reservas
        let total
        let total_pages
        let data

        if (estado === 'TODAS') {
            reservas = await this.reservaRepository.findByCliente( cliente)
            // Invertir array para mostrar las más recientes primero
            reservas = reservas.reverse()
            total = reservas.length
            total_pages = Math.ceil(total / limitNum)
            data = reservas.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(r => this.toDTO(r))
        } else   {
            reservas = await this.reservaRepository.findByClienteByEstado(cliente, estado)
            // Invertir array para mostrar las más recientes primero
            reservas = reservas.reverse()
             total = reservas.length;
             total_pages = Math.ceil(total / limitNum);
             data = reservas.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(r => this.toDTO(r))
        }

        
        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        }
    }



    async findByProveedorServicio(id, estado,{page = 1, limit = 4}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        const veterinaria = await this.veterinariaRepository.findById(id)
        const cuidador = await this.cuidadorRepository.findById(id)
        const paseador = await this.paseadorRepository.findById(id)

        if (!veterinaria && !cuidador && !paseador) {
            throw new NotFoundError("Proveedor de servicio no encontrado")
        }

        

        /* if (estado === 'TODAS') {
            if (veterinaria) {
            reservas = await this.reservaRepository.findByProveedor(pageNum, limitNum, veterinaria)
            } else if (cuidador) {
                reservas = await this.reservaRepository.findByProveedor(pageNum, limitNum, cuidador)
            } else if (paseador) {
                reservas = await this.reservaRepository.findByProveedor(pageNum, limitNum, paseador)
            }
              total = reservas.length
             total_pages = Math.ceil(total / limitNum);
            data = reservas.map(r => this.toDTO(r))

        }else {
            if (veterinaria) {
            reservas = await this.reservaRepository.findByProveedorByEstado(veterinaria, estado)
            } else if (cuidador) {
                reservas = await this.reservaRepository.findByProveedorByEstado(cuidador, estado)
            } else if (paseador) {
                reservas = await this.reservaRepository.findByProveedorByEstado(paseador, estado)
            }
              total = reservas.length
            total_pages = Math.ceil(total / limitNum);
            data = reservas.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(r => this.toDTO(r))
        } */


         let servicios

             if (veterinaria) {
                 servicios = await this.servicioVeterinariaRepository.findByVeterinariaId(id)
             } else if (cuidador) {
                 servicios = await this.servicioCuidadorRepository.findByCuidadorId(id)
            } else if (paseador) {
             servicios = await this.servicioPaseadorRepository.findByPaseadorId(id)
            }

        const serviciosIds = servicios.map(s => s.id)
        let reservas
        let total
        let total_pages
        let data
        if (estado === 'TODAS') {
            reservas = await this.reservaRepository.findByUsuarioProveedorByPage( serviciosIds)
            // Invertir array para mostrar las más recientes primero
            reservas = reservas.reverse()
            total = reservas.length
             total_pages = Math.ceil(total / limitNum);
            data = reservas.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(r => this.toDTO(r))
        } else{
             reservas = await this.reservaRepository.findByProveedorByEstado(serviciosIds, estado)
            // Invertir array para mostrar las más recientes primero
            reservas = reservas.reverse()
            total = reservas.length
            total_pages = Math.ceil(total / limitNum);
            data = reservas.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(r => this.toDTO(r))
        
        }

        

        
        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        }
    }

    // Crea una ReservaPendiente que bloquea el cupo mientras dura el checkout de MP.
    // Nunca crea una Reserva definitiva — eso sólo ocurre cuando el pago se aprueba,
    // vía crearDesdePendiente(). Si el usuario abandona el checkout, el job de
    // limpieza llama a revertirPendiente() y libera el slot.
    async crearPendiente(datos) {
        const { clienteId, serviciOfrecido, servicioReservadoId, IdMascota, rangoFechas, horario, notaAdicional, nombreDeContacto, telefonoContacto, emailContacto } = datos

        if(!clienteId || !serviciOfrecido || !servicioReservadoId || !IdMascota || !rangoFechas  || !nombreDeContacto || !telefonoContacto || !emailContacto) {
            const faltantes = []
            if (!clienteId) faltantes.push("clienteId")
            if (!serviciOfrecido) faltantes.push("serviciOfrecido")
            if (!servicioReservadoId) faltantes.push("servicioReservadoId")
            if (!IdMascota) faltantes.push("IdMascota")
            if (!rangoFechas) faltantes.push("rangoFechas")
            if (!nombreDeContacto) faltantes.push("nombreDeContacto")
            if (!telefonoContacto) faltantes.push("telefonoContacto")
            if (!emailContacto) faltantes.push("emailContacto")
            throw new ValidationError(`Faltan datos obligatorios: ${faltantes.join(", ")}`)
        }

        if (serviciOfrecido !== ServicioOfrecido.SERVICIOCUIDADOR && (horario === undefined || horario === '' || horario === null)) {
            throw new ValidationError("El horario es obligatorio para servicios de veterinaria y paseador")
        }

        const cliente = await this.clienteRepository.findById(clienteId)
        if(!cliente) throw new NotFoundError("Cliente no existente")

        const mascota = await this.clienteRepository.findMascotaByCliente(clienteId, IdMascota)

        let servicio;
        if (serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
            servicio = await this.servicioVeterinariaRepository.findById(servicioReservadoId)
        } else if (serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
            servicio = await this.servicioCuidadorRepository.findById(servicioReservadoId)
        } else if (serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
            servicio = await this.servicioPaseadorRepository.findById(servicioReservadoId)
        }

        if (!servicio) throw new NotFoundError("Servicio no existente")

        if (servicio.mascotasAceptadas && !servicio.mascotasAceptadas.includes(mascota.tipo)) {
            throw new ValidationError("La mascota no es aceptada por el servicio");
        }

        const parsearFecha = (fechaStr, formato) => {
            const fecha = dayjs(fechaStr, formato, true)
            if (!fecha.isValid()) {
                throw new ValidationError(`Fecha inválida: ${fechaStr}. Formato requerido: ${formato}`);
            }
            return fecha.toDate();
        };

        const objectFechas = new RangoFechas(
            parsearFecha(rangoFechas.fechaInicio, "DD/MM/YYYY"),
            parsearFecha(rangoFechas.fechaFin, "DD/MM/YYYY")
        )

        const horarioNormalizado = horario === "null" ? null : (horario || null);

        // Bloquear cupo antes de persistir el pendiente. Si el pago no se completa,
        // revertirPendiente() restaura el cupo; si se completa, el cupo se mantiene
        // y se asocia a la Reserva definitiva creada por crearDesdePendiente().
        if (serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
            if (!servicio.estasDisponibleEn(objectFechas)) {
                throw new ValidationError("El servicio no está disponible en las fechas indicadas")
            }
            servicio.agregarFechasReserva(objectFechas)
        } else {
            const objectFechaHorarioTurno = new FechaHorarioTurno(
                parsearFecha(rangoFechas.fechaInicio, "DD/MM/YYYY"),
                horarioNormalizado
            )
            if (!servicio.estaDisponibleParaFechaYHorario(objectFechaHorarioTurno)) {
                throw new ValidationError("El servicio no está disponible en el horario indicado")
            }
            servicio.agregarFechasReserva(objectFechaHorarioTurno)
        }

        servicio.incrementarReservas()

        // Persistimos con un $set atómico en vez del save() genérico: el save
        // hace spread del Mongoose Document y en algunos casos no detecta
        // mutaciones en arrays anidados (fechasNoDisponibles), por lo que el
        // bloqueo de cupo no llegaba a la DB y los siguientes clientes veían
        // el horario como disponible.
        const repoServicio = serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR
            ? this.servicioCuidadorRepository
            : serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA
            ? this.servicioVeterinariaRepository
            : this.servicioPaseadorRepository;
        await repoServicio.actualizarDisponibilidad(
            servicio._id || servicio.id,
            servicio.fechasNoDisponibles,
            servicio.cantidadReservas,
        );

        const cantidadDias = serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR
            ? Math.ceil(Math.abs(objectFechas.fechaFin - objectFechas.fechaInicio) / (1000 * 60 * 60 * 24)) + 1
            : 1;
        const precioTotal = (servicio.precio || 0) * cantidadDias;

        const expiresAt = new Date(Date.now() + ReservaService.PENDIENTE_TTL_MINUTOS * 60 * 1000);

        const nuevoPendiente = {
            cliente: cliente._id || cliente.id,
            mascota: mascota._id,
            servicioReservado: servicio._id || servicio.id,
            serviciOfrecido,
            rangoFechas: { fechaInicio: objectFechas.fechaInicio, fechaFin: objectFechas.fechaFin },
            horario: horarioNormalizado,
            notaAdicional,
            cantidadDias,
            precioTotal,
            nombreDeContacto,
            telefonoContacto,
            emailContacto,
            expiresAt,
        };

        const guardado = await this.reservaPendienteRepository.save(nuevoPendiente);
        return this.pendienteToDTO(guardado);
    }

    // Asocia el preferenceId de MP al pendiente — lo llama pagoService después de
    // crear la preferencia. Útil para poder localizar el pendiente luego sólo con el
    // preferenceId (p. ej. flujos de reintento manual si fueran necesarios).
    async guardarPreferenceIdPendiente(idPendiente, preferenceId) {
        const pendiente = await this.reservaPendienteRepository.findById(idPendiente);
        if (!pendiente) return;
        pendiente.mercadoPagoPreferenceId = preferenceId;
        await this.reservaPendienteRepository.save(pendiente);
    }

    // Promueve un pendiente a Reserva definitiva tras la aprobación del pago.
    // - Crea la Reserva con estado=CONFIRMADA directamente (sin pasar por PENDIENTE_PAGO).
    // - Notifica al proveedor (nueva reserva) y al cliente (confirmada).
    // - Borra el pendiente.
    // Idempotente: si el pendiente ya no existe, devuelve null (el webhook pudo
    // haberse procesado antes en una entrega duplicada de MP).
    async crearDesdePendiente(idPendiente, mercadoPagoPaymentId, mercadoPagoPreferenceId) {
        // claimById borra y devuelve el pendiente en una sola operación atómica.
        // Si dos webhooks de MP llegan concurrentes, sólo uno obtiene el documento;
        // el otro recibe null y sale sin crear una Reserva duplicada.
        const pendiente = await this.reservaPendienteRepository.claimById(idPendiente);
        if (!pendiente) return null;

        const fechaActual = new Date();
        const objectFechas = new RangoFechas(pendiente.rangoFechas.fechaInicio, pendiente.rangoFechas.fechaFin);

        const nuevaReserva = new Reserva(
            pendiente.cliente,
            pendiente.servicioReservado,
            pendiente.mascota,
            objectFechas,
            pendiente.horario,
            pendiente.notaAdicional,
            pendiente.serviciOfrecido,
            pendiente.nombreDeContacto,
            pendiente.telefonoContacto,
            pendiente.emailContacto,
            fechaActual,
        );

        // El pago ya fue aprobado: saltamos PENDIENTE_PAGO y vamos directo a CONFIRMADA.
        nuevaReserva.estado = EstadoReserva.CONFIRMADA;
        if (mercadoPagoPaymentId) nuevaReserva.mercadoPagoPaymentId = mercadoPagoPaymentId;
        if (mercadoPagoPreferenceId) nuevaReserva.mercadoPagoPreferenceId = mercadoPagoPreferenceId;

        const reservaGuardada = await this.reservaRepository.save(nuevaReserva);

        if (reservaGuardada._id && !reservaGuardada.id) {
            reservaGuardada.id = reservaGuardada._id.toString();
        }

        const proveedor = reservaGuardada.servicioReservado.usuarioProveedor;
        const notificacionProveedor = FactoryNotificacion.crearSegunReserva(reservaGuardada);
        if (!proveedor.notificaciones) proveedor.notificaciones = [];
        proveedor.notificaciones.push(notificacionProveedor);
        if (proveedor._id && !proveedor.id) proveedor.id = proveedor._id.toString();

        const notificacionCliente = FactoryNotificacion.crearConfirmacion(reservaGuardada);
        if (!reservaGuardada.cliente.notificaciones) reservaGuardada.cliente.notificaciones = [];
        reservaGuardada.cliente.notificaciones.push(notificacionCliente);
        if (reservaGuardada.cliente._id && !reservaGuardada.cliente.id) {
            reservaGuardada.cliente.id = reservaGuardada.cliente._id.toString();
        }

        await this.clienteRepository.save(reservaGuardada.cliente);

        if (reservaGuardada.serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
            await this.cuidadorRepository.save(proveedor);
        } else if (reservaGuardada.serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
            await this.veterinariaRepository.save(proveedor);
        } else if (reservaGuardada.serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
            await this.paseadorRepository.save(proveedor);
        }

        // El correo de "reserva creada" y el de "confirmada" se fusionan en uno:
        // como no hay estado intermedio visible para el cliente, enviamos sólo
        // el de confirmación (que incluye fecha, horario, etc.).
        enviarEmailReservaConfirmada(reservaGuardada).catch(() => {})

        return this.toDTO(reservaGuardada);
    }

    // Libera el cupo cuando el pago se rechaza o el pendiente expira sin pagarse.
    // Idempotente: si el pendiente ya no existe, no hace nada.
    async revertirPendiente(idPendiente) {
        // Mismo patrón atómico que crearDesdePendiente: sólo un caller gana el
        // documento. Evita doble decremento de cupos si llegan webhooks concurrentes.
        const pendiente = await this.reservaPendienteRepository.claimById(idPendiente);
        if (!pendiente) return;

        const fechasReserva = pendiente.rangoFechas;
        const servicioId = pendiente.servicioReservado?._id || pendiente.servicioReservado?.id || pendiente.servicioReservado;

        // Recargar el servicio desde su repo: el populated del pendiente puede venir
        // como plain object (toObject) y haber perdido los métodos de la entidad.
        let servicio;
        let repoServicio;
        if (pendiente.serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
            repoServicio = this.servicioCuidadorRepository;
            servicio = await repoServicio.findById(servicioId);
        } else if (pendiente.serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
            repoServicio = this.servicioVeterinariaRepository;
            servicio = await repoServicio.findById(servicioId);
        } else if (pendiente.serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
            repoServicio = this.servicioPaseadorRepository;
            servicio = await repoServicio.findById(servicioId);
        }

        if (!servicio) {
            // El pendiente ya fue claimeado: si el servicio fue eliminado o no existe,
            // no podemos liberar su cupo. Log explícito para que el job de limpieza
            // o el operador puedan investigar (cupo huérfano).
            logger.warn("revertirPendiente: servicio no encontrado, no se puede liberar cupo", {
                pendienteId: idPendiente,
                servicioId: servicioId?.toString?.() || servicioId,
                serviciOfrecido: pendiente.serviciOfrecido,
            });
            return;
        }

        if (pendiente.serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
            servicio.eliminarFechasReserva(fechasReserva);
        } else {
            const objectFechaHorarioTurno = new FechaHorarioTurno(fechasReserva.fechaInicio, pendiente.horario);
            servicio.cancelarHorarioReserva(objectFechaHorarioTurno);
        }
        servicio.decrementarReservas();
        await repoServicio.actualizarDisponibilidad(
            servicio._id || servicio.id,
            servicio.fechasNoDisponibles,
            servicio.cantidadReservas,
        );
    }

    // Recorre pendientes con expiresAt ya vencido y libera sus cupos.
    // Invocado por el job periódico en server/index.js.
    async limpiarPendientesExpirados() {
        const expirados = await this.reservaPendienteRepository.findExpirados();
        for (const p of expirados) {
            try {
                await this.revertirPendiente(p._id || p.id);
            } catch (e) {
                console.error(`Error revertiendo pendiente ${p._id || p.id}:`, e.message);
            }
        }
        return expirados.length;
    }

    async findPendienteById(id) {
        const p = await this.reservaPendienteRepository.findById(id);
        return p ? this.pendienteToDTO(p) : null;
    }

    async modificarEstado(idUsuario, idReserva, nuevoEstado, motivo=null) {
        nuevoEstado = nuevoEstado.toUpperCase()
        const reserva = await this.reservaRepository.findById(idReserva)
        if(!reserva) {
            throw new NotFoundError(`Reserva ${idReserva} inexistente`)
        }

        // Asegurar que la reserva tenga el campo id correcto para el repository
        if (reserva._id && !reserva.id) {
            reserva.id = reserva._id.toString();
        }

        // Trabajar directamente con el objeto de datos sin reconstruir

        if(nuevoEstado == "CONFIRMADA") {
            if(reserva.estado == EstadoReserva.CONFIRMADA) {
                throw new ValidationError("Reserva ya confirmada")
            }

            let proveedor
            if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
                 proveedor = await this.cuidadorRepository.findById(idUsuario)
            } else if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
                 proveedor = await this.veterinariaRepository.findById(idUsuario)
            } else if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
                 proveedor = await this.paseadorRepository.findById(idUsuario)
            }
            if(!proveedor) {
                throw new NotFoundError("Proveedor de servicio no encontrado")
            }

            if(proveedor.nombreUsuario !== reserva.servicioReservado.usuarioProveedor.nombreUsuario) {
                throw new ValidationError("Proveedor pasado no corresponde al de la reserva")
            }

            // Cambiar estado y enviar notificación al cliente manualmente
            reserva.estado = EstadoReserva.CONFIRMADA;
            const notificacion = FactoryNotificacion.crearConfirmacion(reserva);
            
            // Agregar notificación al cliente
            if (!reserva.cliente.notificaciones) {
                reserva.cliente.notificaciones = [];
            }
            reserva.cliente.notificaciones.push(notificacion);
            
            // Asegurar que tiene el ID correcto para el repository
            if (reserva.cliente._id && !reserva.cliente.id) {
                reserva.cliente.id = reserva.cliente._id.toString();
            }
            
            await this.clienteRepository.save(reserva.cliente)
            await this.reservaRepository.save(reserva)

            enviarEmailReservaConfirmada(reserva).catch(() => {})

            return this.toDTO(reserva)

        } else if(nuevoEstado == "CANCELADA") {
            if(reserva.estado == EstadoReserva.CANCELADA) {
                throw new ValidationError("Reserva ya cancelada")
            }

            // Verificar si quien cancela es el cliente o el proveedor
            const cliente = await this.clienteRepository.findById(idUsuario)
            const proveedorCuidador = await this.cuidadorRepository.findById(idUsuario)
            const proveedorVeterinaria = await this.veterinariaRepository.findById(idUsuario)
            const proveedorPaseador = await this.paseadorRepository.findById(idUsuario)
            
            const usuarioQueCancela = cliente || proveedorCuidador || proveedorVeterinaria || proveedorPaseador;
            
            if(!usuarioQueCancela)    {
                throw new NotFoundError("Usuario no encontrado")
            }
            
            // Validar que el usuario tiene derecho a cancelar esta reserva
            if (cliente) {
                if(cliente.nombreUsuario !== reserva.cliente.nombreUsuario) {
                    throw new ValidationError("Cliente pasado no corresponde al de la reserva")
                }
            } else {
                // Si es un proveedor, verificar que sea el proveedor de la reserva
                if(usuarioQueCancela.nombreUsuario !== reserva.servicioReservado.usuarioProveedor.nombreUsuario) {
                    throw new ValidationError("Proveedor pasado no corresponde al de la reserva")
                }
            }

            const fechaActual = new Date()
            if(reserva.rangoFechas.fechaInicio < fechaActual) {
                throw new ValidationError("No se puede cancelar luego de pasada la fecha inicio")
            }

            // Validar restricciones específicas de cancelación por tipo de servicio
            this.validarRestriccionesCancelacion(reserva);
            
            const fechasReserva = reserva.rangoFechas
            const servicio = reserva.servicioReservado
            let repoServicio;
            if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
                servicio.eliminarFechasReserva(fechasReserva)
                repoServicio = this.servicioCuidadorRepository
            } else if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
                const objectFechaHorarioTurno = new FechaHorarioTurno(fechasReserva.fechaInicio, reserva.horario)
                servicio.cancelarHorarioReserva(objectFechaHorarioTurno)
                repoServicio = this.servicioVeterinariaRepository
            } else if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
                const objectFechaHorarioTurno = new FechaHorarioTurno(fechasReserva.fechaInicio, reserva.horario)
                servicio.cancelarHorarioReserva(objectFechaHorarioTurno)
                repoServicio = this.servicioPaseadorRepository
            }
            servicio.decrementarReservas()
            // $set atómico: mismo motivo que en crearPendiente/revertirPendiente.
            await repoServicio.actualizarDisponibilidad(
                servicio._id || servicio.id,
                servicio.fechasNoDisponibles,
                servicio.cantidadReservas,
            )

            if (cliente){
                // Cliente cancela - notificar al proveedor
                reserva.estado = EstadoReserva.CANCELADA;
                const notificacion = FactoryNotificacion.crearCancelacionAlProveedor(reserva);
                
                if (!reserva.servicioReservado.usuarioProveedor.notificaciones) {
                    reserva.servicioReservado.usuarioProveedor.notificaciones = [];
                }
                reserva.servicioReservado.usuarioProveedor.notificaciones.push(notificacion);
                
                // Asegurar que tiene el ID correcto para el repository
                if (reserva.servicioReservado.usuarioProveedor._id && !reserva.servicioReservado.usuarioProveedor.id) {
                    reserva.servicioReservado.usuarioProveedor.id = reserva.servicioReservado.usuarioProveedor._id.toString();
                }
                
                if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOCUIDADOR) {
                    await this.cuidadorRepository.save(reserva.servicioReservado.usuarioProveedor)
                } else if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOVETERINARIA) {
                    await this.veterinariaRepository.save(reserva.servicioReservado.usuarioProveedor)
                } else if (reserva.serviciOfrecido === ServicioOfrecido.SERVICIOPASEADOR) {
                    await this.paseadorRepository.save(reserva.servicioReservado.usuarioProveedor)
                }

                // Email al proveedor: el cliente canceló
                const provEmail = reserva.servicioReservado.usuarioProveedor?.email;
                const provNombre = reserva.servicioReservado.usuarioProveedor?.nombreUsuario;
                if (provEmail) {
                    enviarEmailReservaCancelada(reserva, provEmail, provNombre, 'cliente').catch(() => {})
                }
            } else {
                // Proveedor cancela - notificar al cliente
                reserva.estado = EstadoReserva.CANCELADA;
                const notificacion = FactoryNotificacion.crearCancelacionAlCliente(reserva);
                
                if (!reserva.cliente.notificaciones) {
                    reserva.cliente.notificaciones = [];
                }
                reserva.cliente.notificaciones.push(notificacion);
                
                // Asegurar que tiene el ID correcto para el repository
                if (reserva.cliente._id && !reserva.cliente.id) {
                    reserva.cliente.id = reserva.cliente._id.toString();
                }
                
                await this.clienteRepository.save(reserva.cliente)

                // Email al cliente: el proveedor canceló
                enviarEmailReservaCancelada(reserva, reserva.cliente.email, reserva.cliente.nombreUsuario, 'proveedor').catch(() => {})
            }

            await this.reservaRepository.save(reserva)

            return this.toDTO(reserva)

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

    async updateEstadoReserva(idReserva, estado) {
        const reserva = await this.reservaRepository.findById(idReserva);
        if (!reserva) {
            throw new NotFoundError(`Reserva con id ${idReserva} no encontrada`);
        }

        reserva.estado = estado;
        await this.reservaRepository.save(reserva);
        return this.toDTO(reserva);
    }

    

    toDTO(reserva) {
        const fechaInicio = dayjs(reserva.rangoFechas.fechaInicio).format("DD/MM/YYYY");
        const fechaFin = dayjs(reserva.rangoFechas.fechaFin).format("DD/MM/YYYY");

        
        return {
            _id: reserva._id,  // Agregar _id para compatibilidad con frontend
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
            precioTotal: reserva.precioTotal,
            mercadoPagoPreferenceId: reserva.mercadoPagoPreferenceId,
            mercadoPagoPaymentId: reserva.mercadoPagoPaymentId,
            nombreDeContacto: reserva.nombreDeContacto,
            telefonoContacto: reserva.telefonoContacto,
            emailContacto: reserva.emailContacto,
            fechaAlta: reserva.fechaAlta
        }
    }

    // DTO ligero del pendiente para el frontend y para pagoService.crearPreferencia.
    pendienteToDTO(pendiente) {
        return {
            _id: pendiente._id,
            id: pendiente.id,
            cliente: pendiente.cliente ? {
                nombreUsuario: pendiente.cliente.nombreUsuario,
                email: pendiente.cliente.email,
            } : null,
            serviciOfrecido: pendiente.serviciOfrecido,
            servicioReservado: pendiente.servicioReservado,
            rangoFechas: {
                fechaInicio: dayjs(pendiente.rangoFechas.fechaInicio).format("DD/MM/YYYY"),
                fechaFin: dayjs(pendiente.rangoFechas.fechaFin).format("DD/MM/YYYY"),
            },
            horario: pendiente.horario,
            notaAdicional: pendiente.notaAdicional,
            cantidadDias: pendiente.cantidadDias,
            precioTotal: pendiente.precioTotal,
            mercadoPagoPreferenceId: pendiente.mercadoPagoPreferenceId,
            expiresAt: pendiente.expiresAt,
        };
    }

    // Validar restricciones específicas de cancelación según el tipo de servicio
    validarRestriccionesCancelacion(reserva) {
        const ahora = dayjs();
        const fechaInicio = dayjs(reserva.rangoFechas.fechaInicio);

        if (reserva.serviciOfrecido === "ServicioCuidador") {
            // Para cuidadores: solo se puede cancelar con mínimo 3 días de anticipación
            const tresDiasAntes = fechaInicio.subtract(3, 'days').hour(23).minute(59).second(59);
            if (ahora.isAfter(tresDiasAntes)) {
                throw new ValidationError("No se puede cancelar un servicio de cuidado con menos de 3 días de anticipación");
            }
        } else if (reserva.serviciOfrecido === "ServicioVeterinaria" || reserva.serviciOfrecido === "ServicioPaseador") {
            // Para veterinarias y paseadores: verificar horario y permitir cancelación hasta 3 horas antes
            if (reserva.horario) {
                const [horas, minutos] = reserva.horario.split(':');
                const fechaHoraServicio = fechaInicio
                    .hour(parseInt(horas))
                    .minute(parseInt(minutos))
                    .second(0);

                const tresHorasAntes = fechaHoraServicio.subtract(3, 'hours');
                
                if (ahora.isAfter(tresHorasAntes)) {
                    const tipoServicio = reserva.serviciOfrecido === "ServicioVeterinaria" ? "veterinario" : "de paseo";
                    throw new ValidationError(`No se puede cancelar un servicio ${tipoServicio} con menos de 3 horas de anticipación`);
                }
            }
        }
    }
}
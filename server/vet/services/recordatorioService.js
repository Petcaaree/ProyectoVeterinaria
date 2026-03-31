import cron from 'node-cron';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import 'dayjs/locale/es.js';
import { FactoryNotificacion } from '../models/entidades/FactorYNotificacion.js';
import { EstadoReserva } from '../models/entidades/enums/EstadoReserva.js';
import logger from '../utils/logger.js';
import { enviarEmailRecordatorio, enviarEmailCancelacionAutomatica } from './emailService.js';

dayjs.extend(customParseFormat);
dayjs.locale('es');

export class RecordatorioService {
    constructor(reservaRepository, clienteRepository, cuidadorRepository, paseadorRepository, veterinariaRepository) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.cuidadorRepository = cuidadorRepository;
        this.paseadorRepository = paseadorRepository;
        this.veterinariaRepository = veterinariaRepository;
        this.iniciado = false;
    }

    // Iniciar el servicio de recordatorios
    iniciar() {
        if (this.iniciado) {
            logger.info('Servicio de recordatorios ya está iniciado');
            return;
        }

        logger.info('Iniciando servicio de recordatorios...');

        // Ejecutar cada minuto para verificar recordatorios (para pruebas)
        cron.schedule('* * * * *', async () => {
            await this.verificarRecordatorios();
        });

        this.iniciado = true;
        logger.info('Servicio de recordatorios iniciado correctamente');
    }

    // Verificar si hay reservas que necesitan recordatorio
    async verificarRecordatorios() {
        try {
            logger.debug('Verificando recordatorios pendientes...');
            // Obtener todas las reservas
            const reservas = await this.reservaRepository.findAll();
            logger.debug(`Total de reservas encontradas: ${reservas.length}`);

            // Cancelación automática de reservas PENDIENTES
            const ahora = dayjs();
            const pendientes = reservas.filter(r => r.estado === 'PENDIENTE');
            for (const reserva of pendientes) {
                const fechaReserva = dayjs(reserva.rangoFechas.fechaInicio);
                let fechaHoraReserva;
                if (reserva.horario) {
                    // Paseadores y veterinarias
                    const [horas, minutos] = reserva.horario.split(':');
                    fechaHoraReserva = fechaReserva.hour(parseInt(horas)).minute(parseInt(minutos)).second(0);
                } else {
                    // Cuidadores
                    fechaHoraReserva = fechaReserva.hour(23).minute(59).second(59);
                }

                const horasHasta = fechaHoraReserva.diff(ahora, 'hour');

                // Cancelar automáticamente si ya pasó la fecha/hora de la reserva
                if (horasHasta < 0) {
                    logger.info(`Reserva ${reserva.id} ya pasó su fecha programada (${fechaHoraReserva.format('DD/MM/YYYY HH:mm')}), cancelando automáticamente.`);
                    await this.cancelarReservaAutomatica(reserva, 'La reserva expiró por falta de confirmación');
                    continue;
                }

                // Cancelar automáticamente según tipo de servicio antes de la fecha
                if (reserva.serviciOfrecido === 'ServicioCuidador') {
                    // Si faltan 12h o menos y sigue pendiente
                    if (horasHasta <= 12) {
                        logger.info(`Reserva de cuidador ${reserva.id} sigue pendiente a menos de 12h, cancelando automáticamente.`);
                        await this.cancelarReservaAutomatica(reserva, 'No fue confirmada a tiempo por el cuidador');
                        continue;
                    }
                } else if (reserva.serviciOfrecido === 'ServicioPaseador' || reserva.serviciOfrecido === 'ServicioVeterinaria') {
                    // Si faltan 2h o menos y sigue pendiente
                    if (horasHasta <= 2) {
                        logger.info(`Reserva de paseador/veterinaria ${reserva.id} sigue pendiente a menos de 2h, cancelando automáticamente.`);
                        await this.cancelarReservaAutomatica(reserva, 'No fue confirmada a tiempo por el proveedor');
                        continue;
                    }
                }
            }

            // Procesar recordatorios para reservas confirmadas
            const reservasConfirmadas = reservas.filter(reserva => reserva.estado === 'CONFIRMADA');
            logger.debug(`Reservas confirmadas: ${reservasConfirmadas.length}`);

            logger.debug(`Hora actual: ${ahora.format('DD/MM/YYYY HH:mm:ss')}`);

            const recordatoriosEnviados = [];

            for (const reserva of reservasConfirmadas) {

    // Cancelar reserva automáticamente y notificar

                logger.debug(`Procesando reserva ${reserva.id}: estado=${reserva.estado}, cliente=${reserva.cliente?.nombreUsuario || 'N/A'}, horario=${reserva.horario || 'N/A'}, recordatorioEnviado=${reserva.recordatorioEnviado || false}`);

                try {
                    // Construir fecha y hora completa de la reserva
                    const fechaReserva = dayjs(reserva.rangoFechas.fechaInicio);
                    let fechaHoraReserva;
                    let esCuidador = false;
                    if (reserva.horario) {
                        // Para servicios con horario (paseadores y veterinarias)
                        const [horas, minutos] = reserva.horario.split(':');
                        fechaHoraReserva = fechaReserva
                            .hour(parseInt(horas))
                            .minute(parseInt(minutos))
                            .second(0);
                    } else {
                        // Para servicios de cuidador (sin horario específico, se considera el final del día)
                        fechaHoraReserva = fechaReserva.hour(23).minute(59).second(59);
                        esCuidador = true;
                    }

                    logger.debug(`Reserva ${reserva.id} - Fecha/hora reserva: ${fechaHoraReserva.format('DD/MM/YYYY HH:mm:ss')}`);

                    // Verificar si la reserva ya pasó y marcarla como COMPLETADA
                    if (ahora.isAfter(fechaHoraReserva)) {
                        logger.info(`Reserva ${reserva.id} pasada, marcando como COMPLETADA`);
                        await this.marcarReservaCompletada(reserva.id);
                        continue; // Saltar al siguiente, ya no necesita recordatorios
                    }

                    if (esCuidador) {
                        // Enviar recordatorio apenas pasan las 00:00 del día de inicio si no se ha enviado
                        const recordatorioHora = fechaReserva.hour(0).minute(0).second(0);
                        const minutosHastaRecordatorio = recordatorioHora.diff(ahora, 'minute');
                        const esHoy = ahora.isSame(fechaReserva, 'day');
                        if (esHoy && minutosHastaRecordatorio <= 0 && !reserva.recordatorioEnviado) {
                            logger.info(`Enviando recordatorio de cuidador para reserva ${reserva.id} (día de inicio)`);
                            await this.enviarRecordatorio(reserva, 'cuidador-dia-inicio');
                            recordatoriosEnviados.push({
                                reservaId: reserva.id,
                                cliente: reserva.cliente.nombreUsuario,
                                proveedor: reserva.servicioReservado.usuarioProveedor.nombreUsuario,
                                fechaHora: recordatorioHora.format('DD/MM/YYYY HH:mm'),
                                tipo: 'cuidador-dia-inicio'
                            });
                            await this.marcarRecordatorioEnviado(reserva.id);
                        } else {
                            logger.debug(`Reserva ${reserva.id} no requiere recordatorio de cuidador: esHoy=${esHoy}, minutosHastaRecordatorio=${minutosHastaRecordatorio}, enviado=${reserva.recordatorioEnviado}`);
                        }
                        continue;
                    }

                    // Solo procesar recordatorios para reservas que tienen horario (paseadores y veterinarias)
                    // Calcular diferencia hasta la reserva
                    const minutosHastaReserva = fechaHoraReserva.diff(ahora, 'minute');
                    logger.debug(`Reserva ${reserva.id} - Minutos hasta reserva: ${minutosHastaReserva}`);

                    // Si faltan menos de 60 minutos y no se ha enviado recordatorio
                    if (minutosHastaReserva > 0 && minutosHastaReserva <= 60 && !reserva.recordatorioEnviado) {
                        logger.info(`Enviando recordatorio inmediato para reserva ${reserva.id} (faltan ${minutosHastaReserva} minutos)`);
                        await this.enviarRecordatorio(reserva, 'inmediato');
                        recordatoriosEnviados.push({
                            reservaId: reserva.id,
                            cliente: reserva.cliente.nombreUsuario,
                            proveedor: reserva.servicioReservado.usuarioProveedor.nombreUsuario,
                            fechaHora: fechaHoraReserva.format('DD/MM/YYYY HH:mm'),
                            tipo: 'inmediato'
                        });

                        // Marcar como recordatorio enviado
                        await this.marcarRecordatorioEnviado(reserva.id);
                    }
                    // Si faltan más de 60 minutos, verificar si es el momento exacto (1 hora antes)
                    else if (minutosHastaReserva > 60) {
                        const unaHoraAntes = fechaHoraReserva.subtract(1, 'hour');
                        const diferencia = Math.abs(ahora.diff(unaHoraAntes, 'minute'));
                        logger.debug(`Reserva ${reserva.id} - Verificando recordatorio programado: diferencia con 1h antes = ${diferencia} minutos`);

                        if (diferencia <= 2.5 && !reserva.recordatorioEnviado) {
                            logger.info(`Enviando recordatorio programado para reserva ${reserva.id} (1 hora antes)`);
                            await this.enviarRecordatorio(reserva, 'programado');
                            recordatoriosEnviados.push({
                                reservaId: reserva.id,
                                cliente: reserva.cliente.nombreUsuario,
                                proveedor: reserva.servicioReservado.usuarioProveedor.nombreUsuario,
                                fechaHora: fechaHoraReserva.format('DD/MM/YYYY HH:mm'),
                                tipo: 'programado'
                            });

                            // Marcar como recordatorio enviado
                            await this.marcarRecordatorioEnviado(reserva.id);
                        }
                    } else {
                        logger.debug(`Reserva ${reserva.id} no requiere recordatorio: minutos=${minutosHastaReserva}, enviado=${reserva.recordatorioEnviado}`);
                    }
                } catch (error) {
                    logger.error(`Error procesando recordatorio para reserva ${reserva.id}:`, error);
                }
            }

            if (recordatoriosEnviados.length > 0) {
                logger.info(`${recordatoriosEnviados.length} recordatorios enviados`, { recordatoriosEnviados });
            }

        } catch (error) {
            logger.error('Error en verificarRecordatorios:', error);
        }
    }

    async cancelarReservaAutomatica(reserva, motivo) {
        try {
            reserva.estado = EstadoReserva.CANCELADA;
            await this.reservaRepository.save(reserva);
            // Notificar al cliente y proveedor
            // Notificar cliente
            const cliente = await this.clienteRepository.findById(reserva.cliente._id);
            if (cliente) {
                const notificacion = FactoryNotificacion.crearCancelacionAutomaticaParaCliente(reserva, motivo);
                cliente.notificaciones.push(notificacion);
                await this.clienteRepository.save(cliente);

                enviarEmailCancelacionAutomatica(reserva, cliente.email, cliente.nombreUsuario, motivo).catch(() => {})
            }
            // Notificar proveedor
            const proveedor = reserva.servicioReservado?.usuarioProveedor;
            if (proveedor && proveedor._id) {
                // Buscar en el repo correcto
                const notificacion = FactoryNotificacion.crearCancelacionAutomaticaParaProveedor(reserva, motivo);

                if (reserva.serviciOfrecido === 'ServicioCuidador') {
                    const cuidador = await this.cuidadorRepository.findById(proveedor._id);
                    if (cuidador) {
                        cuidador.notificaciones.push(notificacion);
                        await this.cuidadorRepository.save(cuidador);
                    }
                } else if (reserva.serviciOfrecido === 'ServicioPaseador') {
                    const paseador = await this.paseadorRepository.findById(proveedor._id);
                    if (paseador) {
                        paseador.notificaciones.push(notificacion);
                        await this.paseadorRepository.save(paseador);
                    }
                } else if (reserva.serviciOfrecido === 'ServicioVeterinaria') {
                    const veterinaria = await this.veterinariaRepository.findById(proveedor._id);
                    if (veterinaria) {
                        veterinaria.notificaciones.push(notificacion);
                        await this.veterinariaRepository.save(veterinaria);
                    }
                }

                // Email al proveedor por cancelación automática
                if (proveedor.email) {
                    enviarEmailCancelacionAutomatica(reserva, proveedor.email, proveedor.nombreUsuario, motivo).catch(() => {})
                }
            }
            logger.info(`Reserva ${reserva.id} cancelada automáticamente por falta de confirmación.`);
        } catch (error) {
            logger.error(`Error al cancelar automáticamente la reserva ${reserva.id}:`, error);
        }
    }

    // Enviar recordatorio al cliente
    async enviarRecordatorio(reserva, tipoRecordatorio = 'programado') {
        try {
            const notificacionRecordatorio = FactoryNotificacion.crearRecordatorio(reserva, tipoRecordatorio);

            // Agregar la notificación directamente al cliente usando el repositorio
            const cliente = await this.clienteRepository.findById(reserva.cliente._id);
            if (cliente) {
                cliente.notificaciones.push(notificacionRecordatorio);
                await this.clienteRepository.save(cliente);

                logger.info(`Recordatorio ${tipoRecordatorio} enviado a ${reserva.cliente.nombreUsuario} para reserva ${reserva.id}`);

                enviarEmailRecordatorio(reserva, tipoRecordatorio).catch(() => {})
            } else {
                logger.error(`Cliente no encontrado para reserva ${reserva.id}`);
            }

        } catch (error) {
            logger.error(`Error enviando recordatorio para reserva ${reserva.id}:`, error);
            throw error;
        }
    }    // Marcar que el recordatorio fue enviado
    async marcarRecordatorioEnviado(reservaId) {
        try {
            // Actualizar la reserva en la base de datos
            await this.reservaRepository.update(reservaId, { recordatorioEnviado: true });
            logger.debug(`Recordatorio marcado como enviado para reserva ${reservaId}`);
        } catch (error) {
            logger.error(`Error marcando recordatorio como enviado:`, error);
        }
    }

    // Marcar reserva como COMPLETADA cuando se pasa la fecha de inicio
    async marcarReservaCompletada(reservaId) {
        try {
            // Actualizar la reserva en la base de datos
            await this.reservaRepository.update(reservaId, { estado: 'COMPLETADA' });
            logger.info(`Reserva ${reservaId} marcada como COMPLETADA`);
        } catch (error) {
            logger.error(`Error marcando reserva como completada:`, error);
        }
    }

    // Método para verificar recordatorios manualmente (para testing)
    async verificarRecordatoriosManual() {
        logger.info('VERIFICACION MANUAL DE RECORDATORIOS');
        await this.verificarRecordatorios();
        return 'Verificación completada';
    }

    // Detener el servicio
    detener() {
        logger.info('Deteniendo servicio de recordatorios...');
        cron.destroy();
        this.iniciado = false;
        logger.info('Servicio de recordatorios detenido');
    }
}

import cron from 'node-cron';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import 'dayjs/locale/es.js';
import { FactoryNotificacion } from '../models/entidades/FactorYNotificacion.js';

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
            console.log('🔔 Servicio de recordatorios ya está iniciado');
            return;
        }

        console.log('🔔 Iniciando servicio de recordatorios...');
        
        // Ejecutar cada minuto para verificar recordatorios (para pruebas)
        cron.schedule('* * * * *', async () => {
            await this.verificarRecordatorios();
        });

        this.iniciado = true;
        console.log('✅ Servicio de recordatorios iniciado correctamente');
    }

    // Verificar si hay reservas que necesitan recordatorio
    async verificarRecordatorios() {
        try {
            console.log('🔍 Verificando recordatorios pendientes...');
            
            // Obtener todas las reservas confirmadas
            const reservas = await this.reservaRepository.findAll();
            console.log(`📋 Total de reservas encontradas: ${reservas.length}`);
            
            const reservasConfirmadas = reservas.filter(reserva => reserva.estado === 'CONFIRMADA');
            console.log(`✅ Reservas confirmadas: ${reservasConfirmadas.length}`);

            const ahora = dayjs();
            console.log(`⏰ Hora actual: ${ahora.format('DD/MM/YYYY HH:mm:ss')}`);
            
            const recordatoriosEnviados = [];

            for (const reserva of reservasConfirmadas) {
                console.log(`🔍 Procesando reserva ${reserva.id}:`);
                console.log(`   - Estado: ${reserva.estado}`);
                console.log(`   - Cliente: ${reserva.cliente?.nombreUsuario || 'N/A'}`);
                console.log(`   - Horario: ${reserva.horario || 'N/A'}`);
                console.log(`   - Recordatorio enviado: ${reserva.recordatorioEnviado || false}`);
                
                // Solo procesar reservas que tienen horario (paseadores y veterinarias)
                if (!reserva.horario) {
                    console.log(`   ⏭️ Saltando - no tiene horario (servicio de cuidador)`);
                    continue;
                }

                try {
                    // Construir fecha y hora completa de la reserva
                    const fechaReserva = dayjs(reserva.rangoFechas.fechaInicio);
                    const [horas, minutos] = reserva.horario.split(':');
                    const fechaHoraReserva = fechaReserva
                        .hour(parseInt(horas))
                        .minute(parseInt(minutos))
                        .second(0);

                    console.log(`   📅 Fecha/hora reserva: ${fechaHoraReserva.format('DD/MM/YYYY HH:mm:ss')}`);

                    // Calcular diferencia hasta la reserva
                    const minutosHastaReserva = fechaHoraReserva.diff(ahora, 'minute');
                    console.log(`   ⏰ Minutos hasta reserva: ${minutosHastaReserva}`);
                    
                    // Si faltan menos de 60 minutos y no se ha enviado recordatorio
                    if (minutosHastaReserva > 0 && minutosHastaReserva <= 60 && !reserva.recordatorioEnviado) {
                        console.log(`   📧 Enviando recordatorio inmediato (faltan ${minutosHastaReserva} minutos)`);
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
                        console.log(`   ⏰ Verificando recordatorio programado: diferencia con 1h antes = ${diferencia} minutos`);
                        
                        if (diferencia <= 2.5 && !reserva.recordatorioEnviado) {
                            console.log(`   📧 Enviando recordatorio programado (1 hora antes)`);
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
                        console.log(`   ⏭️ No requiere recordatorio: minutos=${minutosHastaReserva}, enviado=${reserva.recordatorioEnviado}`);
                    }
                } catch (error) {
                    console.error(`❌ Error procesando recordatorio para reserva ${reserva.id}:`, error);
                }
            }

            if (recordatoriosEnviados.length > 0) {
                console.log(`📧 ${recordatoriosEnviados.length} recordatorios enviados:`, recordatoriosEnviados);
            }

        } catch (error) {
            console.error('❌ Error en verificarRecordatorios:', error);
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
                
                console.log(`📧 Recordatorio ${tipoRecordatorio} enviado a ${reserva.cliente.nombreUsuario} para reserva ${reserva.id}`);
            } else {
                console.error(`❌ Cliente no encontrado para reserva ${reserva.id}`);
            }
            
        } catch (error) {
            console.error(`❌ Error enviando recordatorio para reserva ${reserva.id}:`, error);
            throw error;
        }
    }    // Marcar que el recordatorio fue enviado
    async marcarRecordatorioEnviado(reservaId) {
        try {
            // Actualizar la reserva en la base de datos
            await this.reservaRepository.update(reservaId, { recordatorioEnviado: true });
            console.log(`✅ Recordatorio marcado como enviado para reserva ${reservaId}`);
        } catch (error) {
            console.error(`❌ Error marcando recordatorio como enviado:`, error);
        }
    }

    // Método para verificar recordatorios manualmente (para testing)
    async verificarRecordatoriosManual() {
        console.log('🔧 VERIFICACIÓN MANUAL DE RECORDATORIOS');
        await this.verificarRecordatorios();
        return 'Verificación completada';
    }

    // Detener el servicio
    detener() {
        console.log('🔔 Deteniendo servicio de recordatorios...');
        cron.destroy();
        this.iniciado = false;
        console.log('✅ Servicio de recordatorios detenido');
    }
}

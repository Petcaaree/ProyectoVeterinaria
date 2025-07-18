import { EstadoReserva } from '../enums/EstadoReserva.js';
import { Cuidador } from './Cuidador.js';
import { TipoServicio } from './enums/TipoServicio.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';
import { ServicioVeterinaria } from './ServicioVeterinaria.js';
import { ServicioCuidador } from './ServicioCuidador.js';
import { ServicioPaseador} from './ServicioPaseador.js';

export class Reserva{

    constructor(cliente, servicioReservado, mascota, rangoFechas, horario, notaAdicional, serviciOfrecido, nombreDeContacto, telefonoContacto, emailContacto) {
        this.cliente = cliente;
        this.serviciOfrecido = serviciOfrecido; // Tipo de servicio (Veterinaria, Cuidador, Paseador) 
        this.servicioReservado = servicioReservado; 
        this.mascota = mascota;  
        this.rangoFechas = rangoFechas; 
        this.estado = EstadoReserva.PENDIENTE; 
        this.horario = horario || null;
        this.notaAdicional = notaAdicional;
        this.cantidadDias = this.calcularDias(); // Para cuidadores, calculamos días
        this.nombreDeContacto = nombreDeContacto 
        this.telefonoContacto = telefonoContacto 
        this.emailContacto = emailContacto
    }

    // Metodo para calcular fecha fin basado en cantidad de unidades
    calcularFechaFin() {
        if (this.usuarioProveedor instanceof Paseador) {
            // Para paseadores, sumamos horas
            const fin = new Date(this.fechaInicio);
            fin.setHours(fin.getHours() + this.cantidadUnidades);
            return fin;
        } else if (this.usuarioProveedor instanceof Veterinaria) {
            // Para veterinaria, calculamos segun servicio
            const fin = new Date(this.fechaInicio);
            if (this.servicio === TipoServicio.BANIO) {
                fin.setMinutes(fin.getMinutes() + 60 );
            } else {
                fin.setMinutes(fin.getMinutes() + 30 );
            }
            return fin;
        }
        return this.fechaFin;
    }

    // Metodo para calcular dias para cuidadores
    calcularDias() {
        if (this.servicioReservado instanceof ServicioCuidador) {
            const diffTime = Math.abs(this.rangoFechas.fechaFin - this.rangoFechas.fechaInicio);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return this.cantidadUnidades;
    }

  calcularPrecioTotal(precioUnitario, cantidadUnidades) {
    return precioUnitario * cantidadUnidades; 
  }

    notificar() {
    const notificacion = FactoryNotificacion.crearSegunReserva(this);
    const proveedor = this.servicioReservado.usuarioProveedor
    proveedor.recibirNotificacion(notificacion);
    return proveedor;
  }

  notificarActualizacion() {
    const notificacion = FactoryNotificacion.crearActualizacion(this);
    this.servicioReservado.usuarioProveedor.recibirNotificacion(notificacion);
    return this.servicioReservado.usuarioProveedor;
  }

  notificarCambioEstado(nuevoEstado, motivo=null) {
    this.estado = nuevoEstado

    let notificacion = null
    if(nuevoEstado === EstadoReserva.CANCELADA) {

      notificacion = FactoryNotificacion.crearCancelacion(this, motivo)
      this.servicioReservado.usuarioProveedor.recibirNotificacion(notificacion)
      return this.servicioReservado.usuarioProveedor

    } else if(nuevoEstado === EstadoReserva.CONFIRMADA) {

      notificacion =  FactoryNotificacion.crearConfirmacion(this)
      this.cliente.recibirNotificacion(notificacion)
      return this.cliente

    } else {
      return null
    }
  }
}

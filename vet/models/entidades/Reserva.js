import { EstadoReserva } from '../enums/EstadoReserva.js';
import { Cuidador } from './Cuidador.js';
import { TipoServicio } from './enums/TipoServicio.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';

export class Reserva{

    constructor(cliente, usuarioProveedor, mascota, fechaAlta, fechaInicio, fechaFin, servicio, rangoHorario, estado, precioUnitario, cantidadUnidades, precioTotal) {
        this.cliente = cliente; 
        this.usuarioProveedor = usuarioProveedor; 
        this.mascota = mascota;  
        this.fechaAlta = fechaAlta; 
        this.fechaInicio = fechaInicio;
        this.estado = EstadoReserva.PENDIENTE; 
        this.precioUnitario = precioUnitario ; 


        if (usuarioProveedor instanceof Veterinaria || usuarioProveedor instanceof Paseador) {
            this.cantidadUnidades = cantidadUnidades || 1;
            this.rangoHorario = rangoHorario;
            this.servicio = usuarioProveedor instanceof Veterinaria ? servicio : null;
            this.fechaFin = this.calcularFechaFin(); // Calculamos fechaFin basado en cantidadUnidades
        } else if (usuarioProveedor instanceof Cuidador) {
            this.fechaFin = fechaFin;
            this.rangoHorario = null;
            this.servicio = null;
            this.cantidadUnidades = this.calcularDias(); // Para cuidadores, calculamos días
        }

        precioTotal=calcularPrecioTotal(precioUnitario,cantidadUnidades);

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
        if (this.usuarioProveedor instanceof Cuidador) {
            const diffTime = Math.abs(this.fechaFin - this.fechaInicio);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return this.cantidadUnidades;
    }

  calcularPrecioTotal(precioUnitario, cantidadUnidades) {
    return precioUnitario * cantidadUnidades; 
  }

    notificar() {
    const notificacion = FactoryNotificacion.crearSegunReserva(this);
    const proveedor = this.usuarioProveedor
    proveedor.recibirNotificacion(notificacion);
    return proveedor;
  }

  notificarActualizacion() {
    const notificacion = FactoryNotificacion.crearActualizacion(this);
    this.usuarioProveedor.recibirNotificacion(notificacion);
    return this.usuarioProveedor;
  }

  notificarCambioEstado(nuevoEstado, motivo=null) {
    this.estado = nuevoEstado

    let notificacion = null
    if(nuevoEstado === EstadoReserva.CANCELADA) {

      notificacion = FactoryNotificacion.crearCancelacion(this, motivo)
      this.usuarioProveedor.recibirNotificacion(notificacion)
      return this.usuarioProveedor

    } else if(nuevoEstado === EstadoReserva.CONFIRMADA) {

      notificacion =  FactoryNotificacion.crearConfirmacion(this)
      this.cliente.recibirNotificacion(notificacion)
      return this.cliente

    } else {
      return null
    }
  }
}

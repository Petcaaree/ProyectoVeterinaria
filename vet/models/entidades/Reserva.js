import { EstadoReserva } from '../enums/EstadoReserva.js';
import { Cuidador } from './Cuidador.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';

export class Reserva{

    constructor(cliente, usuarioProveedor, mascota, fechaAlta, fechaInicio, fechaFin, servicio, rangoHorario, estado, precio ) {
        this.cliente = cliente; 
        this.usuarioProveedor = usuarioProveedor; 
        this.mascota = mascota;  
        this.fechaAlta = fechaAlta; 
        this.fechaInicio = fechaInicio;
        this.estado = EstadoReserva.PENDIENTE; 
        this.precio = precio ; 



        if ( usuarioProveedor instanceof Veterinaria || usuarioProveedor instanceof Paseador ) {
            this.rangoHorario = rangoHorario; 
            if (usuarioProveedor instanceof Veterinaria ) {
                this.servicio = servicio
            } else{
                this.servicio = null; 
            }
            
        } else{
            this.rangoHorario = null; 
            this.servicio = null; 
        }
        
        if(usuarioProveedor instanceof Cuidador){
            this.fechaFin = fechaFin;
        } else{
            this.fechaFin = null; 
        }
        
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

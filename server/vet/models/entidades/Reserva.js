import { EstadoReserva } from './enums/EstadoReserva.js';
import { FactoryNotificacion } from './FactorYNotificacion.js';
import { Cliente } from './Cliente.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';

import { ServicioVeterinaria } from './ServicioVeterinaria.js';
import { ServicioCuidador } from './ServicioCuidador.js';
import { ServicioPaseador} from './ServicioPaseador.js';
import { Cuidador } from './Cuidador.js';

export class Reserva{

    constructor(cliente, servicioReservado, mascota, rangoFechas, horario, notaAdicional, serviciOfrecido, nombreDeContacto, telefonoContacto, emailContacto, fechaAlta) {
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
        this.fechaAlta = fechaAlta
    }

    // Metodo para calcular fecha fin basado en cantidad de unidades
    /* calcularFechaFin() {
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
    } */

    // Metodo para calcular dias para cuidadores
    calcularDias() {
        if (this.serviciOfrecido === 'ServicioCuidador') {
            const diffTime = Math.abs(this.rangoFechas.fechaFin - this.rangoFechas.fechaInicio);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque incluye ambos días
        }
        // Para veterinaria y paseador siempre es 1 día
        return 1;
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

  notificarCambioEstado(nuevoEstado, motivo=null, tipoUsuario) {
    this.estado = nuevoEstado

    let notificacion = null
    if(nuevoEstado === EstadoReserva.CANCELADA) {
      if (tipoUsuario === 'proveedor'){
        notificacion = FactoryNotificacion.crearCancelacionAlCliente(this)
        
        // Solo agregar la notificación sin reconstruir la instancia
        if (!this.cliente.notificaciones) {
          this.cliente.notificaciones = [];
        }
        this.cliente.notificaciones.push(notificacion);
        
        // Asegurar que tiene el ID correcto para el repository
        if (this.cliente._id && !this.cliente.id) {
          this.cliente.id = this.cliente._id.toString();
        }
        
        return this.cliente
      } else{
        notificacion = FactoryNotificacion.crearCancelacionAlProveedor(this)
        
        // Solo agregar la notificación sin reconstruir la instancia
        if (!this.servicioReservado.usuarioProveedor.notificaciones) {
          this.servicioReservado.usuarioProveedor.notificaciones = [];
        }
        this.servicioReservado.usuarioProveedor.notificaciones.push(notificacion);
        
        // Asegurar que tiene el ID correcto para el repository
        if (this.servicioReservado.usuarioProveedor._id && !this.servicioReservado.usuarioProveedor.id) {
          this.servicioReservado.usuarioProveedor.id = this.servicioReservado.usuarioProveedor._id.toString();
        }
        
        return this.servicioReservado.usuarioProveedor
      }

    } else if(nuevoEstado === EstadoReserva.CONFIRMADA) {

      notificacion = FactoryNotificacion.crearConfirmacion(this)
      
      // Solo agregar la notificación sin reconstruir la instancia
      if (!this.cliente.notificaciones) {
        this.cliente.notificaciones = [];
      }
      this.cliente.notificaciones.push(notificacion);
      
      // Asegurar que tiene el ID correcto para el repository
      if (this.cliente._id && !this.cliente.id) {
        this.cliente.id = this.cliente._id.toString();
      }
      
      return this.cliente

    } else {
      return null
    }
  }
}

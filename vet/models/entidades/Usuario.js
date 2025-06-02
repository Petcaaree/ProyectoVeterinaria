export class Usuario {
  constructor(nombreUsuario, email, locaclidad, telefono ) {
    this.nombreUsuario = nombreUsuario;
    this.email = email;
    this.notificaciones = [];
    this.telefono = telefono;
    this.lolcalidad = locaclidad;
  }

  recibirNotificacion(notificacion) {
    this.notificaciones.push(notificacion);
  }
}
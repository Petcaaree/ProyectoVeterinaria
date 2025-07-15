export class Usuario {
  constructor(nombreUsuario, email, direccion, telefono, contrasenia ) {
    this.nombreUsuario = nombreUsuario;
    this.email = email;
    this.notificaciones = [];
    this.telefono = telefono;
    this.direccion = direccion;
    this.contrasenia = contrasenia; // Inicialmente no tiene contraseña
  }

  recibirNotificacion(notificacion) {
    this.notificaciones.push(notificacion);
  }
}
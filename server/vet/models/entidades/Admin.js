import { Usuario } from './Usuario.js';

export class Admin extends Usuario {
    constructor(nombreUsuario, email, direccion, telefono, contrasenia, rol = 'superadmin') {
        super(nombreUsuario, email, direccion, telefono, contrasenia);
        this.rol = rol;
    }
}

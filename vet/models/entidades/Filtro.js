import { TipoServicio } from "./enums/TipoServicio";

export class Filtro {
    constructor(localidad=null, mascotasAceptadas=[], tipoServicio=null,tipoTurno=null) {
        this.localidad = localidad;
        this.mascotasAceptadas = mascotasAceptadas;
        this.tipoServicio = tipoServicio;
        this.tipoTurno = tipoTurno;
    }

    validarLocalidad(proveedorUsuario, localidad) {
        if(localidad == null) return true;
        return proveedorUsuario.localidad == localidad;
    }

    validarMascotasAceptadas(proveedorUsuario, mascotasAceptadas){
        if(mascotasAceptadas == null) return true;
        return proveedorUsuario.mascotasAceptadas.includes(mascotasAceptadas);
    }

    validadTipoServicio(proveedorUsuario, tipoServicio) {
        if (this.tipoServicio == null || !(proveedorUsuario instanceof VETERINARIO)) {
            return true;
        }
        this.tipoTurno = TipoTurno.VETERINARIO; // Asignamos el tipo de turno a Veterinario si es un servicio de veterinaria
        return proveedorUsuario.serviciosDisponibles.includes(tipoServicio);
    }
    
    validarTipoTurno(proveedorUsuario, tipoTurno) {
        if (tipoTurno == null) return true;

        if (proveedorUsuario instanceof Paseador && tipoTurno === TipoTurno.PASEO) {
            return true;
        } else if (proveedorUsuario instanceof VETERINARIO && tipoTurno === TipoTurno.VETERINARIO) {
            return true;
        }else if (proveedorUsuario instanceof Cuidador && tipoTurno === TipoTurno.CUIDADO) {
            return true;
        }

        return false;
    }

    cumplenCon(proveedorUsuarios) {
        return proveedorUsuarios.filter(a => {
            return (
                this.validarLocalidad(a, this.localidad) &&
                this.validarMascotasAceptadas(a, this.mascotasAceptadas) &&
                this.validarTipoTurno(a, this.tipoTurno) &&
                this.validadTipoServicio(a, this.tipoServicio)
            );
        });
    }

}

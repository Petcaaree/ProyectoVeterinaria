import { TipoServicio } from "./enums/TipoServicio";

export class FiltroCuidador {
    constructor(nombre = null ,localidad=null, fechaInicio=null, fechaFin=null , mascotasAceptadas=[]) {
        this.nombre = nombre;
        this.localidad = localidad;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.mascotasAceptadas = mascotasAceptadas;
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
        if (this.tipoServicio == null && (proveedorUsuario instanceof VETERINARIO)) {
            return true;
        }
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

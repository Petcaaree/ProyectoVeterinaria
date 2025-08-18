import { FiltroPaseador } from "../models/entidades/FiltroPaseador.js";
import { ObjectId } from "mongodb";
import { EstadoServicio } from "../models/entidades/enums/enumEstadoServicio.js";

export class ServicioPaseadorController {
    constructor(servicioPaseadorService) {
        this.servicioPaseadorService = servicioPaseadorService;
    }

    async findAll(req, res, next){
        try {
            const { page = 1, limit = 6} = req.query
            const paginacion = { page, limit}

            const {nombre=null, localidad=null, precioMin=null, precioMax=null,  fecha=null } = req.query
            const filtros = { nombre, localidad, precioMin, precioMax, fecha }
            

            const hasFilters = Object.values(filtros).some(value => value !== null && value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true));
            
            let servicioPaseadores
            if(hasFilters) {
                const filtro = new FiltroPaseador(nombre, localidad, precioMin, precioMax, fecha)
                servicioPaseadores = await this.servicioPaseadorService.findByFilters(filtro, {page, limit});
            } else {
                console.log("No hay filtros, obteniendo todos los servicios");
                servicioPaseadores = await this.servicioPaseadorService.findAll({ page, limit })
            }

            res.json(servicioPaseadores);
        } catch (error) {
            next(error)
        }
    };

    async findById (req, res, next) {
        try{
            const id = req.params.id;
            const servicioPaseador = await this.servicioPaseadorService.findById(id);

            res.json(servicioPaseador);
        } catch (error) {
            next(error)
        }
    };

    async getByPaseador(req, res, next) {
        try {
            const id = req.params.id
            const { page, limit } = req.query;

            const servicioPaseadores = await this.servicioPaseadorService.findByPaseador(id, { page, limit });
            res.json(servicioPaseadores);
        } catch (error) {
            next(error);
        }
    }

    // Endpoint para crear un nuevo servicioPaseador
    async create (req, res,next) {
        try {
            const servicioPaseador = req.body;
            const nuevo = await this.servicioPaseadorService.create(servicioPaseador);

            res.status(201).json(nuevo);
        } catch (error) {
            next(error)
        }
    }

    // Endpoint para eliminar un servicioPaseador
    async delete(req, res, next) {
        try {
        await this.servicioPaseadorService.delete(req.params.id);

        return res.status(204).send();
        } catch (error) {
        next(error);
        }
    }

    async cambiarEstadoPaseador(req, res, next) {
        try {
            const { id, nuevoEstado } = req.params;

            const actualizado = await this.servicioPaseadorService.cambiarEstadoServicioPaseador(id, nuevoEstado);

            res.json(actualizado);
        } catch (error) {
            next(error);
        }
    }

    async importArray(req, res, next) {
        try {
            let array = req.body
            
            if (!Array.isArray(array)) {
            if (typeof array === 'object' && array !== null) {
                array = [array];
            } else {
                throw new Error("El cuerpo debe ser un array o un objeto");
            }
        }

            for(const a of array) {
                await this.servicioPaseadorService.create(a)
            }

            res.status(200).send({message: `Importación completa. ${array.length} documentos insertados.`})
        } catch (error) {
            next(error)
        }
    }

    async findByEstadoServicioPaseador(req, res, next) {
        try {

            const id = req.params.id;
            const estado = req.params.estado;
            const { page = 1, limit = 4 } = req.query;
            const result = await this.servicioPaseadorService.findByEstado(estado, id, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async obtenerNotificacionesLeidasOnoLeidas(req, res, next) {
        try {
            const id = req.params.id;
            const leida = req.params.leida;
            const { page = 1, limit = 5 } = req.query;
            const result = await this.servicioPaseadorService.getNotificacionesLeidasOnoLeidas(id, leida, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodasLasNotificaciones(req, res, next) {
        try {
            const id = req.params.id;
            const { page = 1, limit = 5 } = req.query;
            const result = await this.servicioPaseadorService.getAllNotificaciones(id, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
    
}
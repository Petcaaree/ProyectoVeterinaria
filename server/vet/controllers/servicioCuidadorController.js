import { FiltroCuidador } from "../models/entidades/FiltroCuidador.js";
import { ObjectId } from "mongodb";
import { EstadoServicio } from "../models/entidades/enums/enumEstadoServicio.js";

export class ServicioCuidadorController {
    constructor(servicioCuidadorService) {
        this.servicioCuidadorService = servicioCuidadorService;
    }

    async findAll(req, res, next){
        try {
            const { page = 1, limit = 4} = req.query
            const paginacion = { page, limit}

            const {nombre=null, localidad=null, precioMin=null, precioMax=null, fechaInicio=null, fechaFin=null, mascotasAceptadas=[]} = req.query
            const filtros = { nombre, localidad, precioMin, precioMax, fechaInicio, fechaFin, mascotasAceptadas }


            const hasFilters = Object.values(filtros).some(value => value !== null && value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true));
            
            let servicioCuidadores
            if(hasFilters) {
                const filtro = new FiltroCuidador(nombre, localidad, precioMin, precioMax, fechaInicio, fechaFin, mascotasAceptadas)
                servicioCuidadores = await this.servicioCuidadorService.findByFilters(filtro, {page, limit});
            } else {
                console.log("No hay filtros, obteniendo todos los servicios");
                servicioCuidadores = await this.servicioCuidadorService.findAll({ page, limit })
            }

            res.json(servicioCuidadores);
        } catch (error) {
            next(error)
        }
    };

    async findById (req, res, next) {
        try{
            const id = req.params.id;
            const servicioCuidador = await this.servicioCuidadorService.findById(id);

            res.json(servicioCuidador);
        } catch (error) {
            next(error)
        }
    };

    // Endpoint para buscar servicioCuidadores por filtros
    /* async findByFilter(req, res, next){
        try{
            const { page = 1, limit = 10} = req.query;
            const filtro = req.query;

            const servicioCuidadores = await this.servicioCuidadorService.findByFilters(filtro, {page, limit});
           
            res.json(servicioCuidadores);
        } catch (error) {
            next(error)
        }
    }; */

    async getByCuidador(req, res, next) {
        try {
            const id = req.params.id
            const { page, limit } = req.query;

            const servicioCuidadores = await this.servicioCuidadorService.findByCuidador(id, { page, limit });
            res.json(servicioCuidadores);
        } catch (error) {
            next(error);
        }
    }

    // Endpoint para crear un nuevo servicioCuidador
    async create (req, res,next) {
        try {
            const servicioCuidador = req.body;
            const nuevo = await this.servicioCuidadorService.create(servicioCuidador);

            res.status(201).json(nuevo);
        } catch (error) {
            next(error)
        }
    }

    // Endpoint para eliminar un servicioCuidador
    async delete(req, res, next) {
        try {
        await this.servicioCuidadorService.delete(req.params.id);

        return res.status(204).send();
        } catch (error) {
        next(error);
        }
    }

    async cambiarEstadoCuidador(req, res, next) {
        try {
            const { id, nuevoEstado } = req.params;

            const actualizado = await this.servicioCuidadorService.cambiarEstadoServicioCuidador(id, nuevoEstado);

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
                await this.servicioCuidadorService.create(a)
            }

            res.status(200).send({message: `Importación completa. ${array.length} documentos insertados.`})
        } catch (error) {
            next(error)
        }
    }

    async findActivos(req, res, next) {
        try {
            const { page = 1, limit = 4 } = req.query;
            const result = await this.servicioCuidadorService.findByEstado(EstadoServicio.ACTIVO, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async findInactivos(req, res, next) {
        try {
            const { page = 1, limit = 4 } = req.query;
            const result = await this.servicioCuidadorService.findByEstado(EstadoServicio.DESACTIVADA, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }



}
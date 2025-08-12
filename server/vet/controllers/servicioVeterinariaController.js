import { FiltroVeterinaria } from "../models/entidades/FiltroVeterinaria.js";
import { ObjectId } from "mongodb";
import { EstadoServicio } from "../models/entidades/enums/enumEstadoServicio.js";

export class ServicioVeterinariaController {
    constructor(servicioVeterinariaService) {
        this.servicioVeterinariaService = servicioVeterinariaService;
    }

    async findAll(req, res, next){
        try {
            console.log("🚀 INICIO ServicioVeterinariaController.findAll");
            const { page = 1, limit = 4} = req.query
            const paginacion = { page, limit}

            const {nombre=null, localidad=null, precioMin=null, precioMax=null, tipoServicio=null, fecha=null, mascotasAceptadas=[]} = req.query
            const filtros = { nombre, localidad, precioMin, precioMax, tipoServicio, fecha, mascotasAceptadas }
            
            console.log("📋 Filtros recibidos:", filtros);

            const hasFilters = Object.values(filtros).some(value => value !== null && value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true));
            
            console.log("🔍 Tiene filtros:", hasFilters);
            
            let servicioVeterinarias
            if(hasFilters) {
                console.log("📞 Llamando a findByFilters...");
                const filtro = new FiltroVeterinaria(nombre, localidad, precioMin, precioMax, tipoServicio, fecha, mascotasAceptadas)
                servicioVeterinarias = await this.servicioVeterinariaService.findByFilters(filtro, {page, limit});
            } else {
                console.log("No hay filtros, obteniendo todos los servicios");
                servicioVeterinarias = await this.servicioVeterinariaService.findAll({ page, limit })
            }

            console.log("✅ Respuesta obtenida, enviando...");
            res.json(servicioVeterinarias);
        } catch (error) {
            next(error)
        }
    };

    async findById (req, res, next) {
        try{
            const id = req.params.id;
            const servicioVeterinaria = await this.servicioVeterinariaService.findById(id);

            res.json(servicioVeterinaria);
        } catch (error) {
            next(error)
        }
    };

    // Endpoint para buscar servicioVeterinarias por filtros
    /* async findByFilter(req, res, next){
        try{
            const { page = 1, limit = 10} = req.query;
            const filtro = req.query;

            const servicioVeterinarias = await this.servicioVeterinariaService.findByFilters(filtro, {page, limit});
           
            res.json(servicioVeterinarias);
        } catch (error) {
            next(error)
        }
    }; */

    async getByVeterinaria(req, res, next) {
        try {
            const id = req.params.id
            const { page, limit } = req.query;

            const servicioVeterinarias = await this.servicioVeterinariaService.findByVeterinaria(id, { page, limit });
            res.json(servicioVeterinarias);
        } catch (error) {
            next(error);
        }
    }

    // Endpoint para crear un nuevo servicioVeterinaria
    async create (req, res,next) {
        try {
            const servicioVeterinaria = req.body;
            const nuevo = await this.servicioVeterinariaService.create(servicioVeterinaria);

            res.status(201).json(nuevo);
        } catch (error) {
            next(error)
        }
    }

    // Endpoint para eliminar un servicioVeterinaria
    async delete(req, res, next) {
        try {
        await this.servicioVeterinariaService.delete(req.params.id);

        return res.status(204).send();
        } catch (error) {
        next(error);
        }
    }

    async cambiarEstadoVeterinaria(req, res, next) {
        try {
            const { id, nuevoEstado } = req.params;

            const actualizado = await this.servicioVeterinariaService.cambiarEstadoServicioVeterinaria(id, nuevoEstado);

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
                await this.servicioVeterinariaService.create(a)
            }

            res.status(200).send({message: `Importación completa. ${array.length} documentos insertados.`})
        } catch (error) {
            next(error)
        }
    }

    async findServiciosActivos(req, res, next) {
        try {
            const { page = 1, limit = 4 } = req.query;
            const result = await this.servicioVeterinariaService.findByEstado(EstadoServicio.ACTIVO, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
                }
    }

    async findInactivos(req, res, next) {
        try {
            const { page = 1, limit = 4 } = req.query;
            const result = await this.servicioVeterinariaService.findByEstado(EstadoServicio.DESACTIVADA, { page, limit });
            res.json(result);
        } catch (error) {
                next(error);
            }
        }
}
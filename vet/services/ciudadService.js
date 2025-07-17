import { ConflictError } from "../errors/AppError.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Localidad } from "../models/entidades/Localidad.js"

export class CiudadService {
    constructor(ciudadRepository, localidadRepository) {
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
    }

    async findAll({page = 1, limit = 10}) {
        const pageNum = Math.max(Number(page), 1)
        const limitNum = Math.min(Math.max(Number(limit), 1), 100)

        let ciudades = await this.ciudadRepository.findByPage(pageNum, limit)

        const total = await this.ciudadRepository.countAll()
        const total_pages = Math.ceil(total / limitNum)
        const data = ciudades.map(a => this.toDTO(a))

        return {
            page: pageNum,
            per_page: limitNum,
            total: total,
            total_pages: total_pages,
            data: data
        };
    }

    async create(ciudad) {
        const { nombre, localidad } = ciudad

        const ciudadExistente = await this.ciudadRepository.findByName(nombre)
        if(ciudadExistente) {
            throw new ConflictError(`Ciudad con nombre ${nombre} ya existente`)
        }

        let localidadExistente = await this.localidadRepository.findByName(localidad)
        if(!localidadExistente) {
            localidadExistente = new Localidad(localidad)
            await this.localidadRepository.save(localidadExistente)
        }

        const nuevaCiudad = new Ciudad(nombre, localidadExistente)
        await this.ciudadRepository.save(nuevaCiudad)

        return this.toDTO(nuevaCiudad)
        
    }

    toDTO(ciudad) {
        return {
            id: ciudad.id,
            nombre: ciudad.nombre,
            localidad: ciudad.localidad.nombre
        }
    }
}
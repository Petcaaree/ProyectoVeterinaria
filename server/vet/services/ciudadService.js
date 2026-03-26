import { ConflictError } from "../errors/AppError.js"
import { Ciudad } from "../models/entidades/Ciudad.js"
import { Localidad } from "../models/entidades/Localidad.js"

export class CiudadService {
    constructor(ciudadRepository, localidadRepository) {
        this.ciudadRepository = ciudadRepository
        this.localidadRepository = localidadRepository
    }

    async findAll({page = 1, limit = 10}) {
        

        let localidades = await this.localidadRepository.findAll()

        const total = await this.localidadRepository.countAll()
        const data = localidades.map(a => this.toDTO(a))

        return {
            total: total,
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

    toDTO(localidad) {
        return {
            idLocalidad: localidad.id,
            localidad: localidad.nombre,
            ciudad: localidad.ciudad.nombre,
        }
    }
}
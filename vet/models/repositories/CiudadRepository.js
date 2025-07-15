import { CiudadModel } from "../schemas/ciudadSchema.js"

export class CiudadRepository {
    constructor() {
        this.model = CiudadModel
    }

    async save(ciudad) {
        if(ciudad.id) {
            const { id, ...datosActualizados } = ciudad
            const ciudadExistente = await this.model.findByIdAndUpdate(
                ciudad.id,
                datosActualizados,
                { new: true , runValidators: true}
            )
            return ciudadExistente.populate('localidad')
        } else {
            const nuevaCiudad = new this.model(ciudad)
            const ciudadGuardada = await nuevaCiudad.save()
            return ciudadGuardada.populate('localidad')
        }
    }

    async findById(id) {
        return await this.model.findById(id).populate('localidad')
    }
    
    async findByName(nombre) {
        return await this.model.findOne({nombre}).populate('localidad')
    }

    async findByPais(idLocalidad) {
        return await this.model.find({localidad : idLocalidad}).populate('localidad')
    }

    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum
        let ciuadades = await this.model.find().skip(skip).limit(limitNum).populate('localidad')
        return ciuadades
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
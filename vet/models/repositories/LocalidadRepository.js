import { LocalidadModel } from "../schemas/localidadSchema.js"

export class LocalidadRepository {
    constructor() {
        this.model = LocalidadModel
    }

    async save(localidad) {
        if(localidad.id) {
            const localidadExistente = await this.model.findByIdAndUpdate(
                localidad.id,
                localidad.nombre,
                { new: true, runValidators: true}
            )
            return localidadExistente
        } else {
            const nuevaLocalidad = new this.model(localidad)
            const localidadGuardada = await nuevaLocalidad.save()
            return localidadGuardada
        }
    }

    async findByName(nombre) {
        return await this.model.findOne({nombre})
    }

    async findByPage(pageNum, limitNum) {
        return await this.model.findByPage(pageNum, limitNum)
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
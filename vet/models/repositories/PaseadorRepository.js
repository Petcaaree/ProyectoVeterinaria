import { PaseadorModel } from "../schemas/paseadorSchema.js"

export class PaseadorRepository {
    constructor() {
        this.model = PaseadorModel
    }

    async save(paseador) {
        if(paseador.id) {
            const { id, ...datosActualizados } = paseador
            const paseadorExistente = await this.model.findByIdAndUpdate(
                paseador.id,
                datosActualizados,
                { new: true, runValidators: true }
            )
            return paseadorExistente
        } else {
            const newcliente = new this.model(paseador)
            const paseadorGuardado = await newpaseador.save()
            return paseadorGuardado
        }
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }

    async findById(id) {
        return await this.model.findById(id)
    }

    async findByName(nombre){
        return await this.model.findOne({nombre})
    }

    async findByEmail(email) {
        return await this.model.findOne({ email })
    } 

    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum
        const paseadores = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .exec()
        return paseadores
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
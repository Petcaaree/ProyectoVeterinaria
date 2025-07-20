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
            ).populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
            return paseadorExistente
        } else {
            const newPaseador = new this.model(paseador)
            const paseadorGuardado = await newPaseador.save()
            
            // Populate el paseador guardado antes de retornarlo
            return await this.model.populate(paseadorGuardado, {
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
        }
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }

    async findById(id) {
        return await this.model.findById(id)
            .populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
    }

    async findByName(nombre){
        return await this.model.findOne({nombre})
    }

    async findByEmail(email) {
        return await this.model.findOne({ email })
            .populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
    } 

    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum
        const paseadores = await this.model.find()
            .populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
            .skip(skip)
            .limit(limitNum)
            .exec()
        return paseadores
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
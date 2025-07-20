import { CuidadorModel } from "../schemas/cuidadorSchema.js"

export class CuidadorRepository {
    constructor() {
        this.model = CuidadorModel
    }

    async save(cuidador) {
        if(cuidador.id) {
            const { id, ...datosActualizados } = cuidador
            const cuidadorExistente = await this.model.findByIdAndUpdate(
                cuidador.id,
                datosActualizados,
                { new: true, runValidators: true }
            ).populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
            return cuidadorExistente
        } else {
            const newCuidador = new this.model(cuidador)
            const cuidadorGuardado = await newCuidador.save()
            
            // Populate el cuidador guardado antes de retornarlo
            return await this.model.populate(cuidadorGuardado, {
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
        const cuidadores = await this.model.find()
            .populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
            .skip(skip)
            .limit(limitNum)
            .exec()
        return cuidadores
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
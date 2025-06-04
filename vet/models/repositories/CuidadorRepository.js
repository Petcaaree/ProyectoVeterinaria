import { CuidadorModel } from "../schemas/cuidadorSchema.js"

export class ClienteRepository {
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
            )
            return cuidadorExistente
        } else {
            const newcliente = new this.model(cuidador)
            const cuidadorGuardado = await newcuidador.save()
            return cuidadorGuardado
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
        const cuidadores = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .exec()
        return cuidadores
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
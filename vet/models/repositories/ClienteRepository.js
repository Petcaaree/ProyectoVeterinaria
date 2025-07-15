import { ClienteModel } from "../schemas/clienteSchema.js"

export class ClienteRepository {
    constructor() {
        this.model = ClienteModel
    }

    async save(cliente) {
        if(cliente.id) {
            const { id, ...datosActualizados } = cliente
            const clienteExistente = await this.model.findByIdAndUpdate(
                cliente.id,
                datosActualizados,
                { new: true, runValidators: true }
            )
            return clienteExistente

        } else {
            const newCliente = new this.model(cliente)
            const clienteGuardado = await newCliente.save()
            return clienteGuardado
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
        const clientes = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .exec()
        return clientes
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
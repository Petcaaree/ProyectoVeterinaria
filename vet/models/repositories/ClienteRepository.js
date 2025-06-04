import path from "path"
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
            return await this.model.populate(clienteExistente, [
                {path: 'mascotas'}

            ])

        } else {
            const newcliente = new this.model(cliente)
            const clienteGuardado = await newcliente.save()
            return await this.model.populate(clienteGuardado, [
                {path: 'mascotas'}
            ])
        }
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }

    async findById(id) {
        return await this.model.findById(id).populate('mascotas')
    }

    async findByName(nombre){
        return await this.model.findOne({nombre}).populate('mascotas')
    }

    async findByEmail(email) {
        return await this.model.findOne({ email }).populate('mascotas')
    } 

    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum
        const clientes = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .populate('mascotas')
            .exec()
        return clientes
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
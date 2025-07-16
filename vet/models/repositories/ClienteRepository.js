import { ClienteModel } from "../schemas/clienteSchema.js"

export class ClienteRepository {
    constructor() {
        this.model = ClienteModel
    }

    async save(cliente) {
        if (cliente.id) {
            const { id, ...datosActualizados } = cliente;

            // Actualizás el cliente (no usás el retorno)
            await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: false, runValidators: true }
            );

            // Traés el cliente actualizado con las mascotas populadas
            const clienteActualizado = await this.model.findById(id)
                .populate('mascotas') // podés agregar más campos si querés
                .exec();

            return clienteActualizado;

        } else {
            // Guardás el nuevo cliente
            const nuevoCliente = new this.model(cliente);
            const clienteGuardado = await nuevoCliente.save();

            // Lo traés con populate
            const clienteConMascotas = await this.model.findById(clienteGuardado._id)
                .populate('mascotas')
                .exec();

            return clienteConMascotas;
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


    async findByMascota(mascotaId) {
        return await this.model.find({ mascotas: mascotaId })
            .populate('mascotas')
            .exec() 
    }

    async findMascotasByCliente(clienteId) {
        const cliente = await this.model.findById(clienteId)
            .populate('mascotas')
            .exec();

        if (!cliente) return [];

        return cliente.mascotas;
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
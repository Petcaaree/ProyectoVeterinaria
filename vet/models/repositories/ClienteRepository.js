import { ClienteModel } from "../schemas/clienteSchema.js"

export class ClienteRepository {
    constructor() {
        this.model = ClienteModel
    }

    async save(cliente) {
        if (cliente.id) {
            const { id, ...datosActualizados } = cliente;

            // Actualizar el cliente y retornar el actualizado
            const clienteActualizado = await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: true, runValidators: true }
            ).populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            });

            return clienteActualizado;

        } else {
            // Guardar el nuevo cliente
            const nuevoCliente = new this.model(cliente);
            const clienteGuardado = await nuevoCliente.save();

            // Populate el cliente guardado antes de retornarlo
            return await this.model.populate(clienteGuardado, {
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            });
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
        const clientes = await this.model.find()
            .populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
            .skip(skip)
            .limit(limitNum)
            .exec()
        return clientes
    }


    async findByMascota(mascotaId) {
        return await this.model.find({ "mascotas._id": mascotaId })
            .exec() 
    }

    async findMascotasByCliente(clienteId) {
        const cliente = await this.model.findById(clienteId)
            .exec();

        if (!cliente) return [];

        return cliente.mascotas;
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
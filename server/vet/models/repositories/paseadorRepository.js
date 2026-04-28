import { PaseadorModel } from "../schemas/paseadorSchema.js"
import { EstadoVerificacion } from "../entidades/enums/EstadoVerificacion.js"

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
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            })
            return paseadorExistente
        } else {
            const newPaseador = new this.model(paseador)
            const paseadorGuardado = await newPaseador.save()
            
            // Populate el paseador guardado antes de retornarlo
            return await this.model.populate(paseadorGuardado, {
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
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
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            })
    }

    async findByName(nombre){
        return await this.model.findOne({nombre})
    }

    async findByEmail(email) {
        return await this.model.findOne({ email })
            .populate({
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            })
    }

    async findByNombreUsuario(nombreUsuario) {
        return await this.model.findOne({ nombreUsuario })
            .populate({
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            })
    } 

    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum
        const paseadores = await this.model.find()
            .populate({
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            })
            .skip(skip)
            .limit(limitNum)
            .exec()
        return paseadores
    }

    async countAll() {
        return await this.model.countDocuments()
    }

    async findPendientesVerificacion({ page = 1, limit = 20 } = {}) {
        const filter = { 'verificacion.estadoVerificacion': EstadoVerificacion.PENDIENTE }
        const skip = (page - 1) * limit
        const [items, total] = await Promise.all([
            this.model.find(filter)
                .sort({ 'verificacion.fechaActualizacion': -1 })
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(filter),
        ])
        return { items, total }
    }

    async countPendientesVerificacion() {
        return await this.model.countDocuments({
            'verificacion.estadoVerificacion': EstadoVerificacion.PENDIENTE,
        })
    }

    // Devuelve solo los _id de paseadores VERIFICADOS. Útil para filtrar servicios
    // públicos a nivel DB sin traer todos los servicios a memoria.
    async findVerificadosIds() {
        const filter = { 'verificacion.estadoVerificacion': EstadoVerificacion.VERIFICADO }
        const docs = await this.model.find(filter).select('_id').lean()
        return docs.map((d) => d._id)
    }
}
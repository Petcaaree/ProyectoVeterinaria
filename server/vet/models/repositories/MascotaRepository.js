import { MascotaModel } from "../schemas/mascotaSchema.js"

export class MascotaRepository {
    constructor() {
        this.model = MascotaModel
    }

    async save(mascota) {
        if(mascota.id) {
            const { id, ...datosActualizados } = mascota
            const mascotaExistente = await this.model.findByIdAndUpdate(
                mascota.id,
                datosActualizados,
                { new: true, runValidators: true }
            )
            return mascotaExistente
        } else {
            const newMascota = new this.model(mascota)
            const mascotaGuardado = await newMascota.save()
            return mascotaGuardado
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

    

    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum
        const mascotas = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .exec()
        return mascotas
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
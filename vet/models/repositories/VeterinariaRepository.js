import { VeterinariaModel } from "../schemas/veterinariaSchema.js"

export class VeterinariaRepository {
    constructor() {
        this.model = VeterinariaModel
    }

    async save(veterinaria) {
        if(veterinaria.id) {
            const { id, ...datosActualizados } = veterinaria
            const VeterinariaExistente = await this.model.findByIdAndUpdate(
                veterinaria.id,
                datosActualizados,
                { new: true, runValidators: true }
            )
            return await this.model.populate(VeterinariaExistente, [
                {path: 'serviciosDisponibles'}
            ])
        } else {
            const newveterinaria = new this.model(veterinaria)
            const veterinariaGuardado = await newveterinaria.save()
            return await this.model.populate(veterinariaGuardado, [
                {path: 'serviciosDisponibles'}
            ])
        }
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }

    async findById(id) {
        return await this.model.findById(id).populate('serviciosDisponibles')
    }

    async findByName(nombre){
        return await this.model.findOne({nombre}).populate('serviciosDisponibles')
    }

    async findByEmail(email) {
        return await this.model.findOne({ email }).populate('serviciosDisponibles')
    } 

    async findByTipoServicio(tipoServicio){
        return await this.model.find({ serviciosDisponibles: tipoServicio }).populate('serviciosDisponibles')
    }

    async findByMascotasAceptadas(mascotasAceptadas) {
        return await this.model.find({ mascotasAceptadas: { $in: mascotasAceptadas } }).populate('serviciosDisponibles')
    }

    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum
        const veterinarias = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .populate('serviciosDisponibles')
            .exec()
        return veterinarias
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
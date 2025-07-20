import { VeterinariaModel } from "../schemas/veterinariaSchema.js"

export class VeterinariaRepository {
    constructor() {
        this.model = VeterinariaModel
    }

    async save(veterinaria) {
        if(veterinaria.id) {
            const { id, ...datosActualizados } = veterinaria
            const veterinariaExistente = await this.model.findByIdAndUpdate(
                veterinaria.id,
                datosActualizados,
                { new: true, runValidators: true }
            ).populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
            return veterinariaExistente
        } else {
            const newVeterinaria = new this.model(veterinaria)
            const veterinariaGuardado = await newVeterinaria.save()
            
            // Populate la veterinaria guardada antes de retornarla
            return await this.model.populate(veterinariaGuardado, {
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
        const veterinarias = await this.model.find()
            .populate({
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            })
            .skip(skip)
            .limit(limitNum)
            .exec()
        return veterinarias
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
import { AdminModel } from "../schemas/adminSchema.js";

export class AdminRepository {
    constructor() {
        this.model = AdminModel;
    }

    async save(admin) {
        if (admin.id) {
            const { id, ...datosActualizados } = admin;
            return await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: true, runValidators: true }
            );
        } else {
            const nuevoAdmin = new this.model(admin);
            return await nuevoAdmin.save();
        }
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async findByEmail(email) {
        return await this.model.findOne({ email });
    }

    async countAll() {
        return await this.model.countDocuments();
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}

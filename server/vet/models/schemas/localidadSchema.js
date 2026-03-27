import mongoose from "mongoose"
import { Localidad } from "../entidades/Localidad.js"

const localidadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    ciudad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ciudad",
        required: true
    }
})

// Indice para busqueda por nombre (findByName)
localidadSchema.index({ nombre: 1 });

localidadSchema.loadClass(Localidad)

export const LocalidadModel = mongoose.model("Localidad", localidadSchema)

 
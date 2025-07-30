import mongoose from "mongoose"
import { Ciudad } from "../entidades/Ciudad.js"

const ciudadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,   
        maxlength: 100
    }
})

ciudadSchema.loadClass(Ciudad)

export const CiudadModel = mongoose.model("Ciudad", ciudadSchema)
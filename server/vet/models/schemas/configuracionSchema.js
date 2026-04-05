import mongoose from "mongoose";

const configuracionSchema = new mongoose.Schema({
    comisionPorcentaje: {
        type: Number,
        required: true,
        default: 10,
        min: 0,
        max: 100,
    },
    comisionFija: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
    },
}, {
    timestamps: true,
});

export const ConfiguracionModel = mongoose.model("Configuracion", configuracionSchema);

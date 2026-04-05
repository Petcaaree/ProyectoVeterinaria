import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    tipoUsuario: {
        type: String,
        required: true,
        enum: ['cliente', 'veterinaria', 'paseador', 'cuidador', 'admin']
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index: MongoDB auto-elimina docs expirados
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indice compuesto para buscar tokens de un usuario
refreshTokenSchema.index({ userId: 1, tipoUsuario: 1 });

export const RefreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);

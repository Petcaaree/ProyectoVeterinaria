import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema({
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
        enum: ['cliente', 'veterinaria', 'paseador', 'cuidador']
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

passwordResetTokenSchema.index({ userId: 1, tipoUsuario: 1 });

export const PasswordResetTokenModel = mongoose.model("PasswordResetToken", passwordResetTokenSchema);

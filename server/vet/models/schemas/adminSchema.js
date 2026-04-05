import mongoose from "mongoose";
import { Admin } from "../entidades/Admin.js";

const adminSchema = new mongoose.Schema({
    nombreUsuario: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
            },
            message: (props) => `${props.value} no es un email valido!`,
        },
    },
    contrasenia: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        trim: true,
        minlength: 7,
        maxlength: 15,
        default: null,
    },
    rol: {
        type: String,
        required: true,
        enum: ['superadmin', 'moderator'],
        default: 'superadmin',
    },
}, {
    timestamps: true,
});

adminSchema.index({ email: 1 });

adminSchema.loadClass(Admin);

export const AdminModel = mongoose.model("Admin", adminSchema);

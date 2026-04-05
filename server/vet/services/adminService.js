import { ValidationError, NotFoundError, ConflictError } from "../errors/AppError.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";

export class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }

    async logIn(datos) {
        const { email, contrasenia } = datos;

        if (!email || !contrasenia) {
            throw new ValidationError("Faltan datos obligatorios");
        }

        const usuario = await this.adminRepository.findByEmail(email);
        if (!usuario) {
            throw new NotFoundError("Email o Contraseña incorrectas");
        }

        const contraseniaValida = await comparePassword(contrasenia, usuario.contrasenia);
        if (!contraseniaValida) {
            throw new ValidationError("Email o Contraseña incorrectas");
        }

        return this.toDTO(usuario);
    }

    async create(admin) {
        const { nombreUsuario, email, contrasenia } = admin;

        if (!nombreUsuario || !email || !contrasenia) {
            throw new ValidationError("Faltan datos obligatorios");
        }

        const mailExistente = await this.adminRepository.findByEmail(email);
        if (mailExistente) {
            throw new ConflictError("Email ya registrado");
        }

        const hashedPassword = await hashPassword(contrasenia);

        const nuevoAdmin = await this.adminRepository.save({
            nombreUsuario,
            email,
            contrasenia: hashedPassword,
            telefono: admin.telefono || null,
            rol: admin.rol || 'superadmin',
        });

        return this.toDTO(nuevoAdmin);
    }

    toDTO(admin) {
        return {
            id: admin._id || admin.id,
            nombreUsuario: admin.nombreUsuario,
            email: admin.email,
            rol: admin.rol,
            telefono: admin.telefono,
        };
    }
}

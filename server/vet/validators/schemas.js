import Joi from 'joi';

// ─── Helpers reutilizables ──────────────────────────────────

const direccionSchema = Joi.object({
    calle: Joi.string().trim().min(1).max(100).required(),
    altura: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    localidad: Joi.object({
        nombre: Joi.string().trim().min(1).max(100).required(),
        ciudad: Joi.object({
            nombre: Joi.string().trim().min(1).max(100).required()
        }).required()
    }).required()
});

const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
}).unknown(true); // permite query params extra como filtros

const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('ID inválido');

// ─── Autenticación ──────────────────────────────────────────

export const loginSchema = Joi.object({
    email: Joi.string().email().trim().required().messages({
        'string.email': 'El email no es válido',
        'any.required': 'El email es obligatorio'
    }),
    contrasenia: Joi.string().required().messages({
        'any.required': 'La contraseña es obligatoria'
    })
});

// ─── Registro de usuario (base) ─────────────────────────────

const registroBaseSchema = Joi.object({
    nombreUsuario: Joi.string().trim().min(1).max(100).required().messages({
        'any.required': 'El nombre de usuario es obligatorio',
        'string.min': 'El nombre de usuario no puede estar vacío',
        'string.max': 'El nombre de usuario no puede superar 100 caracteres'
    }),
    email: Joi.string().email().trim().required(),
    contrasenia: Joi.string().min(8).max(128).required().messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres'
    }),
    telefono: Joi.string().trim().min(7).max(15).required(),
    direccion: direccionSchema.required()
});

export const registroClienteSchema = registroBaseSchema;

export const registroVeterinariaSchema = registroBaseSchema.keys({
    nombreClinica: Joi.string().trim().min(1).max(200).optional()
});

export const registroPaseadorSchema = registroBaseSchema;
export const registroCuidadorSchema = registroBaseSchema;

// ─── Mascotas ───────────────────────────────────────────────

export const mascotaSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100).required(),
    tipo: Joi.string().valid('PERRO', 'GATO', 'AVE', 'OTRO').required(),
    raza: Joi.string().trim().min(1).max(20).allow(null).optional(),
    edad: Joi.number().integer().min(0).allow(null).optional(),
    peso: Joi.number().min(0).allow(null).optional(),
    fotos: Joi.array().items(Joi.string().trim().max(1000)).optional()
});

// ─── Servicios ──────────────────────────────────────────────

export const servicioVeterinariaSchema = Joi.object({
    idVeterinaria: objectIdSchema.required(),
    nombreServicio: Joi.string().trim().min(1).max(200).required(),
    tipoServicio: Joi.string().trim().required(),
    duracionMinutos: Joi.number().integer().min(1).required(),
    precio: Joi.number().min(0).required(),
    descripcion: Joi.string().trim().max(1000).optional().allow(''),
    nombreClinica: Joi.string().trim().max(200).optional().allow(''),
    emailClinica: Joi.string().email().optional().allow(''),
    telefonoClinica: Joi.string().trim().max(15).optional().allow(''),
    diasDisponibles: Joi.array().items(Joi.string()).optional(),
    horariosDisponibles: Joi.array().optional(),
    mascotasAceptadas: Joi.array().items(Joi.string()).optional(),
    direccion: direccionSchema.optional()
}).unknown(true);

export const servicioPaseadorSchema = Joi.object({
    idPaseador: objectIdSchema.required(),
    nombreServicio: Joi.string().trim().min(1).max(200).required(),
    duracionMinutos: Joi.number().integer().min(1).required(),
    precio: Joi.number().min(0).required(),
    descripcion: Joi.string().trim().max(1000).optional().allow(''),
    nombreContacto: Joi.string().trim().max(200).optional().allow(''),
    emailContacto: Joi.string().email().optional().allow(''),
    telefonoContacto: Joi.string().trim().max(15).optional().allow(''),
    diasDisponibles: Joi.array().items(Joi.string()).optional(),
    horariosDisponibles: Joi.array().optional(),
    direccion: direccionSchema.optional(),
    maxPerros: Joi.number().integer().min(1).optional()
}).unknown(true);

export const servicioCuidadorSchema = Joi.object({
    idCuidador: objectIdSchema.required(),
    nombreServicio: Joi.string().trim().min(1).max(200).required(),
    precio: Joi.number().min(0).required(),
    descripcion: Joi.string().trim().max(1000).optional().allow(''),
    nombreContacto: Joi.string().trim().max(200).optional().allow(''),
    emailContacto: Joi.string().email().optional().allow(''),
    telefonoContacto: Joi.string().trim().max(15).optional().allow(''),
    diasDisponibles: Joi.array().items(Joi.string()).optional(),
    mascotasAceptadas: Joi.array().items(Joi.string()).optional(),
    direccion: direccionSchema.optional()
}).unknown(true);

// ─── Reservas ───────────────────────────────────────────────

export const reservaSchema = Joi.object({
    clienteId: objectIdSchema.required(),
    serviciOfrecido: Joi.string().trim().valid('ServicioVeterinaria', 'ServicioPaseador', 'ServicioCuidador').required(),
    servicioReservadoId: objectIdSchema.required(),
    IdMascota: objectIdSchema.required(),
    rangoFechas: Joi.object({
        fechaInicio: Joi.string().trim().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required().messages({
            'string.pattern.base': 'fechaInicio debe tener formato DD/MM/AAAA'
        }),
        fechaFin: Joi.string().trim().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required().messages({
            'string.pattern.base': 'fechaFin debe tener formato DD/MM/AAAA'
        })
    }).required(),
    horario: Joi.string().trim().pattern(/^\d{2}:\d{2}$/).optional().allow(null, '', 'null').messages({
        'string.pattern.base': 'horario debe tener formato HH:MM'
    }),
    notaAdicional: Joi.string().trim().max(500).optional().allow(''),
    nombreDeContacto: Joi.string().trim().min(1).max(200).required(),
    telefonoContacto: Joi.string().trim().min(7).max(15).required(),
    emailContacto: Joi.string().email().required()
}).unknown(true);

// ─── Reset de contraseña ────────────────────────────────────

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().trim().required().messages({
        'string.email': 'El email no es válido',
        'any.required': 'El email es obligatorio'
    }),
    tipoUsuario: Joi.string().valid('cliente', 'veterinaria', 'paseador', 'cuidador').required().messages({
        'any.only': 'Tipo de usuario inválido',
        'any.required': 'El tipo de usuario es obligatorio'
    })
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'El token es obligatorio'
    }),
    contrasenia: Joi.string().min(8).max(128).required().messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'any.required': 'La contraseña es obligatoria'
    })
});

// ─── Params comunes ─────────────────────────────────────────

export const idParamSchema = Joi.object({
    id: objectIdSchema.required()
}).unknown(true); // permite params extra (:idReserva, :estado, etc.)

export { paginationSchema };

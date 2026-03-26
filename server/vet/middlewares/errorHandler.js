import mongoose from "mongoose";
import { ValidationError as CustomValidationError, AppError } from "../errors/AppError.js";

/**
 * Convierte errores conocidos (Mongoose, MongoDB, Joi) en AppError operacionales.
 * Los errores desconocidos se tratan como 500 internos.
 */
function normalizeError(err) {
  // Mongoose schema validation
  if (err instanceof mongoose.Error.ValidationError) {
    const mensajes = Object.values(err.errors).map(e => e.message);
    return new CustomValidationError(mensajes.join(' | '));
  }

  // Mongoose CastError (ej: ObjectId inválido en params)
  if (err instanceof mongoose.Error.CastError) {
    return new CustomValidationError(`Valor inválido para ${err.path}: ${err.value}`);
  }

  // MongoDB duplicate key (código 11000)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern || {}).join(', ');
    return new AppError(`Valor duplicado en: ${campo}. Ya existe un registro con ese dato.`, 409);
  }

  // Joi validation (por si se lanza directamente en lugar de usar el middleware)
  if (err.isJoi) {
    const mensajes = err.details.map(d => d.message).join(' | ');
    return new CustomValidationError(mensajes);
  }

  // JSON parse error (body mal formado)
  if (err.type === 'entity.parse.failed') {
    return new CustomValidationError('El cuerpo del request no es JSON válido');
  }

  return err;
}

export const errorHandler = (err, req, res, next) => {
  err = normalizeError(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.statusCode === 500 && { stack: err.stack })
    });
  } else {
    // Producción
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Error de programación: no enviar detalles al cliente
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Algo salió mal'
      });
    }
  }
}; 
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

/**
 * Valida que la contrasena cumpla requisitos de complejidad.
 * Debe tener minimo 8 caracteres, al menos una minuscula, una mayuscula,
 * un digito y un caracter especial.
 * @param {string} contrasenia - Contrasena en texto plano
 * @returns {boolean} true si cumple, false si no
 */
export function validatePasswordComplexity(contrasenia) {
    return PASSWORD_REGEX.test(contrasenia);
}

/**
 * Hashea una contrasena en texto plano usando bcrypt.
 * Valida complejidad antes de hashear.
 * @param {string} contrasenia - Contrasena en texto plano
 * @returns {Promise<string>} Hash de la contrasena
 * @throws {Error} Si la contrasena no cumple requisitos de complejidad
 */
export async function hashPassword(contrasenia) {
    if (!validatePasswordComplexity(contrasenia)) {
        throw new Error("La contrasena debe tener minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial");
    }
    return bcrypt.hash(contrasenia, SALT_ROUNDS);
}

/**
 * Compara una contrasena en texto plano contra un hash almacenado.
 * @param {string} contrasenia - Contrasena en texto plano ingresada por el usuario
 * @param {string} hash - Hash almacenado en la base de datos
 * @returns {Promise<boolean>} true si coincide, false si no
 */
export async function comparePassword(contrasenia, hash) {
    return bcrypt.compare(contrasenia, hash);
}

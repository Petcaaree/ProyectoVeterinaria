/**
 * Script de migracion: hashea todas las contrasenas en texto plano existentes en la DB.
 *
 * USO: cd server && node scripts/migrarContraseniasABcrypt.js
 *
 * IMPORTANTE: Ejecutar UNA SOLA VEZ. Si se ejecuta sobre hashes ya existentes,
 * se re-hashean y las cuentas quedan inutilizables.
 * El script detecta si una contrasena ya esta hasheada (empieza con $2b$) y la salta.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vet';

async function migrar() {
    console.log(`Conectando a ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB.\n');

    const colecciones = ['clientes', 'veterinarias', 'paseadors', 'cuidadors'];

    for (const coleccion of colecciones) {
        console.log(`--- Migrando coleccion: ${coleccion} ---`);
        const collection = mongoose.connection.collection(coleccion);
        const usuarios = await collection.find({}).toArray();

        let migrados = 0;
        let saltados = 0;

        for (const usuario of usuarios) {
            if (!usuario.contrasenia) {
                console.log(`  [SKIP] ${usuario.email || usuario._id}: sin contrasenia`);
                saltados++;
                continue;
            }

            // Detectar si ya esta hasheada (bcrypt hashes empiezan con $2b$ o $2a$)
            if (usuario.contrasenia.startsWith('$2b$') || usuario.contrasenia.startsWith('$2a$')) {
                console.log(`  [SKIP] ${usuario.email || usuario._id}: ya hasheada`);
                saltados++;
                continue;
            }

            const hash = await bcrypt.hash(usuario.contrasenia, SALT_ROUNDS);
            await collection.updateOne(
                { _id: usuario._id },
                { $set: { contrasenia: hash } }
            );
            console.log(`  [OK] ${usuario.email || usuario._id}: migrada`);
            migrados++;
        }

        console.log(`  Resultado: ${migrados} migradas, ${saltados} saltadas\n`);
    }

    console.log('Migracion completada.');
    await mongoose.disconnect();
    process.exit(0);
}

migrar().catch(err => {
    console.error('Error en migracion:', err);
    process.exit(1);
});

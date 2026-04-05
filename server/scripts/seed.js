/**
 * Seed Script — Carga datos de ejemplo en la BDD para desarrollo/testing.
 *
 * Uso:
 *   node scripts/seed.js           → Carga seed si la BDD está vacía
 *   node scripts/seed.js --force   → Borra TODO y recarga desde cero
 *
 * Crea:
 *   - 2 Ciudades, 4 Localidades
 *   - 2 Clientes (con mascotas)
 *   - 2 Veterinarias + 3 servicios veterinarios
 *   - 2 Paseadores + 2 servicios de paseo
 *   - 2 Cuidadores + 2 servicios de cuidado
 *
 * Password de todos los usuarios: Test1234!
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Cargar .env desde la raíz del servidor
dotenv.config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') });

// Importar modelos
import { CiudadModel } from '../vet/models/schemas/ciudadSchema.js';
import { LocalidadModel } from '../vet/models/schemas/localidadSchema.js';
import { ClienteModel } from '../vet/models/schemas/clienteSchema.js';
import { VeterinariaModel } from '../vet/models/schemas/veterinariaSchema.js';
import { PaseadorModel } from '../vet/models/schemas/paseadorSchema.js';
import { CuidadorModel } from '../vet/models/schemas/cuidadorSchema.js';
import { ServicioVeterinariaModel } from '../vet/models/schemas/servicioVeterinariaSchema.js';
import { ServicioPaseadorModel } from '../vet/models/schemas/servicioPaseadorSchema.js';
import { ServicioCuidadorModel } from '../vet/models/schemas/servicioCuidadorSchema.js';
import { AdminModel } from '../vet/models/schemas/adminSchema.js';

// ─── Configuración ────────────────────────────────────────────
const SEED_PASSWORD = 'Test1234!'; // Cumple regex: mayúscula, minúscula, número, especial, 8+ chars
const SALT_ROUNDS = 10;
const FORCE = process.argv.includes('--force');

// ─── Helpers ──────────────────────────────────────────────────
const log = (msg) => console.log(`[seed] ${msg}`);
const logOk = (msg) => console.log(`[seed] ✅ ${msg}`);
const logWarn = (msg) => console.log(`[seed] ⚠️  ${msg}`);

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('[seed] ❌ MONGODB_URI no definida. Configurá tu .env');
        process.exit(1);
    }
    await mongoose.connect(uri);
    log(`Conectado a MongoDB: ${mongoose.connection.name}`);
}

async function isDatabaseEmpty() {
    const counts = await Promise.all([
        ClienteModel.countDocuments(),
        VeterinariaModel.countDocuments(),
        PaseadorModel.countDocuments(),
        CuidadorModel.countDocuments(),
    ]);
    return counts.every(c => c === 0);
}

async function clearDatabase() {
    logWarn('Limpiando base de datos...');
    await Promise.all([
        ClienteModel.deleteMany({}),
        VeterinariaModel.deleteMany({}),
        PaseadorModel.deleteMany({}),
        CuidadorModel.deleteMany({}),
        ServicioVeterinariaModel.deleteMany({}),
        ServicioPaseadorModel.deleteMany({}),
        ServicioCuidadorModel.deleteMany({}),
        AdminModel.deleteMany({}),
        CiudadModel.deleteMany({}),
        LocalidadModel.deleteMany({}),
    ]);
    logOk('Base de datos limpiada');
}

// ─── Datos de ejemplo ─────────────────────────────────────────

async function seedCiudadesYLocalidades() {
    const buenosAires = await CiudadModel.create({ nombre: 'Buenos Aires' });
    const cordoba = await CiudadModel.create({ nombre: 'Córdoba' });

    const palermo = await LocalidadModel.create({ nombre: 'Palermo', ciudad: buenosAires._id });
    const belgrano = await LocalidadModel.create({ nombre: 'Belgrano', ciudad: buenosAires._id });
    const nuevaCordoba = await LocalidadModel.create({ nombre: 'Nueva Córdoba', ciudad: cordoba._id });
    const alberdi = await LocalidadModel.create({ nombre: 'Alberdi', ciudad: cordoba._id });

    logOk(`Ciudades: ${buenosAires.nombre}, ${cordoba.nombre}`);
    logOk(`Localidades: Palermo, Belgrano, Nueva Córdoba, Alberdi`);

    return { buenosAires, cordoba, palermo, belgrano, nuevaCordoba, alberdi };
}

async function seedClientes(localidades) {
    const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

    const cliente1 = await ClienteModel.create({
        nombreUsuario: 'Maria García',
        email: 'maria@example.com',
        contrasenia: hash,
        telefono: '1155667788',
        direccion: {
            calle: 'Av. Santa Fe',
            altura: '3200',
            localidad: localidades.palermo._id,
        },
        mascotas: [
            { nombre: 'Rocky', edad: 3, tipo: 'PERRO', raza: 'Labrador', peso: 28, fotos: [] },
            { nombre: 'Luna', edad: 2, tipo: 'GATO', raza: 'Siamés', peso: 4, fotos: [] },
        ],
        notificaciones: [],
    });

    const cliente2 = await ClienteModel.create({
        nombreUsuario: 'Juan Pérez',
        email: 'juan@example.com',
        contrasenia: hash,
        telefono: '1144556677',
        direccion: {
            calle: 'Cabildo',
            altura: '1800',
            localidad: localidades.belgrano._id,
        },
        mascotas: [
            { nombre: 'Max', edad: 5, tipo: 'PERRO', raza: 'Golden', peso: 32, fotos: [] },
            { nombre: 'Pipi', edad: 1, tipo: 'AVE', raza: 'Canario', peso: 0.03, fotos: [] },
        ],
        notificaciones: [],
    });

    logOk(`Clientes: ${cliente1.nombreUsuario} (${cliente1.email}), ${cliente2.nombreUsuario} (${cliente2.email})`);
    return { cliente1, cliente2 };
}

async function seedVeterinarias(localidades) {
    const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

    const vet1 = await VeterinariaModel.create({
        nombreUsuario: 'Dra. Ana Rodríguez',
        nombreClinica: 'Clínica Veterinaria Palermo',
        email: 'clinica.palermo@example.com',
        contrasenia: hash,
        telefono: '1133445566',
        direccion: {
            calle: 'Honduras',
            altura: '4800',
            localidad: localidades.palermo._id,
        },
        notificaciones: [],
    });

    const vet2 = await VeterinariaModel.create({
        nombreUsuario: 'Dr. Carlos López',
        nombreClinica: 'VetCenter Córdoba',
        email: 'vetcenter.cba@example.com',
        contrasenia: hash,
        telefono: '3514556677',
        direccion: {
            calle: 'Av. Hipólito Yrigoyen',
            altura: '350',
            localidad: localidades.nuevaCordoba._id,
        },
        notificaciones: [],
    });

    logOk(`Veterinarias: ${vet1.nombreClinica}, ${vet2.nombreClinica}`);
    return { vet1, vet2 };
}

async function seedPaseadores(localidades) {
    const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

    const paseador1 = await PaseadorModel.create({
        nombreUsuario: 'Lucas Fernández',
        email: 'lucas.paseos@example.com',
        contrasenia: hash,
        telefono: '1122334455',
        direccion: {
            calle: 'Av. del Libertador',
            altura: '5500',
            localidad: localidades.belgrano._id,
        },
        notificaciones: [],
    });

    const paseador2 = await PaseadorModel.create({
        nombreUsuario: 'Sofía Martínez',
        email: 'sofia.paseos@example.com',
        contrasenia: hash,
        telefono: '3519887766',
        direccion: {
            calle: 'Bv. San Juan',
            altura: '900',
            localidad: localidades.alberdi._id,
        },
        notificaciones: [],
    });

    logOk(`Paseadores: ${paseador1.nombreUsuario}, ${paseador2.nombreUsuario}`);
    return { paseador1, paseador2 };
}

async function seedCuidadores(localidades) {
    const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

    const cuidador1 = await CuidadorModel.create({
        nombreUsuario: 'Valentina Romero',
        email: 'valentina.cuida@example.com',
        contrasenia: hash,
        telefono: '1166778899',
        direccion: {
            calle: 'Thames',
            altura: '1200',
            localidad: localidades.palermo._id,
        },
        notificaciones: [],
    });

    const cuidador2 = await CuidadorModel.create({
        nombreUsuario: 'Diego Sánchez',
        email: 'diego.cuida@example.com',
        contrasenia: hash,
        telefono: '3516655443',
        direccion: {
            calle: 'Av. Colón',
            altura: '600',
            localidad: localidades.nuevaCordoba._id,
        },
        notificaciones: [],
    });

    logOk(`Cuidadores: ${cuidador1.nombreUsuario}, ${cuidador2.nombreUsuario}`);
    return { cuidador1, cuidador2 };
}

async function seedServiciosVeterinaria(vets, localidades) {
    const servicios = await ServicioVeterinariaModel.insertMany([
        {
            usuarioProveedor: vets.vet1._id,
            nombreServicio: 'Control general canino',
            tipoServicio: 'Control',
            precio: 15000,
            descripcion: 'Control clínico completo para perros. Incluye revisión general, auscultación, peso, y recomendaciones nutricionales.',
            direccion: { calle: 'Honduras', altura: '4800', localidad: localidades.palermo._id },
            emailClinica: 'clinica.palermo@example.com',
            telefonoClinica: 1133445566,
            duracionMinutos: 30,
            nombreClinica: 'Clínica Veterinaria Palermo',
            diasDisponibles: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            horariosDisponibles: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
            mascotasAceptadas: ['PERRO'],
            estado: 'Activada',
        },
        {
            usuarioProveedor: vets.vet1._id,
            nombreServicio: 'Vacunación felina',
            tipoServicio: 'Vacunacion',
            precio: 12000,
            descripcion: 'Aplicación de vacunas para gatos según calendario de vacunación. Triple felina, antirrábica y leucemia felina.',
            direccion: { calle: 'Honduras', altura: '4800', localidad: localidades.palermo._id },
            emailClinica: 'clinica.palermo@example.com',
            telefonoClinica: 1133445566,
            duracionMinutos: 30,
            nombreClinica: 'Clínica Veterinaria Palermo',
            diasDisponibles: ['LUNES', 'MIERCOLES', 'VIERNES'],
            horariosDisponibles: ['10:00', '10:30', '11:00', '16:00', '16:30'],
            mascotasAceptadas: ['GATO'],
            estado: 'Activada',
        },
        {
            usuarioProveedor: vets.vet2._id,
            nombreServicio: 'Ecografía abdominal',
            tipoServicio: 'Ecografia',
            precio: 25000,
            descripcion: 'Ecografía abdominal completa para diagnóstico por imágenes. Indicada para control de órganos internos.',
            direccion: { calle: 'Av. Hipólito Yrigoyen', altura: '350', localidad: localidades.nuevaCordoba._id },
            emailClinica: 'vetcenter.cba@example.com',
            telefonoClinica: 3514556677,
            duracionMinutos: 60,
            nombreClinica: 'VetCenter Córdoba',
            diasDisponibles: ['MARTES', 'JUEVES'],
            horariosDisponibles: ['09:00', '10:00', '11:00'],
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
        },
    ]);

    logOk(`Servicios veterinarios: ${servicios.length} creados`);
    return servicios;
}

async function seedServiciosPaseador(paseadores, localidades) {
    const servicios = await ServicioPaseadorModel.insertMany([
        {
            usuarioProveedor: paseadores.paseador1._id,
            nombreServicio: 'Paseo grupal por parques de Belgrano',
            precio: 5000,
            descripcion: 'Paseo grupal de 1 hora por los parques de Belgrano. Máximo 4 perros por grupo. Incluye agua y snacks.',
            nombreContacto: 'Lucas Fernández',
            emailContacto: 'lucas.paseos@example.com',
            telefonoContacto: '1122334455',
            duracionMinutos: 60,
            diasDisponibles: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
            horariosDisponibles: ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
            estado: 'Activada',
            maxPerros: 4,
            direccion: { calle: 'Av. del Libertador', altura: '5500', localidad: localidades.belgrano._id },
        },
        {
            usuarioProveedor: paseadores.paseador2._id,
            nombreServicio: 'Paseo individual personalizado',
            precio: 4000,
            descripcion: 'Paseo individual de 30 minutos adaptado a las necesidades de tu perro. Ideal para cachorros o perros nerviosos.',
            nombreContacto: 'Sofía Martínez',
            emailContacto: 'sofia.paseos@example.com',
            telefonoContacto: '3519887766',
            duracionMinutos: 30,
            diasDisponibles: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
            horariosDisponibles: ['08:00', '09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'],
            estado: 'Activada',
            maxPerros: 2,
            direccion: { calle: 'Bv. San Juan', altura: '900', localidad: localidades.alberdi._id },
        },
    ]);

    logOk(`Servicios de paseo: ${servicios.length} creados`);
    return servicios;
}

async function seedServiciosCuidador(cuidadores, localidades) {
    const servicios = await ServicioCuidadorModel.insertMany([
        {
            usuarioProveedor: cuidadores.cuidador1._id,
            nombreServicio: 'Hospedaje para perros y gatos en Palermo',
            precio: 18000,
            descripcion: 'Cuidado en mi hogar con patio. Tu mascota tendrá compañía 24hs, paseos diarios y alimentación incluida. Envío fotos y videos.',
            nombreContacto: 'Valentina Romero',
            emailContacto: 'valentina.cuida@example.com',
            telefonoContacto: '1166778899',
            diasDisponibles: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
            direccion: { calle: 'Thames', altura: '1200', localidad: localidades.palermo._id },
        },
        {
            usuarioProveedor: cuidadores.cuidador2._id,
            nombreServicio: 'Guardería diurna para mascotas',
            precio: 10000,
            descripcion: 'Guardería de día en ambiente tranquilo. Acepto perros, gatos y aves. Espacio climatizado y seguro.',
            nombreContacto: 'Diego Sánchez',
            emailContacto: 'diego.cuida@example.com',
            telefonoContacto: '3516655443',
            diasDisponibles: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            mascotasAceptadas: ['PERRO', 'GATO', 'AVE'],
            estado: 'Activada',
            direccion: { calle: 'Av. Colón', altura: '600', localidad: localidades.nuevaCordoba._id },
        },
    ]);

    logOk(`Servicios de cuidado: ${servicios.length} creados`);
    return servicios;
}

async function seedAdmin() {
    const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

    const admin = await AdminModel.create({
        nombreUsuario: 'Administrador',
        email: 'admin@petconnect.com',
        contrasenia: hash,
        telefono: '1100000000',
        rol: 'superadmin',
    });

    logOk(`Admin: ${admin.nombreUsuario} (${admin.email})`);
    return admin;
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
    try {
        await connectDB();

        if (!FORCE) {
            const empty = await isDatabaseEmpty();
            if (!empty) {
                logWarn('La base de datos ya tiene datos. Usa --force para borrar y recargar.');
                logWarn('Ejemplo: node scripts/seed.js --force');
                process.exit(0);
            }
        } else {
            await clearDatabase();
        }

        log('Cargando datos de ejemplo...\n');

        // 1. Ciudades y localidades
        const localidades = await seedCiudadesYLocalidades();

        // 2. Usuarios
        const clientes = await seedClientes(localidades);
        const vets = await seedVeterinarias(localidades);
        const paseadores = await seedPaseadores(localidades);
        const cuidadores = await seedCuidadores(localidades);

        // 3. Servicios
        await seedServiciosVeterinaria(vets, localidades);
        await seedServiciosPaseador(paseadores, localidades);
        await seedServiciosCuidador(cuidadores, localidades);

        // 4. Admin
        await seedAdmin();

        console.log('\n' + '═'.repeat(60));
        logOk('¡Seed completado exitosamente!');
        console.log('═'.repeat(60));
        console.log(`
  📋 Credenciales de todos los usuarios:
     Password: ${SEED_PASSWORD}

  👤 Clientes:
     • maria@example.com  (Maria García — Palermo, CABA)
     • juan@example.com   (Juan Pérez — Belgrano, CABA)

  🏥 Veterinarias:
     • clinica.palermo@example.com  (Clínica Veterinaria Palermo)
     • vetcenter.cba@example.com    (VetCenter Córdoba)

  🐕 Paseadores:
     • lucas.paseos@example.com  (Lucas Fernández — Belgrano)
     • sofia.paseos@example.com  (Sofía Martínez — Alberdi, Córdoba)

  🔑 Admin:
     • admin@petconnect.com  (Administrador)

  🏠 Cuidadores:
     • valentina.cuida@example.com  (Valentina Romero — Palermo)
     • diego.cuida@example.com      (Diego Sánchez — Nueva Córdoba)
`);

    } catch (error) {
        console.error('[seed] ❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        log('Desconectado de MongoDB');
    }
}

main();

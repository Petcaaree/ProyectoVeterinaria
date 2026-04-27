/**
 * Seed Script — Carga datos de ejemplo completos en la BDD para desarrollo/testing.
 *
 * Uso:
 *   npm run seed     → Borra TODA la base existente y recarga desde cero.
 *
 * Crea:
 *   - 2 Ciudades, 4 Localidades
 *   - 3 Clientes (2 mascotas cada uno)
 *   - 3 Veterinarias + 5 servicios veterinarios (una con 2, otras con 1/2)
 *   - 3 Paseadores + 5 servicios de paseo (mix 2/2/1)
 *   - 3 Cuidadores + 4 servicios de cuidado (mix 2/1/1)
 *   - Reservas de muestra en estados PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA
 *   - Reseñas para cada reserva COMPLETADA (con recálculo de calificacionPromedio y cantidadResenas)
 *   - Notificaciones de muestra en cada proveedor
 *
 * Password de todos los usuarios: Luka1169@
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') });

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
import { ReservaModel } from '../vet/models/schemas/reservaSchema.js';
import { ResenaModel } from '../vet/models/schemas/resenaSchema.js';

// ─── Configuración ────────────────────────────────────────────
const SEED_PASSWORD = 'Luka1169@';
const SALT_ROUNDS = 10;

// ─── Helpers ──────────────────────────────────────────────────
const log = (msg) => console.log(`[seed] ${msg}`);
const logOk = (msg) => console.log(`[seed] ✅ ${msg}`);
const logWarn = (msg) => console.log(`[seed] ⚠️  ${msg}`);

const diasTodos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

// Todas las reservas se generan con fechas del 2027 (mes, día).
function fecha2027(mes, dia) {
    return new Date(2027, mes - 1, dia, 10, 0, 0, 0);
}

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('[seed] ❌ MONGODB_URI no definida. Configurá tu .env');
        process.exit(1);
    }
    await mongoose.connect(uri);
    log(`Conectado a MongoDB: ${mongoose.connection.name}`);
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
        ReservaModel.deleteMany({}),
        ResenaModel.deleteMany({}),
    ]);
    logOk('Base de datos limpiada');
}

// ─── Datos geográficos ────────────────────────────────────────

async function seedCiudadesYLocalidades() {
    const buenosAires = await CiudadModel.create({ nombre: 'Buenos Aires' });
    const cordoba = await CiudadModel.create({ nombre: 'Córdoba' });
    const lomasDeZamora = await CiudadModel.create({ nombre: 'Lomas de Zamora' });

    const palermo = await LocalidadModel.create({ nombre: 'Palermo', ciudad: buenosAires._id });
    const belgrano = await LocalidadModel.create({ nombre: 'Belgrano', ciudad: buenosAires._id });
    const almagro = await LocalidadModel.create({ nombre: 'Almagro', ciudad: buenosAires._id });
    const recoleta = await LocalidadModel.create({ nombre: 'Recoleta', ciudad: buenosAires._id });
    const lomas = await LocalidadModel.create({ nombre: 'Lomas Centro', ciudad: lomasDeZamora._id });
    const nuevaCordoba = await LocalidadModel.create({ nombre: 'Nueva Córdoba', ciudad: cordoba._id });
    const alberdi = await LocalidadModel.create({ nombre: 'Alberdi', ciudad: cordoba._id });

    logOk(`Ciudades y localidades creadas`);
    return { buenosAires, cordoba, lomasDeZamora, palermo, belgrano, almagro, recoleta, lomas, nuevaCordoba, alberdi };
}

// ─── Usuarios ─────────────────────────────────────────────────

async function seedClientes(localidades, hash) {
    const clientes = await Promise.all([
        ClienteModel.create({
            nombreUsuario: 'Maria García',
            email: 'maria@example.com',
            contrasenia: hash,
            telefono: '1155667788',
            direccion: { calle: 'Av. Santa Fe', altura: '3200', localidad: localidades.palermo._id },
            mascotas: [
                { nombre: 'Rocky', edad: 3, tipo: 'PERRO', raza: 'Labrador', peso: 28, fotos: [] },
                { nombre: 'Luna', edad: 2, tipo: 'GATO', raza: 'Siamés', peso: 4, fotos: [] },
            ],
            notificaciones: [],
        }),
        ClienteModel.create({
            nombreUsuario: 'Juan Pérez',
            email: 'juan@example.com',
            contrasenia: hash,
            telefono: '1144556677',
            direccion: { calle: 'Cabildo', altura: '1800', localidad: localidades.belgrano._id },
            mascotas: [
                { nombre: 'Max', edad: 5, tipo: 'PERRO', raza: 'Golden', peso: 32, fotos: [] },
                { nombre: 'Pipi', edad: 1, tipo: 'AVE', raza: 'Canario', peso: 0.03, fotos: [] },
            ],
            notificaciones: [],
        }),
        ClienteModel.create({
            nombreUsuario: 'Laura Gómez',
            email: 'laura@example.com',
            contrasenia: hash,
            telefono: '3514667788',
            direccion: { calle: 'Av. Vélez Sársfield', altura: '400', localidad: localidades.nuevaCordoba._id },
            mascotas: [
                { nombre: 'Toby', edad: 4, tipo: 'PERRO', raza: 'Caniche', peso: 8, fotos: [] },
                { nombre: 'Michi', edad: 3, tipo: 'GATO', raza: 'Persa', peso: 5, fotos: [] },
            ],
            notificaciones: [],
        }),
    ]);
    logOk(`Clientes: ${clientes.length}`);
    return clientes;
}

// Verificación dummy para que las veterinarias del seed estén habilitadas a crear servicios.
// Documentos dummy según tipo de establecimiento.
function docsDummy(tipo) {
    if (tipo === 'CONSULTORIO_PRIVADO') {
        return [
            { tipo: 'FOTO_INTERIOR', url: 'https://placehold.co/400x300/8b5cf6/white?text=Consultorio' },
            { tipo: 'COMPROBANTE_DOMICILIO', url: 'https://placehold.co/400x300/8b5cf6/white?text=Domicilio' },
            { tipo: 'CONSTANCIA_FISCAL', url: 'https://placehold.co/400x300/8b5cf6/white?text=Fiscal' },
        ];
    }
    return [
        { tipo: 'HABILITACION_MUNICIPAL', url: 'https://placehold.co/400x300/8b5cf6/white?text=Habilitacion' },
        { tipo: 'FOTO_FRENTE', url: 'https://placehold.co/400x300/8b5cf6/white?text=Frente' },
        { tipo: 'FOTO_INTERIOR', url: 'https://placehold.co/400x300/8b5cf6/white?text=Interior' },
    ];
}

function verificacionDummy({
    tipo, razonSocial, cuit, matricula, calle, numero, localidad, provincia, telefono,
    estado = 'VERIFICADO', motivoRechazo = null,
}) {
    return {
        tipoEstablecimiento: tipo,
        razonSocial: razonSocial ?? null,
        cuit,
        matriculaProfesional: matricula,
        direccion: { calle, numero, piso: null, depto: null, localidad, provincia, codigoPostal: '1000' },
        telefono,
        documentos: docsDummy(tipo),
        estadoVerificacion: estado,
        motivoRechazo,
        fechaActualizacion: new Date(),
    };
}

async function seedVeterinarias(localidades, hash) {
    const vets = await Promise.all([
        // ── 3 VERIFICADAS (pueden crear servicios y aparecen en búsquedas) ─────
        VeterinariaModel.create({
            nombreUsuario: 'Dra. Ana Rodríguez',
            nombreClinica: 'Clínica Veterinaria Palermo',
            email: 'clinica.palermo@example.com',
            contrasenia: hash,
            telefono: '1133445566',
            direccion: { calle: 'Honduras', altura: '4800', localidad: localidades.palermo._id },
            notificaciones: [],
            verificacion: verificacionDummy({
                tipo: 'CLINICA', razonSocial: 'Clínica Palermo SRL', cuit: '30-12345678-9',
                matricula: 'MP-1234', calle: 'Honduras', numero: '4800',
                localidad: 'Palermo', provincia: 'CABA', telefono: '1133445566',
            }),
        }),
        VeterinariaModel.create({
            nombreUsuario: 'Dr. Carlos López',
            nombreClinica: 'VetCenter Córdoba',
            email: 'vetcenter.cba@example.com',
            contrasenia: hash,
            telefono: '3514556677',
            direccion: { calle: 'Av. Hipólito Yrigoyen', altura: '350', localidad: localidades.nuevaCordoba._id },
            notificaciones: [],
            verificacion: verificacionDummy({
                tipo: 'HOSPITAL', razonSocial: 'VetCenter Córdoba SA', cuit: '30-87654321-2',
                matricula: 'MP-5678', calle: 'Av. Hipólito Yrigoyen', numero: '350',
                localidad: 'Nueva Córdoba', provincia: 'Córdoba', telefono: '3514556677',
            }),
        }),
        VeterinariaModel.create({
            nombreUsuario: 'Dra. Marta Silva',
            nombreClinica: 'Belgrano Pet Hospital',
            email: 'belgrano.pet@example.com',
            contrasenia: hash,
            telefono: '1155112233',
            direccion: { calle: 'Juramento', altura: '2500', localidad: localidades.belgrano._id },
            notificaciones: [],
            verificacion: verificacionDummy({
                tipo: 'CLINICA', razonSocial: 'Belgrano Pet SRL', cuit: '30-11223344-5',
                matricula: 'MP-9012', calle: 'Juramento', numero: '2500',
                localidad: 'Belgrano', provincia: 'CABA', telefono: '1155112233',
            }),
        }),
        // ── 1 PENDIENTE (esperando aprobación admin) ──────────────────────────
        VeterinariaModel.create({
            nombreUsuario: 'Dr. Pablo Torres',
            nombreClinica: 'Clínica Almagro',
            email: 'clinica.almagro@example.com',
            contrasenia: hash,
            telefono: '1144112299',
            direccion: { calle: 'Rivadavia', altura: '4100', localidad: localidades.almagro._id },
            notificaciones: [],
            verificacion: verificacionDummy({
                tipo: 'CLINICA', razonSocial: 'Almagro Vet SRL', cuit: '30-22334455-6',
                matricula: 'MP-3344', calle: 'Rivadavia', numero: '4100',
                localidad: 'Almagro', provincia: 'CABA', telefono: '1144112299',
                estado: 'PENDIENTE',
            }),
        }),
        // ── 1 RECHAZADA (tiene motivo de rechazo, debe usar reenviar) ────────
        VeterinariaModel.create({
            nombreUsuario: 'Dra. Lucía Méndez',
            nombreClinica: 'VetSur Lomas',
            email: 'vetsur.lomas@example.com',
            contrasenia: hash,
            telefono: '1122994455',
            direccion: { calle: 'Hipólito Yrigoyen', altura: '8500', localidad: localidades.lomas._id },
            notificaciones: [],
            verificacion: verificacionDummy({
                tipo: 'CLINICA', razonSocial: 'VetSur SRL', cuit: '30-99887766-1',
                matricula: 'MP-7766', calle: 'Hipólito Yrigoyen', numero: '8500',
                localidad: 'Lomas Centro', provincia: 'Buenos Aires', telefono: '1122994455',
                estado: 'RECHAZADO',
                motivoRechazo: 'La foto del frente está borrosa y no se lee la numeración. Volvé a sacar la foto en horario diurno mostrando claramente el cartel y la altura de la calle.',
            }),
        }),
        // ── 1 NO_INICIADA (recién registrada, sin verificación) ──────────────
        VeterinariaModel.create({
            nombreUsuario: 'Dra. Sofía Romero',
            nombreClinica: 'Clínica Recoleta',
            email: 'recoleta.vet@example.com',
            contrasenia: hash,
            telefono: '1133887700',
            direccion: { calle: 'Junín', altura: '1200', localidad: localidades.recoleta._id },
            notificaciones: [],
            // verificacion: null (default) → estado NO_INICIADA
        }),
    ]);
    logOk(`Veterinarias: ${vets.length} (3 VERIFICADAS, 1 PENDIENTE, 1 RECHAZADA, 1 NO_INICIADA)`);
    return vets;
}

async function seedPaseadores(localidades, hash) {
    const paseadores = await Promise.all([
        PaseadorModel.create({
            nombreUsuario: 'Lucas Fernández',
            email: 'lucas.paseos@example.com',
            contrasenia: hash,
            telefono: '1122334455',
            direccion: { calle: 'Av. del Libertador', altura: '5500', localidad: localidades.belgrano._id },
            notificaciones: [],
        }),
        PaseadorModel.create({
            nombreUsuario: 'Sofía Martínez',
            email: 'sofia.paseos@example.com',
            contrasenia: hash,
            telefono: '3519887766',
            direccion: { calle: 'Bv. San Juan', altura: '900', localidad: localidades.alberdi._id },
            notificaciones: [],
        }),
        PaseadorModel.create({
            nombreUsuario: 'Tomás Herrera',
            email: 'tomas.paseos@example.com',
            contrasenia: hash,
            telefono: '1177889900',
            direccion: { calle: 'Gorriti', altura: '4200', localidad: localidades.palermo._id },
            notificaciones: [],
        }),
    ]);
    logOk(`Paseadores: ${paseadores.length}`);
    return paseadores;
}

async function seedCuidadores(localidades, hash) {
    const cuidadores = await Promise.all([
        CuidadorModel.create({
            nombreUsuario: 'Valentina Romero',
            email: 'valentina.cuida@example.com',
            contrasenia: hash,
            telefono: '1166778899',
            direccion: { calle: 'Thames', altura: '1200', localidad: localidades.palermo._id },
            notificaciones: [],
        }),
        CuidadorModel.create({
            nombreUsuario: 'Diego Sánchez',
            email: 'diego.cuida@example.com',
            contrasenia: hash,
            telefono: '3516655443',
            direccion: { calle: 'Av. Colón', altura: '600', localidad: localidades.nuevaCordoba._id },
            notificaciones: [],
        }),
        CuidadorModel.create({
            nombreUsuario: 'Paula Ibáñez',
            email: 'paula.cuida@example.com',
            contrasenia: hash,
            telefono: '1144778855',
            direccion: { calle: 'Echeverría', altura: '2100', localidad: localidades.belgrano._id },
            notificaciones: [],
        }),
    ]);
    logOk(`Cuidadores: ${cuidadores.length}`);
    return cuidadores;
}

async function seedAdmin(hash) {
    const admin = await AdminModel.create({
        nombreUsuario: 'Administrador',
        email: 'admin@petconnect.com',
        contrasenia: hash,
        telefono: '1100000000',
        rol: 'superadmin',
    });
    logOk(`Admin: ${admin.email}`);
    return admin;
}

// ─── Servicios ────────────────────────────────────────────────

async function seedServiciosVeterinaria(vets, localidades) {
    const docs = [
        // vet[0] → 2 servicios
        {
            usuarioProveedor: vets[0]._id,
            nombreServicio: 'Control general canino',
            tipoServicio: 'Control',
            precio: 15000,
            descripcion: 'Control clínico completo para perros. Incluye revisión general, auscultación, peso y recomendaciones nutricionales.',
            direccion: { calle: 'Honduras', altura: '4800', localidad: localidades.palermo._id },
            emailClinica: vets[0].email,
            telefonoClinica: 1133445566,
            duracionMinutos: 30,
            nombreClinica: vets[0].nombreClinica,
            diasDisponibles: diasSemana,
            horariosDisponibles: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
            mascotasAceptadas: ['PERRO'],
            estado: 'Activada',
        },
        {
            usuarioProveedor: vets[0]._id,
            nombreServicio: 'Vacunación felina',
            tipoServicio: 'Vacunacion',
            precio: 12000,
            descripcion: 'Aplicación de vacunas para gatos según calendario. Triple felina, antirrábica y leucemia.',
            direccion: { calle: 'Honduras', altura: '4800', localidad: localidades.palermo._id },
            emailClinica: vets[0].email,
            telefonoClinica: 1133445566,
            duracionMinutos: 30,
            nombreClinica: vets[0].nombreClinica,
            diasDisponibles: ['LUNES', 'MIERCOLES', 'VIERNES'],
            horariosDisponibles: ['10:00', '10:30', '11:00', '16:00', '16:30'],
            mascotasAceptadas: ['GATO'],
            estado: 'Activada',
        },
        // vet[1] → 2 servicios
        {
            usuarioProveedor: vets[1]._id,
            nombreServicio: 'Ecografía abdominal',
            tipoServicio: 'Ecografia',
            precio: 25000,
            descripcion: 'Ecografía abdominal completa para diagnóstico por imágenes.',
            direccion: { calle: 'Av. Hipólito Yrigoyen', altura: '350', localidad: localidades.nuevaCordoba._id },
            emailClinica: vets[1].email,
            telefonoClinica: 3514556677,
            duracionMinutos: 60,
            nombreClinica: vets[1].nombreClinica,
            diasDisponibles: ['MARTES', 'JUEVES'],
            horariosDisponibles: ['09:00', '10:00', '11:00'],
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
        },
        {
            usuarioProveedor: vets[1]._id,
            nombreServicio: 'Cirugía menor',
            tipoServicio: 'Cirugia',
            precio: 60000,
            descripcion: 'Cirugías menores ambulatorias con anestesia local.',
            direccion: { calle: 'Av. Hipólito Yrigoyen', altura: '350', localidad: localidades.nuevaCordoba._id },
            emailClinica: vets[1].email,
            telefonoClinica: 3514556677,
            duracionMinutos: 120,
            nombreClinica: vets[1].nombreClinica,
            diasDisponibles: ['MIERCOLES', 'VIERNES'],
            horariosDisponibles: ['09:00', '14:00'],
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
        },
        // vet[2] → 1 servicio
        {
            usuarioProveedor: vets[2]._id,
            nombreServicio: 'Baño y corte higiénico',
            tipoServicio: 'Baño',
            precio: 18000,
            descripcion: 'Baño completo con corte de uñas y limpieza de oídos.',
            direccion: { calle: 'Juramento', altura: '2500', localidad: localidades.belgrano._id },
            emailClinica: vets[2].email,
            telefonoClinica: 1155112233,
            duracionMinutos: 45,
            nombreClinica: vets[2].nombreClinica,
            diasDisponibles: ['LUNES', 'JUEVES'],
            horariosDisponibles: ['10:00', '11:00', '15:00', '16:00'],
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
        },
    ];
    const servicios = await ServicioVeterinariaModel.insertMany(docs);
    logOk(`Servicios veterinarios: ${servicios.length}`);
    return servicios;
}

async function seedServiciosPaseador(paseadores, localidades) {
    const docs = [
        // paseador[0] → 2 servicios
        {
            usuarioProveedor: paseadores[0]._id,
            nombreServicio: 'Paseo grupal por parques de Belgrano',
            precio: 5000,
            descripcion: 'Paseo grupal de 1 hora. Máximo 4 perros.',
            nombreContacto: paseadores[0].nombreUsuario,
            emailContacto: paseadores[0].email,
            telefonoContacto: paseadores[0].telefono,
            duracionMinutos: 60,
            diasDisponibles: diasTodos,
            horariosDisponibles: ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
            estado: 'Activada',
            maxPerros: 4,
            direccion: { calle: 'Av. del Libertador', altura: '5500', localidad: localidades.belgrano._id },
        },
        {
            usuarioProveedor: paseadores[0]._id,
            nombreServicio: 'Paseo premium 30 minutos',
            precio: 3500,
            descripcion: 'Paseo corto ideal para perros mayores o con poca energía.',
            nombreContacto: paseadores[0].nombreUsuario,
            emailContacto: paseadores[0].email,
            telefonoContacto: paseadores[0].telefono,
            duracionMinutos: 30,
            diasDisponibles: diasSemana,
            horariosDisponibles: ['08:00', '09:00', '10:00', '17:00', '18:00'],
            estado: 'Activada',
            maxPerros: 2,
            direccion: { calle: 'Av. del Libertador', altura: '5500', localidad: localidades.belgrano._id },
        },
        // paseador[1] → 2 servicios
        {
            usuarioProveedor: paseadores[1]._id,
            nombreServicio: 'Paseo individual personalizado',
            precio: 4000,
            descripcion: 'Paseo individual de 30 minutos adaptado a tu perro.',
            nombreContacto: paseadores[1].nombreUsuario,
            emailContacto: paseadores[1].email,
            telefonoContacto: paseadores[1].telefono,
            duracionMinutos: 30,
            diasDisponibles: diasTodos,
            horariosDisponibles: ['08:00', '09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'],
            estado: 'Activada',
            maxPerros: 2,
            direccion: { calle: 'Bv. San Juan', altura: '900', localidad: localidades.alberdi._id },
        },
        {
            usuarioProveedor: paseadores[1]._id,
            nombreServicio: 'Paseo grupal Córdoba',
            precio: 4500,
            descripcion: 'Paseo grupal por el centro de Córdoba.',
            nombreContacto: paseadores[1].nombreUsuario,
            emailContacto: paseadores[1].email,
            telefonoContacto: paseadores[1].telefono,
            duracionMinutos: 60,
            diasDisponibles: ['MARTES', 'JUEVES', 'SABADO'],
            horariosDisponibles: ['09:00', '10:00', '16:00', '17:00'],
            estado: 'Activada',
            maxPerros: 3,
            direccion: { calle: 'Bv. San Juan', altura: '900', localidad: localidades.alberdi._id },
        },
        // paseador[2] → 1 servicio
        {
            usuarioProveedor: paseadores[2]._id,
            nombreServicio: 'Paseo express Palermo',
            precio: 4500,
            descripcion: 'Paseos cortos por Palermo, de lunes a viernes.',
            nombreContacto: paseadores[2].nombreUsuario,
            emailContacto: paseadores[2].email,
            telefonoContacto: paseadores[2].telefono,
            duracionMinutos: 45,
            diasDisponibles: diasSemana,
            horariosDisponibles: ['08:00', '09:00', '17:00', '18:00'],
            estado: 'Activada',
            maxPerros: 3,
            direccion: { calle: 'Gorriti', altura: '4200', localidad: localidades.palermo._id },
        },
    ];
    const servicios = await ServicioPaseadorModel.insertMany(docs);
    logOk(`Servicios de paseo: ${servicios.length}`);
    return servicios;
}

async function seedServiciosCuidador(cuidadores, localidades) {
    const docs = [
        // cuidador[0] → 2 servicios
        {
            usuarioProveedor: cuidadores[0]._id,
            nombreServicio: 'Hospedaje para perros y gatos en Palermo',
            precio: 18000,
            descripcion: 'Cuidado 24hs en casa con patio. Fotos y videos diarios.',
            nombreContacto: cuidadores[0].nombreUsuario,
            emailContacto: cuidadores[0].email,
            telefonoContacto: cuidadores[0].telefono,
            diasDisponibles: diasTodos,
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
            direccion: { calle: 'Thames', altura: '1200', localidad: localidades.palermo._id },
        },
        {
            usuarioProveedor: cuidadores[0]._id,
            nombreServicio: 'Visita a domicilio diaria',
            precio: 7000,
            descripcion: 'Visita una vez por día a tu casa, alimentación y paseo corto.',
            nombreContacto: cuidadores[0].nombreUsuario,
            emailContacto: cuidadores[0].email,
            telefonoContacto: cuidadores[0].telefono,
            diasDisponibles: diasTodos,
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
            direccion: { calle: 'Thames', altura: '1200', localidad: localidades.palermo._id },
        },
        // cuidador[1] → 1 servicio
        {
            usuarioProveedor: cuidadores[1]._id,
            nombreServicio: 'Guardería diurna para mascotas',
            precio: 10000,
            descripcion: 'Guardería de día en ambiente tranquilo y climatizado.',
            nombreContacto: cuidadores[1].nombreUsuario,
            emailContacto: cuidadores[1].email,
            telefonoContacto: cuidadores[1].telefono,
            diasDisponibles: diasSemana,
            mascotasAceptadas: ['PERRO', 'GATO', 'AVE'],
            estado: 'Activada',
            direccion: { calle: 'Av. Colón', altura: '600', localidad: localidades.nuevaCordoba._id },
        },
        // cuidador[2] → 1 servicio
        {
            usuarioProveedor: cuidadores[2]._id,
            nombreServicio: 'Estadía weekend en Belgrano',
            precio: 14000,
            descripcion: 'Cuidado durante el fin de semana en casa con jardín.',
            nombreContacto: cuidadores[2].nombreUsuario,
            emailContacto: cuidadores[2].email,
            telefonoContacto: cuidadores[2].telefono,
            diasDisponibles: ['VIERNES', 'SABADO', 'DOMINGO'],
            mascotasAceptadas: ['PERRO', 'GATO'],
            estado: 'Activada',
            direccion: { calle: 'Echeverría', altura: '2100', localidad: localidades.belgrano._id },
        },
    ];
    const servicios = await ServicioCuidadorModel.insertMany(docs);
    logOk(`Servicios de cuidado: ${servicios.length}`);
    return servicios;
}

// ─── Reservas ─────────────────────────────────────────────────

function buildReserva({ cliente, mascotaIdx, servicio, tipo, estado, fechaInicio, fechaFin, horario, cantidadDias, notaAdicional }) {
    const mascota = cliente.mascotas[mascotaIdx];
    return {
        cliente: cliente._id,
        mascota: mascota._id,
        servicioReservado: servicio._id,
        serviciOfrecido: tipo,
        rangoFechas: { fechaInicio, fechaFin },
        estado,
        precioTotal: servicio.precio * cantidadDias,
        horario: horario ?? null,
        cantidadDias,
        notaAdicional: notaAdicional ?? '',
        nombreDeContacto: cliente.nombreUsuario,
        telefonoContacto: cliente.telefono,
        emailContacto: cliente.email,
    };
}

async function seedReservas(clientes, serviciosVet, serviciosPas, serviciosCui) {
    const reservas = [];

    // ── COMPLETADAS (para generar reseñas) ─────────
    reservas.push(buildReserva({
        cliente: clientes[0], mascotaIdx: 0,
        servicio: serviciosVet[0], tipo: 'ServicioVeterinaria',
        estado: 'COMPLETADA',
        fechaInicio: fecha2027(1, 12), fechaFin: fecha2027(1, 12),
        horario: '10:00', cantidadDias: 1,
        notaAdicional: 'Control de rutina',
    }));
    reservas.push(buildReserva({
        cliente: clientes[1], mascotaIdx: 0,
        servicio: serviciosVet[2], tipo: 'ServicioVeterinaria',
        estado: 'COMPLETADA',
        fechaInicio: fecha2027(1, 26), fechaFin: fecha2027(1, 26),
        horario: '09:00', cantidadDias: 1,
    }));
    reservas.push(buildReserva({
        cliente: clientes[2], mascotaIdx: 0,
        servicio: serviciosPas[0], tipo: 'ServicioPaseador',
        estado: 'COMPLETADA',
        fechaInicio: fecha2027(2, 3), fechaFin: fecha2027(2, 3),
        horario: '08:00', cantidadDias: 1,
    }));
    reservas.push(buildReserva({
        cliente: clientes[0], mascotaIdx: 0,
        servicio: serviciosPas[2], tipo: 'ServicioPaseador',
        estado: 'COMPLETADA',
        fechaInicio: fecha2027(2, 10), fechaFin: fecha2027(2, 10),
        horario: '09:00', cantidadDias: 1,
    }));
    reservas.push(buildReserva({
        cliente: clientes[1], mascotaIdx: 0,
        servicio: serviciosCui[0], tipo: 'ServicioCuidador',
        estado: 'COMPLETADA',
        fechaInicio: fecha2027(2, 15), fechaFin: fecha2027(2, 17),
        horario: null, cantidadDias: 3,
        notaAdicional: 'Se fue de viaje el fin de semana',
    }));
    reservas.push(buildReserva({
        cliente: clientes[2], mascotaIdx: 1,
        servicio: serviciosCui[2], tipo: 'ServicioCuidador',
        estado: 'COMPLETADA',
        fechaInicio: fecha2027(3, 5), fechaFin: fecha2027(3, 6),
        horario: null, cantidadDias: 2,
    }));

    // ── CONFIRMADAS ───────────────────────────────
    reservas.push(buildReserva({
        cliente: clientes[0], mascotaIdx: 1,
        servicio: serviciosVet[1], tipo: 'ServicioVeterinaria',
        estado: 'CONFIRMADA',
        fechaInicio: fecha2027(6, 10), fechaFin: fecha2027(6, 10),
        horario: '10:00', cantidadDias: 1,
    }));
    reservas.push(buildReserva({
        cliente: clientes[1], mascotaIdx: 0,
        servicio: serviciosPas[0], tipo: 'ServicioPaseador',
        estado: 'CONFIRMADA',
        fechaInicio: fecha2027(6, 15), fechaFin: fecha2027(6, 15),
        horario: '09:00', cantidadDias: 1,
    }));
    reservas.push(buildReserva({
        cliente: clientes[2], mascotaIdx: 0,
        servicio: serviciosCui[1], tipo: 'ServicioCuidador',
        estado: 'CONFIRMADA',
        fechaInicio: fecha2027(7, 5), fechaFin: fecha2027(7, 7),
        horario: null, cantidadDias: 3,
    }));

    // ── PENDIENTES ─────────────────────────────────
    reservas.push(buildReserva({
        cliente: clientes[0], mascotaIdx: 0,
        servicio: serviciosVet[4], tipo: 'ServicioVeterinaria',
        estado: 'PENDIENTE',
        fechaInicio: fecha2027(8, 12), fechaFin: fecha2027(8, 12),
        horario: '15:00', cantidadDias: 1,
    }));
    reservas.push(buildReserva({
        cliente: clientes[1], mascotaIdx: 0,
        servicio: serviciosPas[4], tipo: 'ServicioPaseador',
        estado: 'PENDIENTE',
        fechaInicio: fecha2027(8, 20), fechaFin: fecha2027(8, 20),
        horario: '17:00', cantidadDias: 1,
    }));

    // ── CANCELADAS ─────────────────────────────────
    reservas.push(buildReserva({
        cliente: clientes[2], mascotaIdx: 0,
        servicio: serviciosVet[3], tipo: 'ServicioVeterinaria',
        estado: 'CANCELADA',
        fechaInicio: fecha2027(4, 18), fechaFin: fecha2027(4, 18),
        horario: '09:00', cantidadDias: 1,
    }));

    const creadas = [];
    for (const r of reservas) {
        creadas.push(await ReservaModel.create(r));
    }
    logOk(`Reservas: ${creadas.length} (COMPLETADA, CONFIRMADA, PENDIENTE, CANCELADA)`);
    return creadas;
}

// ─── Bloqueo de horarios según reservas activas ──────────────

// Solo se bloquean slots de reservas que "ocupan" el servicio.
// CANCELADA y PENDIENTE_PAGO no bloquean.
const ESTADOS_QUE_BLOQUEAN = new Set(['PENDIENTE', 'CONFIRMADA', 'COMPLETADA']);

async function bloquearHorarios(reservas) {
    let bloqueados = 0;

    for (const r of reservas) {
        if (!ESTADOS_QUE_BLOQUEAN.has(r.estado)) continue;
        const fecha = r.rangoFechas.fechaInicio;
        const fechaSoloDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

        if (r.serviciOfrecido === 'ServicioVeterinaria') {
            // Schema: [{ fecha, horariosNoDisponibles: [string] }]
            const servicio = await ServicioVeterinariaModel.findById(r.servicioReservado);
            if (!servicio) continue;
            const idx = servicio.fechasNoDisponibles.findIndex(
                (f) => f.fecha.getTime() === fechaSoloDia.getTime()
            );
            if (idx >= 0) {
                if (!servicio.fechasNoDisponibles[idx].horariosNoDisponibles.includes(r.horario)) {
                    servicio.fechasNoDisponibles[idx].horariosNoDisponibles.push(r.horario);
                }
            } else {
                servicio.fechasNoDisponibles.push({
                    fecha: fechaSoloDia,
                    horariosNoDisponibles: [r.horario],
                });
            }
            servicio.cantidadReservas = (servicio.cantidadReservas || 0) + 1;
            await servicio.save();
            bloqueados++;
        } else if (r.serviciOfrecido === 'ServicioPaseador') {
            // Schema: [{ fecha, horariosNoDisponibles: [{ horario, perrosReservados }] }]
            const servicio = await ServicioPaseadorModel.findById(r.servicioReservado);
            if (!servicio) continue;
            const idx = servicio.fechasNoDisponibles.findIndex(
                (f) => f.fecha.getTime() === fechaSoloDia.getTime()
            );
            if (idx >= 0) {
                const hIdx = servicio.fechasNoDisponibles[idx].horariosNoDisponibles.findIndex(
                    (h) => h.horario === r.horario
                );
                if (hIdx >= 0) {
                    servicio.fechasNoDisponibles[idx].horariosNoDisponibles[hIdx].perrosReservados += 1;
                } else {
                    servicio.fechasNoDisponibles[idx].horariosNoDisponibles.push({
                        horario: r.horario,
                        perrosReservados: 1,
                    });
                }
            } else {
                servicio.fechasNoDisponibles.push({
                    fecha: fechaSoloDia,
                    horariosNoDisponibles: [{ horario: r.horario, perrosReservados: 1 }],
                });
            }
            servicio.cantidadReservas = (servicio.cantidadReservas || 0) + 1;
            await servicio.save();
            bloqueados++;
        } else if (r.serviciOfrecido === 'ServicioCuidador') {
            // Schema: [{ fechaInicio, fechaFin }]
            const servicio = await ServicioCuidadorModel.findById(r.servicioReservado);
            if (!servicio) continue;
            servicio.fechasNoDisponibles.push({
                fechaInicio: r.rangoFechas.fechaInicio,
                fechaFin: r.rangoFechas.fechaFin,
            });
            servicio.cantidadReservas = (servicio.cantidadReservas || 0) + 1;
            await servicio.save();
            bloqueados++;
        }
    }

    logOk(`Horarios/fechas bloqueadas en servicios: ${bloqueados}`);
}

// ─── Reseñas + recálculo de calificaciones ───────────────────

const comentariosPool = [
    'Excelente atención, muy profesional.',
    'Mi mascota volvió feliz, súper recomendado.',
    'Trato cálido y puntualidad total.',
    'Todo impecable, repetiría sin dudarlo.',
    'Muy buena experiencia, gracias.',
];

async function seedResenas(reservas) {
    const completadas = reservas.filter((r) => r.estado === 'COMPLETADA');
    // Solo reseñamos las primeras ceil(n/2); las restantes quedan sin reseña
    // para poder probar el flujo de calificación desde la UI.
    const limite = Math.ceil(completadas.length / 2);
    const creadas = [];
    for (let i = 0; i < limite; i++) {
        const r = completadas[i];
        const puntuacion = 3 + ((i + 1) % 3); // 3, 4, 5 alternados
        const resena = await ResenaModel.create({
            cliente: r.cliente,
            servicio: r.servicioReservado,
            serviciOfrecido: r.serviciOfrecido,
            reserva: r._id,
            puntuacion,
            comentario: comentariosPool[i % comentariosPool.length],
            fecha: r.rangoFechas.fechaFin,
        });
        creadas.push(resena);
    }
    logOk(`Reseñas: ${creadas.length} (${completadas.length - creadas.length} COMPLETADAS quedan sin reseña para testing)`);
    return creadas;
}

async function recalcularCalificaciones() {
    const modelosPorTipo = {
        ServicioVeterinaria: ServicioVeterinariaModel,
        ServicioPaseador: ServicioPaseadorModel,
        ServicioCuidador: ServicioCuidadorModel,
    };

    const agregados = await ResenaModel.aggregate([
        {
            $group: {
                _id: { servicio: '$servicio', tipo: '$serviciOfrecido' },
                promedio: { $avg: '$puntuacion' },
                cantidad: { $sum: 1 },
            },
        },
    ]);

    for (const grupo of agregados) {
        const Model = modelosPorTipo[grupo._id.tipo];
        if (!Model) continue;
        await Model.findByIdAndUpdate(grupo._id.servicio, {
            calificacionPromedio: Math.round(grupo.promedio * 10) / 10,
            cantidadResenas: grupo.cantidad,
        });
    }
    logOk(`Calificaciones recalculadas en ${agregados.length} servicios`);
}

// ─── Notificaciones de muestra ────────────────────────────────

async function seedNotificaciones(vets, paseadores, cuidadores) {
    const ahora = new Date();
    const mensajesVet = ['Nueva reserva para Control general', 'Recordatorio: turno mañana 10:00'];
    const mensajesPas = ['Nueva reserva de paseo'];
    const mensajesCui = ['Nueva reserva de hospedaje'];

    const push = async (Model, doc, mensajes) => {
        doc.notificaciones = mensajes.map((m) => ({
            mensaje: m,
            fechaAlta: ahora,
            fechaLeida: null,
        }));
        await doc.save();
    };

    await push(VeterinariaModel, vets[0], mensajesVet);
    await push(VeterinariaModel, vets[1], [mensajesVet[0]]);
    await push(PaseadorModel, paseadores[0], mensajesPas);
    await push(PaseadorModel, paseadores[1], mensajesPas);
    await push(CuidadorModel, cuidadores[0], mensajesCui);
    logOk(`Notificaciones de muestra cargadas`);
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
    try {
        await connectDB();
        await clearDatabase();

        log('Cargando datos de ejemplo...\n');

        const hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

        const localidades = await seedCiudadesYLocalidades();

        const clientes = await seedClientes(localidades, hash);
        const vets = await seedVeterinarias(localidades, hash);
        const paseadores = await seedPaseadores(localidades, hash);
        const cuidadores = await seedCuidadores(localidades, hash);

        const serviciosVet = await seedServiciosVeterinaria(vets, localidades);
        const serviciosPas = await seedServiciosPaseador(paseadores, localidades);
        const serviciosCui = await seedServiciosCuidador(cuidadores, localidades);

        const reservas = await seedReservas(clientes, serviciosVet, serviciosPas, serviciosCui);
        await bloquearHorarios(reservas);
        await seedResenas(reservas);
        await recalcularCalificaciones();
        await seedNotificaciones(vets, paseadores, cuidadores);

        await seedAdmin(hash);

        console.log('\n' + '═'.repeat(60));
        logOk('¡Seed completado exitosamente!');
        console.log('═'.repeat(60));
        console.log(`
  📋 Password común: ${SEED_PASSWORD}

  👤 Clientes:
     • maria@example.com   (Maria García  — Palermo)
     • juan@example.com    (Juan Pérez    — Belgrano)
     • laura@example.com   (Laura Gómez   — Nueva Córdoba)

  🏥 Veterinarias VERIFICADAS (pueden crear servicios):
     • clinica.palermo@example.com   (Clínica Veterinaria Palermo)
     • vetcenter.cba@example.com     (VetCenter Córdoba)
     • belgrano.pet@example.com      (Belgrano Pet Hospital)

  🟡 Veterinarias para testear flujo de verificación:
     • clinica.almagro@example.com   (PENDIENTE — esperando aprobación)
     • vetsur.lomas@example.com      (RECHAZADA — debe reenviar docs)
     • recoleta.vet@example.com      (NO_INICIADA — recién registrada)

  🐕 Paseadores:
     • lucas.paseos@example.com   (Lucas Fernández  — Belgrano)
     • sofia.paseos@example.com   (Sofía Martínez   — Alberdi)
     • tomas.paseos@example.com   (Tomás Herrera    — Palermo)

  🏠 Cuidadores:
     • valentina.cuida@example.com   (Valentina Romero — Palermo)
     • diego.cuida@example.com       (Diego Sánchez    — Nueva Córdoba)
     • paula.cuida@example.com       (Paula Ibáñez     — Belgrano)

  🔑 Admin:
     • admin@petconnect.com
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

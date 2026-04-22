/**
 * Script de migración: inicializa calificacionPromedio y cantidadResenas en
 * los servicios existentes y los reconcilia con las reseñas ya cargadas.
 *
 * USO: cd server && node scripts/migrarCalificacionPromedio.js
 *
 * Idempotente: recalcula desde la colección de reseñas en cada corrida.
 * Si no hay reseñas para un servicio, deja promedio=0 y cantidad=0.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { ServicioVeterinariaModel } from '../vet/models/schemas/servicioVeterinariaSchema.js';
import { ServicioPaseadorModel } from '../vet/models/schemas/servicioPaseadorSchema.js';
import { ServicioCuidadorModel } from '../vet/models/schemas/servicioCuidadorSchema.js';
import { ResenaModel } from '../vet/models/schemas/resenaSchema.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vet';

async function recalcularPara(model, nombre) {
    console.log(`--- ${nombre} ---`);
    const servicios = await model.find({}, { _id: 1 }).lean();
    let actualizados = 0;

    for (const svc of servicios) {
        const [agg] = await ResenaModel.aggregate([
            { $match: { servicio: svc._id } },
            {
                $group: {
                    _id: '$servicio',
                    promedio: { $avg: '$puntuacion' },
                    cantidad: { $sum: 1 },
                },
            },
        ]);

        const promedio = agg ? Math.round(agg.promedio * 10) / 10 : 0;
        const cantidad = agg ? agg.cantidad : 0;

        await model.updateOne(
            { _id: svc._id },
            { $set: { calificacionPromedio: promedio, cantidadResenas: cantidad } }
        );
        actualizados++;
    }

    console.log(`  ${actualizados} servicios reconciliados.\n`);
}

async function migrar() {
    console.log(`Conectando a ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB.\n');

    await recalcularPara(ServicioVeterinariaModel, 'ServicioVeterinaria');
    await recalcularPara(ServicioPaseadorModel, 'ServicioPaseador');
    await recalcularPara(ServicioCuidadorModel, 'ServicioCuidador');

    console.log('Migración completada.');
    await mongoose.disconnect();
    process.exit(0);
}

migrar().catch(err => {
    console.error('Error en migración:', err);
    process.exit(1);
});

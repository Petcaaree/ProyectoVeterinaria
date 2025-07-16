import path from "path"
import { ReservaModel } from "../schemas/reservaSchema.js"

export class VeterinariaRepository {
    constructor() {
        this.model = ReservaModel
    }

    async save(reserva) {
        const { id, ...datos } = reserva;

        let reservaGuardada;

        if (id) {
            // Actualiza si existe
            reservaGuardada = await this.model.findByIdAndUpdate(
            id,
            datos,
            { new: true, runValidators: true }
            );
        } else {
            // Crea nueva si no existe
            const nuevaReserva = new this.model(reserva);
            reservaGuardada = await nuevaReserva.save();
        }

        // Primero: populate cliente, mascota y servicioReservado (con refPath)
        reservaGuardada = await this.model.populate(reservaGuardada, [
            { path: 'mascota' },
            { path: 'cliente' },
            { path: 'servicioReservado' }
        ]);

        // Segundo: populate anidado sobre servicioReservado
        if (reservaGuardada.servicioReservado) {
            reservaGuardada.servicioReservado = await reservaGuardada.servicioReservado.populate([
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            }
            ]);
        }

        return reservaGuardada;
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }

    async findById(id) {
        let reserva = await this.model.findById(id)
            .populate('mascota')
            .populate('cliente')
            .populate('servicioReservado'); // refPath lo resuelve automáticamente

        if (!reserva) return null;

        // Segundo nivel de populate sobre servicioReservado
        if (reserva.servicioReservado) {
            reserva.servicioReservado = await reserva.servicioReservado.populate([
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            }
            ]);
        }

        return reserva;
    }

    async findByUsuarioProveedor(serviciosReservadosIds) {
        if (!Array.isArray(serviciosReservadosIds) || serviciosReservadosIds.length === 0) {
            return [];
        }

        const reservas = await this.model.find({
            servicioReservado: { $in: serviciosReservadosIds }
        })
        .populate('mascota')
        .populate('cliente')
        .populate({
            path: 'servicioReservado',
            populate: [
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            }
            ]
        });

        return reservas;
    }

    async findByUsuarioProveedorByPage(pageNum, limitNum, serviciosReservadosIds) {

        const skip = (pageNum - 1) * limitNum;

        if (!Array.isArray(serviciosReservadosIds) || serviciosReservadosIds.length === 0) {
            return [];
        }
        
        const reservas = await this.model.find({
            servicioReservado: { $in: serviciosReservadosIds }
        })
        .skip(skip)
        .limit(limitNum)
        .populate('mascota')
        .populate('cliente')
        .populate({
            path: 'servicioReservado',
            populate: [
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
            }
            ]
        });

        return reservas;
    }


    // ESTE LO HICE POR LAS DUDAS
    async findByServicioReservado(servicioReservado) {
    const reservas = await this.model.find({ servicioReservado })
        .populate('mascota')
        .populate('cliente')
        .populate({
            path: 'servicioReservado',
            populate: [
                { path: 'usuarioProveedor' },
                {
                    path: 'direccion.ciudad',
                    populate: { path: 'localidad' }
                }
            ]
        });

    return reservas;
}

    async findByCliente(pageNum, limitNum, cliente) {
        const skip = (pageNum - 1) * limitNum;

        let reservas = await this.model.find({ cliente })
            .skip(skip)
            .limit(limitNum)
            .populate('mascota')
            .populate('cliente')
            .populate({
                path: 'servicioReservado',
                populate: [
                    { path: 'usuarioProveedor' },
                    {
                        path: 'direccion.ciudad',
                        populate: { path: 'localidad' }
                    }
                ]
            });

        return reservas;
        }

    asyn 

    async findAll() {
        return await this.model.find()
            .populate('mascota')
            .populate('cliente')
            .populate({
            path: 'servicioReservado',
            populate: [
                { path: 'usuarioProveedor' },
                {
                path: 'direccion.ciudad',
                populate: { path: 'localidad' }
                }
            ]
            });
    }


    

    
    async countAll() {
        return await this.model.countDocuments()
    }
}
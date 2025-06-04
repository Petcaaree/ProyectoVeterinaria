import { ReservaModel } from "../schemas/reservaSchema.js"

export class VeterinariaRepository {
    constructor() {
        this.model = ReservaModel
    }

    async save(reserva) {
        if(reserva.id) {
            const { id, ...datosActualizados } = reserva
            let reservaExistente = await this.model.findByIdAndUpdate(
                reserva.id,
                datosActualizados,
                { new: true, runValidators: true }
            )

            reservaExistente = await this.model.populate(reservaExistente, [
                { path: 'mascota' },
                {
                    path: 'cliente',
                    populate: { path: 'mascotas' }
                },
                { path: 'usuarioProveedor' }
            ])

            // Populate adicional solo si tiene servicios
            if (reservaExistente.usuarioProveedor?.serviciosDisponibles?.length) {
                await reservaExistente.populate({
                    path: 'usuarioProveedor.serviciosDisponibles'
                })
            }

            return reservaExistente

            } else {
            const newReserva = new this.model(reserva)
            let reservaGuardada = await newReserva.save()

            reservaGuardada = await this.model.populate(reservaGuardada, [
            { path: 'mascota' },
            {
                path: 'cliente',
                populate: { path: 'mascotas' }
            },
            { path: 'usuarioProveedor' }
            ])

            // Populate condicional para serviciosDisponibles dentro de usuarioProveedor
            if (reservaGuardada.usuarioProveedor?.serviciosDisponibles?.length) {
            await reservaGuardada.populate({
                path: 'usuarioProveedor.serviciosDisponibles'
            })
            }

            return reservaGuardada
        }
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }

    async findById(id) {
        let reserva = await this.model.findById(id)
            .populate('mascota')
            .populate({
            path: 'cliente',
            populate: { path: 'mascotas' }
            })
            .populate('usuarioProveedor');

        if (!reserva) return null;

        if (reserva.usuarioProveedor?.__t === 'Veterinaria') {
            await reserva.populate({
            path: 'usuarioProveedor.serviciosDisponibles'
            });
        }

        return reserva;
    }

    async findByUsuarioProveedor(usuarioProveedor) {
        const reservas = await this.model.find({ usuarioProveedor }) // Mongoose castea automáticamente el ID
            .populate('mascota')
            .populate({
            path: 'cliente',
            populate: { path: 'mascotas' }
            })
            .populate('usuarioProveedor');

        if (usuarioProveedor.__t === 'Veterinaria') {
            await Promise.all(
            reservas.map(reserva =>
                reserva.populate({ path: 'usuarioProveedor.serviciosDisponibles' })
            )
            );
        }

        return reservas;
    }

    async findByCliente(pageNum, limitNum, cliente) {
        const skip = (pageNum - 1) * limitNum;

        const reservas = await this.model.find({ cliente })
            .skip(skip)
            .limit(limitNum)
            .populate('mascota')
            .populate({
            path: 'cliente',
            populate: { path: 'mascotas' }
            })
            .populate('usuarioProveedor');

        const reservasConVet = reservas.filter(r =>
            r.usuarioProveedor?.__t === 'Veterinaria'
        );

        const vetIds = reservasConVet.map(r => r.usuarioProveedor._id);

        const veterinariasConServicios = await this.model.db.model('Veterinaria')
            .find({ _id: { $in: vetIds } })
            .populate('serviciosDisponibles');

        const serviciosPorVetId = {};
        veterinariasConServicios.forEach(vet => {
            serviciosPorVetId[vet._id.toString()] = vet.serviciosDisponibles;
        });

        reservas.forEach(reserva => {
            if (reserva.usuarioProveedor?.__t === 'Veterinaria') {
            const idStr = reserva.usuarioProveedor._id.toString();
            reserva.usuarioProveedor.serviciosDisponibles = serviciosPorVetId[idStr] || [];
            }
        });

        return reservas;
    }

    async findAll() {
        const reservas = await this.model.find()
            .populate('mascota')
            .populate({
            path: 'cliente',
            populate: { path: 'mascotas' }
            })
            .populate('usuarioProveedor');

        const reservasConVet = reservas.filter(r => r.usuarioProveedor?.__t === 'Veterinaria');

        const vetIds = reservasConVet.map(r => r.usuarioProveedor._id);

        const veterinariasConServicios = await this.model.db.model('Veterinaria')
            .find({ _id: { $in: vetIds } })
            .populate('serviciosDisponibles');

        const serviciosPorVetId = {};
        veterinariasConServicios.forEach(vet => {
            serviciosPorVetId[vet._id.toString()] = vet.serviciosDisponibles;
        });

        reservas.forEach(reserva => {
            if (reserva.usuarioProveedor?.__t === 'Veterinaria') {
            const idStr = reserva.usuarioProveedor._id.toString();
            reserva.usuarioProveedor.serviciosDisponibles = serviciosPorVetId[idStr] || [];
            }
        });

        return reservas;
    }


    async findByPage(pageNum, limitNum) {
        const skip = (pageNum - 1) * limitNum;

        // 1. Populates básicos
        const reservas = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .populate('mascota')
            .populate({
            path: 'cliente',
            populate: { path: 'mascotas' }
            })
            .populate({
            path: 'usuarioProveedor',
            // Suponiendo que apuntás a un modelo base con discriminators
            model: 'UsuarioProveedor'
            })
            .exec();

        // 2. Filtrar reservas donde el proveedor es una Veterinaria
        const reservasConVet = reservas.filter(r =>
            r.usuarioProveedor && r.usuarioProveedor.__t === 'Veterinaria'
        );

        // 3. Obtener IDs de esas veterinarias
        const vetIds = reservasConVet.map(r => r.usuarioProveedor._id);

        // 4. Buscar veterinarias con serviciosDisponibles poblados
        const veterinariasConServicios = await this.model.db.model('Veterinaria')
            .find({ _id: { $in: vetIds } })
            .populate('serviciosDisponibles')
            .exec();

        // 5. Mapear por ID
        const serviciosPorVetId = {};
        veterinariasConServicios.forEach(vet => {
            serviciosPorVetId[vet._id.toString()] = vet.serviciosDisponibles;
        });

        // 6. Asignar serviciosDisponibles manualmente a reservas con veterinaria
        reservas.forEach(reserva => {
            if (reserva.usuarioProveedor?.__t === 'Veterinaria') {
            const idStr = reserva.usuarioProveedor._id.toString();
            reserva.usuarioProveedor.serviciosDisponibles = serviciosPorVetId[idStr] || [];
            }
        });

        // 7. Devolver todas las reservas
        return reservas;
    }

    async countAll() {
        return await this.model.countDocuments()
    }
}
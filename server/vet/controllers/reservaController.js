export class ReservaController {
    constructor(reservaService, pagoService) {
        this.reservaService = reservaService
        this.pagoService = pagoService
    }

    async create(req, res, next){
        try {
            // Flujo nuevo: 1) crear ReservaPendiente (bloquea cupo), 2) generar preferencia MP.
            // La Reserva definitiva se crea recién cuando llega el webhook de pago aprobado.
            const pendienteDTO = await this.reservaService.crearPendiente(req.body)

            let pagoInfo;
            try {
                pagoInfo = await this.pagoService.crearPreferenciaParaPendiente(pendienteDTO);
            } catch (mpError) {
                // Si MP falla, liberamos el cupo bloqueado — no podemos dejar un pendiente
                // sin link de pago porque el cliente no tendría cómo avanzar.
                await this.reservaService.revertirPendiente(pendienteDTO._id || pendienteDTO.id);
                return next(mpError);
            }

            res.status(201).json({
                pendienteId: pendienteDTO._id || pendienteDTO.id,
                preferenceId: pagoInfo.preferenceId,
                init_point: pagoInfo.init_point,
                sandbox_init_point: pagoInfo.sandbox_init_point,
                precioTotal: pendienteDTO.precioTotal,
                expiresAt: pendienteDTO.expiresAt,
            })
        } catch(error) {
            next(error)
        }
    }

    async findAll(req, res, next) {
        try {
            const { page, limit } = req.query
            const reservas = await this.reservaService.findAll({ page, limit })
            res.json(reservas)
        } catch(error) {
            next(error)
        }
    }

    async findByCliente(req, res, next) {
        try {
            const { page, limit } = req.query
            const id = req.params.id
            const estado = req.params.estado

            const reservas = await this.reservaService.findByCliente({page, limit}, id, estado)

            res.json(reservas)
        } catch(error) {
            next(error)
        }
    }


    async findByProveedor(req, res, next) {
        try {
            const id = req.params.id
            const estado = req.params.estado
            const { page, limit } = req.query
            const reservas = await this.reservaService.findByProveedorServicio(id, estado, {page, limit})

            res.json(reservas)
        } catch(error) {
            next(error)
        }
    }

    async updateEstadoReserva(req, res, next) {
        try {
            const { idUsuario, idReserva, estado } = req.params
            const resultado = await this.reservaService.modificarEstado(idUsuario, idReserva, estado, null)

            res.json(resultado);
        } catch(error) {
            next(error)
        }
    }
}

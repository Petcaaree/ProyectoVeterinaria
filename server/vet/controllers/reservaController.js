export class ReservaController {
    constructor(reservaService, pagoService) {
        this.reservaService = reservaService
        this.pagoService = pagoService
    }

    async create(req, res, next){
        try {
            const reserva = req.body
            const reservaDTO = await this.reservaService.create(reserva)

            // Crear preferencia de pago en MercadoPago
            let pagoInfo = null;
            try {
                pagoInfo = await this.pagoService.crearPreferencia(reservaDTO);
            } catch (mpError) {
                // Si MP falla, la reserva quedó creada en PENDIENTE_PAGO.
                // Devolvemos igualmente la reserva para que el cliente pueda reintentar.
                console.error("Error al crear preferencia de MercadoPago:", mpError.message);
            }

            res.status(201).json({
                ...reservaDTO,
                init_point: pagoInfo?.init_point || null,
                sandbox_init_point: pagoInfo?.sandbox_init_point || null,
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


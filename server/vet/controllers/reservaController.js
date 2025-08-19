export class ReservaController {
    constructor(reservaService) {
        this.reservaService = reservaService
    }

    async create(req, res, next){
        try {
            const reserva = req.body    
            const nuevo = await this.reservaService.create(reserva)
    
            res.status(201).json(nuevo)
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
}


import { ValidationError, NotFoundError } from "../errors/AppError.js";
import { sanitizePagination } from "../utils/paginationUtils.js";

export class AdminDashboardService {
    constructor(
        clienteRepo, veterinariaRepo, paseadorRepo, cuidadorRepo,
        reservaRepo, pagoRepo,
        servicioVeterinariaRepo, servicioPaseadorRepo, servicioCuidadorRepo,
        configuracionRepo
    ) {
        this.clienteRepo = clienteRepo;
        this.veterinariaRepo = veterinariaRepo;
        this.paseadorRepo = paseadorRepo;
        this.cuidadorRepo = cuidadorRepo;
        this.reservaRepo = reservaRepo;
        this.pagoRepo = pagoRepo;
        this.servicioVeterinariaRepo = servicioVeterinariaRepo;
        this.servicioPaseadorRepo = servicioPaseadorRepo;
        this.servicioCuidadorRepo = servicioCuidadorRepo;
        this.configuracionRepo = configuracionRepo;

        this.reposPorTipoUsuario = {
            cliente: this.clienteRepo,
            veterinaria: this.veterinariaRepo,
            paseador: this.paseadorRepo,
            cuidador: this.cuidadorRepo,
        };

        this.reposPorTipoServicio = {
            veterinaria: this.servicioVeterinariaRepo,
            paseador: this.servicioPaseadorRepo,
            cuidador: this.servicioCuidadorRepo,
        };
    }

    // ─── METRICAS ───────────────────────────────────────

    async getMetricas() {
        const [
            clientes, veterinarias, paseadores, cuidadores,
            reservasPorEstado,
            resumenPagos,
            vetActivos, vetInactivos,
            pasActivos, pasInactivos,
            cuiActivos, cuiInactivos,
        ] = await Promise.all([
            this.clienteRepo.countAll(),
            this.veterinariaRepo.countAll(),
            this.paseadorRepo.countAll(),
            this.cuidadorRepo.countAll(),
            this.reservaRepo.countByEstados(),
            this.pagoRepo.getResumenPagos(),
            this.servicioVeterinariaRepo.countByEstado('Activada'),
            this.servicioVeterinariaRepo.countByEstado('Desactivada'),
            this.servicioPaseadorRepo.countByEstado('Activada'),
            this.servicioPaseadorRepo.countByEstado('Desactivada'),
            this.servicioCuidadorRepo.countByEstado('Activada'),
            this.servicioCuidadorRepo.countByEstado('Desactivada'),
        ]);

        return {
            usuarios: {
                clientes,
                veterinarias,
                paseadores,
                cuidadores,
                total: clientes + veterinarias + paseadores + cuidadores,
            },
            reservas: {
                PENDIENTE_PAGO: reservasPorEstado.PENDIENTE_PAGO || 0,
                PENDIENTE: reservasPorEstado.PENDIENTE || 0,
                CONFIRMADA: reservasPorEstado.CONFIRMADA || 0,
                CANCELADA: reservasPorEstado.CANCELADA || 0,
                COMPLETADA: reservasPorEstado.COMPLETADA || 0,
                total: Object.values(reservasPorEstado).reduce((a, b) => a + b, 0),
            },
            ingresos: {
                aprobado: resumenPagos.APROBADO || { total: 0, count: 0 },
                pendiente: resumenPagos.PENDIENTE || { total: 0, count: 0 },
                rechazado: resumenPagos.RECHAZADO || { total: 0, count: 0 },
                totalRecaudado: resumenPagos.APROBADO?.total || 0,
            },
            servicios: {
                veterinaria: { activos: vetActivos, inactivos: vetInactivos },
                paseador: { activos: pasActivos, inactivos: pasInactivos },
                cuidador: { activos: cuiActivos, inactivos: cuiInactivos },
                totalActivos: vetActivos + pasActivos + cuiActivos,
            },
        };
    }

    // ─── GESTION DE USUARIOS ────────────────────────────

    async getUsuarios(tipo, { page = 1, limit = 10, search }) {
        const repo = this.reposPorTipoUsuario[tipo];
        if (!repo) throw new ValidationError(`Tipo de usuario inválido: ${tipo}`);

        const { pageNum, limitNum } = sanitizePagination({ page, limit });

        if (search) {
            const regex = new RegExp(search, 'i');
            const usuarios = await repo.model.find({
                $or: [
                    { nombreUsuario: regex },
                    { email: regex },
                ]
            })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);
            const total = await repo.model.countDocuments({
                $or: [{ nombreUsuario: regex }, { email: regex }]
            });
            return {
                page: pageNum,
                per_page: limitNum,
                total,
                total_pages: Math.ceil(total / limitNum),
                data: usuarios,
            };
        }

        const usuarios = await repo.findByPage(pageNum, limitNum);
        const total = await repo.countAll();

        return {
            page: pageNum,
            per_page: limitNum,
            total,
            total_pages: Math.ceil(total / limitNum),
            data: usuarios,
        };
    }

    async suspenderUsuario(tipo, id, motivo) {
        const repo = this.reposPorTipoUsuario[tipo];
        if (!repo) throw new ValidationError(`Tipo de usuario inválido: ${tipo}`);

        const usuario = await repo.findById(id);
        if (!usuario) throw new NotFoundError("Usuario no encontrado");

        usuario.suspendido = true;
        usuario.motivoSuspension = motivo || 'Suspendido por administrador';
        await usuario.save();
    }

    async reactivarUsuario(tipo, id) {
        const repo = this.reposPorTipoUsuario[tipo];
        if (!repo) throw new ValidationError(`Tipo de usuario inválido: ${tipo}`);

        const usuario = await repo.findById(id);
        if (!usuario) throw new NotFoundError("Usuario no encontrado");

        usuario.suspendido = false;
        usuario.motivoSuspension = null;
        await usuario.save();
    }

    async eliminarUsuario(tipo, id) {
        const repo = this.reposPorTipoUsuario[tipo];
        if (!repo) throw new ValidationError(`Tipo de usuario inválido: ${tipo}`);

        const eliminado = await repo.deleteById(id);
        if (!eliminado) throw new NotFoundError("Usuario no encontrado");
    }

    // ─── GESTION DE SERVICIOS ───────────────────────────

    async getServicios(tipo, { page = 1, limit = 10, estado }) {
        const repo = this.reposPorTipoServicio[tipo];
        if (!repo) throw new ValidationError(`Tipo de servicio inválido: ${tipo}`);

        const { pageNum, limitNum } = sanitizePagination({ page, limit });
        const { servicios, total } = await repo.findByPageAdmin(pageNum, limitNum, estado);

        return {
            page: pageNum,
            per_page: limitNum,
            total,
            total_pages: Math.ceil(total / limitNum),
            data: servicios,
        };
    }

    async moderarServicio(tipo, id, accion) {
        const repo = this.reposPorTipoServicio[tipo];
        if (!repo) throw new ValidationError(`Tipo de servicio inválido: ${tipo}`);

        const servicio = await repo.model.findById(id);
        if (!servicio) throw new NotFoundError("Servicio no encontrado");

        const acciones = {
            aprobar: 'Activada',
            rechazar: 'Desactivada',
            suspender: 'Desactivada',
        };

        const nuevoEstado = acciones[accion];
        if (!nuevoEstado) throw new ValidationError(`Acción inválida: ${accion}`);

        servicio.estado = nuevoEstado;
        await servicio.save();
    }

    // ─── CONFIGURACION ──────────────────────────────────

    async getConfiguracion() {
        return await this.configuracionRepo.getConfig();
    }

    async updateConfiguracion(datos, adminId) {
        const { comisionPorcentaje, comisionFija } = datos;
        return await this.configuracionRepo.updateConfig({
            comisionPorcentaje,
            comisionFija,
            updatedBy: adminId,
        });
    }
}

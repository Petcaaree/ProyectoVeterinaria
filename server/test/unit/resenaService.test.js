import { jest } from '@jest/globals';
import { ResenaService } from '../../vet/services/resenaService.js';
import { ValidationError, ConflictError, NotFoundError } from '../../vet/errors/AppError.js';
import { EstadoReserva } from '../../vet/models/entidades/enums/EstadoReserva.js';

// ─── Mock factories ──────────────────────────────────────────
function crearMockRepos() {
    const mockModel = () => ({ findByIdAndUpdate: jest.fn().mockResolvedValue(null) });
    return {
        resenaRepo: {
            create: jest.fn(),
            findByReserva: jest.fn(),
            findByServicio: jest.fn(),
            calcularPromedio: jest.fn().mockResolvedValue({ promedio: 0, cantidad: 0 }),
        },
        reservaRepo: {
            findById: jest.fn(),
        },
        servicioVeterinariaRepo: { model: mockModel() },
        servicioPaseadorRepo: { model: mockModel() },
        servicioCuidadorRepo: { model: mockModel() },
    };
}

const CLIENTE_ID = '507f1f77bcf86cd799439011';
const RESERVA_ID = '507f1f77bcf86cd799439012';
const SERVICIO_ID = '507f1f77bcf86cd799439013';

function crearReservaFalsa(overrides = {}) {
    return {
        _id: RESERVA_ID,
        cliente: { _id: CLIENTE_ID },
        estado: EstadoReserva.COMPLETADA,
        servicioReservado: { _id: SERVICIO_ID },
        serviciOfrecido: 'ServicioVeterinaria',
        ...overrides,
    };
}

function crearResenaFalsa(overrides = {}) {
    return {
        _id: 'resena1',
        cliente: CLIENTE_ID,
        servicio: SERVICIO_ID,
        reserva: RESERVA_ID,
        puntuacion: 5,
        comentario: 'excelente',
        fecha: new Date('2026-04-22'),
        ...overrides,
    };
}

describe('ResenaService', () => {
    let service;
    let repos;

    beforeEach(() => {
        repos = crearMockRepos();
        service = new ResenaService(
            repos.resenaRepo,
            repos.reservaRepo,
            repos.servicioVeterinariaRepo,
            repos.servicioPaseadorRepo,
            repos.servicioCuidadorRepo,
        );
    });

    // ─── crear ──────────────────────────────────────────────────
    describe('crear', () => {
        const input = () => ({
            clienteId: CLIENTE_ID,
            reservaId: RESERVA_ID,
            puntuacion: 5,
            comentario: 'todo bien',
        });

        it('lanza ValidationError si falta clienteId', async () => {
            await expect(service.crear({ ...input(), clienteId: undefined }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ValidationError si falta reservaId', async () => {
            await expect(service.crear({ ...input(), reservaId: undefined }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ValidationError si la puntuación no es entera', async () => {
            await expect(service.crear({ ...input(), puntuacion: 3.5 }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ValidationError si la puntuación está fuera de [1,5]', async () => {
            await expect(service.crear({ ...input(), puntuacion: 0 }))
                .rejects.toThrow(ValidationError);
            await expect(service.crear({ ...input(), puntuacion: 6 }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ValidationError si el comentario supera 500 caracteres', async () => {
            await expect(service.crear({ ...input(), comentario: 'a'.repeat(501) }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza NotFoundError si la reserva no existe', async () => {
            repos.reservaRepo.findById.mockResolvedValue(null);
            await expect(service.crear(input()))
                .rejects.toThrow(NotFoundError);
        });

        it('lanza ValidationError si la reserva pertenece a otro cliente', async () => {
            repos.reservaRepo.findById.mockResolvedValue(
                crearReservaFalsa({ cliente: { _id: 'otroCliente' } })
            );
            await expect(service.crear(input()))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ValidationError si la reserva no está COMPLETADA', async () => {
            repos.reservaRepo.findById.mockResolvedValue(
                crearReservaFalsa({ estado: EstadoReserva.CONFIRMADA })
            );
            await expect(service.crear(input()))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ConflictError si ya existe reseña para la reserva', async () => {
            repos.reservaRepo.findById.mockResolvedValue(crearReservaFalsa());
            repos.resenaRepo.findByReserva.mockResolvedValue(crearResenaFalsa());
            await expect(service.crear(input()))
                .rejects.toThrow(ConflictError);
        });

        it('lanza ConflictError si create dispara error 11000 (race condition)', async () => {
            repos.reservaRepo.findById.mockResolvedValue(crearReservaFalsa());
            repos.resenaRepo.findByReserva.mockResolvedValue(null);
            const err = Object.assign(new Error('dup'), { code: 11000 });
            repos.resenaRepo.create.mockRejectedValue(err);
            await expect(service.crear(input()))
                .rejects.toThrow(ConflictError);
        });

        it('relanza errores no-11000 sin transformarlos', async () => {
            repos.reservaRepo.findById.mockResolvedValue(crearReservaFalsa());
            repos.resenaRepo.findByReserva.mockResolvedValue(null);
            const err = new Error('DB explotó');
            repos.resenaRepo.create.mockRejectedValue(err);
            await expect(service.crear(input())).rejects.toThrow('DB explotó');
        });

        it('lanza ValidationError si serviciOfrecido es desconocido', async () => {
            repos.reservaRepo.findById.mockResolvedValue(
                crearReservaFalsa({ serviciOfrecido: 'ServicioInexistente' })
            );
            repos.resenaRepo.findByReserva.mockResolvedValue(null);
            repos.resenaRepo.create.mockResolvedValue(crearResenaFalsa());
            await expect(service.crear(input()))
                .rejects.toThrow(ValidationError);
        });

        it('happy path: crea reseña, recalcula promedio y devuelve DTO', async () => {
            repos.reservaRepo.findById.mockResolvedValue(crearReservaFalsa());
            repos.resenaRepo.findByReserva.mockResolvedValue(null);
            repos.resenaRepo.create.mockResolvedValue(crearResenaFalsa());
            repos.resenaRepo.calcularPromedio.mockResolvedValue({ promedio: 4.5, cantidad: 2 });

            const result = await service.crear(input());

            expect(repos.resenaRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                cliente: CLIENTE_ID,
                reserva: RESERVA_ID,
                puntuacion: 5,
                comentario: 'todo bien',
                serviciOfrecido: 'ServicioVeterinaria',
            }));
            expect(repos.servicioVeterinariaRepo.model.findByIdAndUpdate).toHaveBeenCalledWith(
                SERVICIO_ID,
                { calificacionPromedio: 4.5, cantidadResenas: 2 },
            );
            expect(result).toMatchObject({
                id: 'resena1',
                puntuacion: 5,
                comentario: 'excelente',
            });
        });

        it('enruta a repo de Paseador cuando serviciOfrecido es ServicioPaseador', async () => {
            repos.reservaRepo.findById.mockResolvedValue(
                crearReservaFalsa({ serviciOfrecido: 'ServicioPaseador' })
            );
            repos.resenaRepo.findByReserva.mockResolvedValue(null);
            repos.resenaRepo.create.mockResolvedValue(crearResenaFalsa());

            await service.crear(input());

            expect(repos.servicioPaseadorRepo.model.findByIdAndUpdate).toHaveBeenCalled();
            expect(repos.servicioVeterinariaRepo.model.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('normaliza comentario undefined a string vacío', async () => {
            repos.reservaRepo.findById.mockResolvedValue(crearReservaFalsa());
            repos.resenaRepo.findByReserva.mockResolvedValue(null);
            repos.resenaRepo.create.mockResolvedValue(crearResenaFalsa());

            await service.crear({ ...input(), comentario: undefined });

            expect(repos.resenaRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ comentario: '' })
            );
        });
    });

    // ─── listarPorServicio ──────────────────────────────────────
    describe('listarPorServicio', () => {
        it('aplica defaults de paginación (page=1, limit=10)', async () => {
            repos.resenaRepo.findByServicio.mockResolvedValue({ data: [], total: 0 });

            await service.listarPorServicio(SERVICIO_ID);

            expect(repos.resenaRepo.findByServicio).toHaveBeenCalledWith(
                SERVICIO_ID,
                { page: 1, limit: 10 },
            );
        });

        it('clampa page a mínimo 1', async () => {
            repos.resenaRepo.findByServicio.mockResolvedValue({ data: [], total: 0 });

            await service.listarPorServicio(SERVICIO_ID, { page: 0, limit: 5 });

            expect(repos.resenaRepo.findByServicio).toHaveBeenCalledWith(
                SERVICIO_ID,
                { page: 1, limit: 5 },
            );
        });

        it('clampa limit a máximo 100', async () => {
            repos.resenaRepo.findByServicio.mockResolvedValue({ data: [], total: 0 });

            await service.listarPorServicio(SERVICIO_ID, { page: 1, limit: 999 });

            expect(repos.resenaRepo.findByServicio).toHaveBeenCalledWith(
                SERVICIO_ID,
                { page: 1, limit: 100 },
            );
        });

        it('clampa limit a mínimo 1 cuando es negativo', async () => {
            repos.resenaRepo.findByServicio.mockResolvedValue({ data: [], total: 0 });

            await service.listarPorServicio(SERVICIO_ID, { page: 1, limit: -5 });

            expect(repos.resenaRepo.findByServicio).toHaveBeenCalledWith(
                SERVICIO_ID,
                { page: 1, limit: 1 },
            );
        });

        it('calcula total_pages con Math.ceil', async () => {
            repos.resenaRepo.findByServicio.mockResolvedValue({ data: [], total: 25 });

            const result = await service.listarPorServicio(SERVICIO_ID, { page: 1, limit: 10 });

            expect(result.total_pages).toBe(3);
            expect(result.total).toBe(25);
            expect(result.page).toBe(1);
            expect(result.per_page).toBe(10);
        });

        it('mapea cliente populado a { _id, nombreUsuario }', async () => {
            const resena = crearResenaFalsa({
                cliente: { _id: CLIENTE_ID, nombreUsuario: 'juan', email: 'no@debe.exponer' },
            });
            repos.resenaRepo.findByServicio.mockResolvedValue({ data: [resena], total: 1 });

            const result = await service.listarPorServicio(SERVICIO_ID);

            expect(result.data[0].cliente).toEqual({ _id: CLIENTE_ID, nombreUsuario: 'juan' });
            expect(result.data[0].cliente).not.toHaveProperty('email');
        });

        it('deja cliente como ObjectId crudo si no viene populado', async () => {
            const resena = crearResenaFalsa({ cliente: CLIENTE_ID });
            repos.resenaRepo.findByServicio.mockResolvedValue({ data: [resena], total: 1 });

            const result = await service.listarPorServicio(SERVICIO_ID);

            expect(result.data[0].cliente).toBe(CLIENTE_ID);
        });
    });
});

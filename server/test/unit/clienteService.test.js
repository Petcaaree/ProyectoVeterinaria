import { jest } from '@jest/globals';
import { ClienteService } from '../../vet/services/clienteService.js';
import { ValidationError, ConflictError, NotFoundError } from '../../vet/errors/AppError.js';

// ─── Mock factories ──────────────────────────────────────────
function crearMockRepos() {
    return {
        clienteRepo: {
            findByEmail: jest.fn(),
            findByNombreUsuario: jest.fn(),
            findByPage: jest.fn(),
            countAll: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            deleteById: jest.fn(),
            findMascotasByCliente: jest.fn()
        },
        ciudadRepo: {
            findByName: jest.fn(),
            save: jest.fn()
        },
        localidadRepo: {
            findByName: jest.fn(),
            save: jest.fn()
        },
        reservaRepo: {
            findAllByMacota: jest.fn()
        }
    };
}

function crearClienteFalso(overrides = {}) {
    return {
        id: '507f1f77bcf86cd799439011',
        nombreUsuario: 'juanperez',
        email: 'juan@test.com',
        contrasenia: '$2b$10$hashedpassword',
        telefono: '1155001122',
        notificaciones: [],
        mascotas: [],
        direccion: {
            calle: 'Av. Siempre Viva',
            altura: '742',
            localidad: {
                nombre: 'Springfield',
                ciudad: { id: 'city1', nombre: 'Buenos Aires' }
            }
        },
        ...overrides
    };
}

describe('ClienteService', () => {
    let service;
    let repos;

    beforeEach(() => {
        repos = crearMockRepos();
        service = new ClienteService(
            repos.clienteRepo,
            repos.ciudadRepo,
            repos.localidadRepo,
            repos.reservaRepo
        );
    });

    // ─── logIn ──────────────────────────────────────────────────
    describe('logIn', () => {
        it('lanza ValidationError si falta email', async () => {
            await expect(service.logIn({ contrasenia: 'pass' }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ValidationError si falta contrasenia', async () => {
            await expect(service.logIn({ email: 'a@b.com' }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza NotFoundError si el email no existe', async () => {
            repos.clienteRepo.findByEmail.mockResolvedValue(null);

            await expect(service.logIn({ email: 'noexiste@test.com', contrasenia: 'Pass1!' }))
                .rejects.toThrow(NotFoundError);
        });

        it('lanza ValidationError si la contraseña es incorrecta', async () => {
            // Usamos bcrypt real para generar un hash válido
            const { hashPassword } = await import('../../vet/utils/passwordUtils.js');
            const hash = await hashPassword('CorrectPass1!');
            const cliente = crearClienteFalso({ contrasenia: hash });
            repos.clienteRepo.findByEmail.mockResolvedValue(cliente);

            await expect(service.logIn({ email: 'juan@test.com', contrasenia: 'WrongPass1!' }))
                .rejects.toThrow(ValidationError);
        });

        it('retorna DTO del usuario si login es exitoso', async () => {
            const { hashPassword } = await import('../../vet/utils/passwordUtils.js');
            const hash = await hashPassword('CorrectPass1!');
            const cliente = crearClienteFalso({ contrasenia: hash });
            repos.clienteRepo.findByEmail.mockResolvedValue(cliente);

            const result = await service.logIn({ email: 'juan@test.com', contrasenia: 'CorrectPass1!' });

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email', 'juan@test.com');
            expect(result).not.toHaveProperty('contrasenia'); // DTO no expone contraseña
        });
    });

    // ─── create ─────────────────────────────────────────────────
    describe('create', () => {
        const datosCliente = {
            nombreUsuario: 'nuevouser',
            email: 'nuevo@test.com',
            contrasenia: 'NuevaPass1!',
            telefono: '1155001122',
            direccion: {
                calle: 'Calle Falsa',
                altura: '123',
                localidad: {
                    nombre: 'Springfield',
                    ciudad: { nombre: 'Buenos Aires' }
                }
            }
        };

        it('lanza ValidationError si faltan datos obligatorios', async () => {
            await expect(service.create({ email: 'a@b.com' }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza ConflictError si el email ya existe', async () => {
            repos.clienteRepo.findByEmail.mockResolvedValue(crearClienteFalso());

            await expect(service.create(datosCliente))
                .rejects.toThrow(ConflictError);
        });

        it('lanza ConflictError si el nombre de usuario ya existe', async () => {
            repos.clienteRepo.findByEmail.mockResolvedValue(null);
            repos.clienteRepo.findByNombreUsuario.mockResolvedValue(crearClienteFalso());

            await expect(service.create(datosCliente))
                .rejects.toThrow(ConflictError);
        });

        it('crea cliente exitosamente con ciudad y localidad nuevas', async () => {
            repos.clienteRepo.findByEmail.mockResolvedValue(null);
            repos.clienteRepo.findByNombreUsuario.mockResolvedValue(null);
            repos.ciudadRepo.findByName.mockResolvedValue(null);
            repos.ciudadRepo.save.mockResolvedValue({ id: 'newcity', nombre: 'Buenos Aires' });
            repos.localidadRepo.findByName.mockResolvedValue(null);
            repos.localidadRepo.save.mockResolvedValue({
                id: 'newloc',
                nombre: 'Springfield',
                ciudad: { id: 'newcity', nombre: 'Buenos Aires' }
            });
            repos.clienteRepo.save.mockResolvedValue(crearClienteFalso({
                nombreUsuario: 'nuevouser',
                email: 'nuevo@test.com'
            }));

            const result = await service.create(datosCliente);

            expect(result).toHaveProperty('id');
            expect(result.email).toBe('nuevo@test.com');
            expect(repos.clienteRepo.save).toHaveBeenCalledTimes(1);
        });
    });

    // ─── findAll ────────────────────────────────────────────────
    describe('findAll', () => {
        it('retorna paginación correcta', async () => {
            const clientes = [crearClienteFalso(), crearClienteFalso({ id: '2', email: 'otro@test.com' })];
            repos.clienteRepo.findByPage.mockResolvedValue(clientes);
            repos.clienteRepo.countAll.mockResolvedValue(2);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.page).toBe(1);
            expect(result.per_page).toBe(10);
            expect(result.total).toBe(2);
            expect(result.total_pages).toBe(1);
            expect(result.data).toHaveLength(2);
        });

        it('sanitiza parámetros de paginación inválidos', async () => {
            repos.clienteRepo.findByPage.mockResolvedValue([]);
            repos.clienteRepo.countAll.mockResolvedValue(0);

            const result = await service.findAll({ page: -1, limit: 999 });

            expect(result.page).toBe(1);
            expect(result.per_page).toBe(100); // maxLimit
        });
    });

    // ─── delete ─────────────────────────────────────────────────
    describe('delete', () => {
        it('elimina cliente existente', async () => {
            repos.clienteRepo.deleteById.mockResolvedValue(true);

            const result = await service.delete('507f1f77bcf86cd799439011');
            expect(result).toBe(true);
        });

        it('lanza NotFoundError si el cliente no existe', async () => {
            repos.clienteRepo.deleteById.mockResolvedValue(null);

            await expect(service.delete('invalidid'))
                .rejects.toThrow(NotFoundError);
        });
    });

    // ─── update ─────────────────────────────────────────────────
    describe('update', () => {
        it('actualiza campos del cliente', async () => {
            const cliente = crearClienteFalso();
            repos.clienteRepo.findById.mockResolvedValue(cliente);
            repos.clienteRepo.save.mockResolvedValue({ ...cliente, nombreUsuario: 'updated' });

            const result = await service.update('507f1f77bcf86cd799439011', {
                nombreUsuario: 'updated'
            });

            expect(result.nombreUsuario).toBe('updated');
        });

        it('lanza NotFoundError si el cliente no existe', async () => {
            repos.clienteRepo.findById.mockResolvedValue(null);

            await expect(service.update('invalidid', { nombreUsuario: 'x' }))
                .rejects.toThrow(NotFoundError);
        });

        it('lanza ConflictError si email ya existe en otro cliente', async () => {
            const cliente = crearClienteFalso();
            repos.clienteRepo.findById.mockResolvedValue(cliente);
            repos.clienteRepo.findByEmail.mockResolvedValue(
                crearClienteFalso({ id: 'otrocliente', email: 'existente@test.com' })
            );

            await expect(service.update('507f1f77bcf86cd799439011', {
                email: 'existente@test.com'
            })).rejects.toThrow(ConflictError);
        });
    });
});

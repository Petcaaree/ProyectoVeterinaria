import { jest } from '@jest/globals';
import request from 'supertest';
import { crearTestApp } from './testApp.js';
import { generarToken } from '../../vet/utils/jwtUtils.js';
import { NotFoundError, ValidationError } from '../../vet/errors/AppError.js';

// ─── Mock del servicio ──────────────────────────────────────
function crearMockClienteService() {
    return {
        logIn: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        getMascotas: jest.fn(),
        addMascotaCreada: jest.fn(),
        eliminarMascota: jest.fn(),
        getAllNotificaciones: jest.fn(),
        getNotificacionesLeidasOnoLeidas: jest.fn(),
        leerNotificacion: jest.fn(),
        marcarTodasLeidas: jest.fn(),
        getContadorNotificacionesNoLeidas: jest.fn()
    };
}

describe('Auth - Endpoints de Cliente', () => {
    let app;
    let mockService;

    beforeEach(() => {
        mockService = crearMockClienteService();
        app = crearTestApp(mockService);
    });

    // ─── POST /petcare/login/cliente ────────────────────────────
    describe('POST /petcare/login/cliente', () => {
        it('200 — login exitoso devuelve data y token', async () => {
            const usuarioDTO = {
                id: '507f1f77bcf86cd799439011',
                nombreUsuario: 'juan',
                email: 'juan@test.com',
                telefono: '1155001122',
                notificaciones: [],
                direccion: {
                    calle: 'Av. Test', altura: '100',
                    localidad: { nombre: 'Springfield', ciudad: 'Buenos Aires' }
                },
                mascotas: []
            };
            mockService.logIn.mockResolvedValue(usuarioDTO);

            const res = await request(app)
                .post('/petcare/login/cliente')
                .send({ email: 'juan@test.com', contrasenia: 'MiPass1!' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('token');
            expect(res.body.data.email).toBe('juan@test.com');
        });

        it('400 — falla validación sin email', async () => {
            const res = await request(app)
                .post('/petcare/login/cliente')
                .send({ contrasenia: 'MiPass1!' });

            expect(res.status).toBe(400);
        });

        it('400 — falla validación sin contrasenia', async () => {
            const res = await request(app)
                .post('/petcare/login/cliente')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(400);
        });

        it('404 — email no encontrado', async () => {
            mockService.logIn.mockRejectedValue(new NotFoundError('Email o Contraseña incorrectas'));

            const res = await request(app)
                .post('/petcare/login/cliente')
                .send({ email: 'noexiste@test.com', contrasenia: 'MiPass1!' });

            expect(res.status).toBe(404);
        });
    });

    // ─── POST /petcare/signin/cliente ───────────────────────────
    describe('POST /petcare/signin/cliente', () => {
        const datosRegistro = {
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

        it('201 — registro exitoso devuelve data y token', async () => {
            mockService.create.mockResolvedValue({
                id: 'newid',
                nombreUsuario: 'nuevouser',
                email: 'nuevo@test.com',
                telefono: '1155001122',
                notificaciones: [],
                direccion: {
                    calle: 'Calle Falsa', altura: '123',
                    localidad: { nombre: 'Springfield', ciudad: 'Buenos Aires' }
                },
                mascotas: []
            });

            const res = await request(app)
                .post('/petcare/signin/cliente')
                .send(datosRegistro);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('token');
        });

        it('400 — falla validación sin campos obligatorios', async () => {
            const res = await request(app)
                .post('/petcare/signin/cliente')
                .send({ email: 'a@b.com' });

            expect(res.status).toBe(400);
        });
    });

    // ─── Rutas protegidas ───────────────────────────────────────
    describe('Rutas protegidas', () => {
        it('401 — acceso sin token a ruta protegida', async () => {
            const res = await request(app)
                .delete('/petcare/cliente/507f1f77bcf86cd799439011');

            expect(res.status).toBe(401);
        });

        it('401 — acceso con token inválido', async () => {
            const res = await request(app)
                .delete('/petcare/cliente/507f1f77bcf86cd799439011')
                .set('Authorization', 'Bearer token.invalido.aqui');

            expect(res.status).toBe(401);
        });

        it('403 — acceso con rol incorrecto (veterinaria intentando ruta de cliente)', async () => {
            const token = generarToken({ id: '507f1f77bcf86cd799439011', email: 'vet@test.com' }, 'veterinaria');

            const res = await request(app)
                .delete('/petcare/cliente/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(403);
        });

        it('204 — delete exitoso con token de cliente válido', async () => {
            const token = generarToken({ id: '507f1f77bcf86cd799439011', email: 'juan@test.com' }, 'cliente');
            mockService.delete.mockResolvedValue(true);

            const res = await request(app)
                .delete('/petcare/cliente/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(204);
        });
    });

    // ─── GET /petcare/clientes (paginación) ─────────────────────
    describe('GET /petcare/clientes', () => {
        it('200 — retorna lista paginada', async () => {
            mockService.findAll.mockResolvedValue({
                page: 1, per_page: 10, total: 0, total_pages: 0, data: []
            });

            const res = await request(app)
                .get('/petcare/clientes');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('total');
        });

        it('200 — acepta query params de paginación', async () => {
            mockService.findAll.mockResolvedValue({
                page: 2, per_page: 5, total: 15, total_pages: 3, data: []
            });

            const res = await request(app)
                .get('/petcare/clientes?page=2&limit=5');

            expect(res.status).toBe(200);
            expect(res.body.page).toBe(2);
        });
    });
});

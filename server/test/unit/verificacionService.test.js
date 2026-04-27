import { jest } from '@jest/globals';
import { VerificacionService } from '../../vet/services/verificacionService.js';
import { ValidationError, NotFoundError } from '../../vet/errors/AppError.js';

const VET_ID = '507f1f77bcf86cd799439011';

function crearRepo() {
    return {
        findById: jest.fn(),
        findPendientesVerificacion: jest.fn(),
    };
}

function crearVetFake(verificacion = null) {
    return {
        _id: VET_ID,
        verificacion,
        save: jest.fn().mockResolvedValue(true),
    };
}

function docs({ extras = [], incluir = ['HABILITACION_MUNICIPAL', 'FOTO_FRENTE', 'FOTO_INTERIOR'] } = {}) {
    return [...incluir.map((tipo) => ({ tipo, url: `https://cdn.example.com/${tipo}.jpg` })), ...extras];
}

const payloadClinica = () => ({
    tipoEstablecimiento: 'CLINICA',
    razonSocial: 'Clínica Palermo SRL',
    cuit: '30-12345678-9',
    matriculaProfesional: 'MP-1234',
    direccion: {
        calle: 'Honduras', numero: '4800', localidad: 'Palermo',
        provincia: 'CABA', codigoPostal: '1414',
    },
    telefono: '1133445566',
    documentos: docs(),
});

const payloadConsultorio = () => ({
    tipoEstablecimiento: 'CONSULTORIO_PRIVADO',
    cuit: '20-12345678-3',
    matriculaProfesional: 'MP-9999',
    direccion: {
        calle: 'Juramento', numero: '1200', localidad: 'Belgrano',
        provincia: 'CABA', codigoPostal: '1428',
    },
    telefono: '1199887766',
    documentos: docs({ incluir: ['FOTO_INTERIOR', 'COMPROBANTE_DOMICILIO', 'CONSTANCIA_FISCAL'] }),
});

describe('VerificacionService', () => {
    let service;
    let repo;

    beforeEach(() => {
        repo = crearRepo();
        service = new VerificacionService(repo);
        // Mock por defecto: vet existe y aún no inició verificación.
        // Los tests que necesitan otro estado lo sobreescriben.
        repo.findById.mockResolvedValue(crearVetFake(null));
    });

    describe('crear', () => {
        it('happy path: clínica con todos los documentos', async () => {
            const vet = crearVetFake();
            repo.findById.mockResolvedValue(vet);

            const result = await service.crear(VET_ID, payloadClinica());

            expect(vet.save).toHaveBeenCalled();
            expect(vet.verificacion.estadoVerificacion).toBe('PENDIENTE');
            expect(result.cuit).toBe('30-12345678-9');
            expect(result.estadoVerificacion).toBe('PENDIENTE');
        });

        it('happy path: consultorio privado sin razón social', async () => {
            const vet = crearVetFake();
            repo.findById.mockResolvedValue(vet);

            await service.crear(VET_ID, payloadConsultorio());

            expect(vet.verificacion.tipoEstablecimiento).toBe('CONSULTORIO_PRIVADO');
            expect(vet.save).toHaveBeenCalled();
        });

        it('devuelve ValidationError (no TypeError) si payload es null, array o primitivo', async () => {
            await expect(service.crear(VET_ID, null)).rejects.toThrow(/payload/);
            await expect(service.crear(VET_ID, [])).rejects.toThrow(/payload/);
            await expect(service.crear(VET_ID, "string")).rejects.toThrow(/payload/);
        });

        it('rechaza CUIT con formato inválido', async () => {
            const payload = { ...payloadClinica(), cuit: '30123456789' };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(ValidationError);
        });

        it('rechaza razonSocial no-string aunque sea consultorio (evita coerción)', async () => {
            const payload = { ...payloadConsultorio(), razonSocial: 12345 };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/razonSocial/);
        });

        it('ignora razonSocial enviada por consultorio (la normaliza a null)', async () => {
            const vet = crearVetFake();
            repo.findById.mockResolvedValue(vet);
            const payload = { ...payloadConsultorio(), razonSocial: 'Consultorio Pérez' };
            await service.crear(VET_ID, payload);
            expect(vet.verificacion.razonSocial).toBeNull();
        });

        it('rechaza clínica sin razonSocial', async () => {
            const payload = { ...payloadClinica(), razonSocial: '' };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/razonSocial/);
        });

        it('rechaza hospital sin habilitación municipal', async () => {
            const payload = {
                ...payloadClinica(),
                tipoEstablecimiento: 'HOSPITAL',
                documentos: docs({ incluir: ['FOTO_FRENTE', 'FOTO_INTERIOR'] }),
            };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/HABILITACION_MUNICIPAL/);
        });

        it('rechaza consultorio sin comprobante de domicilio', async () => {
            const payload = {
                ...payloadConsultorio(),
                documentos: docs({ incluir: ['FOTO_INTERIOR', 'CONSTANCIA_FISCAL'] }),
            };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/COMPROBANTE_DOMICILIO/);
        });

        it('rechaza tipoEstablecimiento inválido', async () => {
            const payload = { ...payloadClinica(), tipoEstablecimiento: 'VETERINARIA_MOVIL' };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/tipoEstablecimiento/);
        });

        it('rechaza dirección incompleta', async () => {
            const payload = { ...payloadClinica(), direccion: { calle: 'x', numero: '1' } };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/direccion/);
        });

        it('rechaza dirección con campos no-string (evita coercion de Mongoose)', async () => {
            repo.findById.mockResolvedValue(crearVetFake());
            const payloadNumeroInt = {
                ...payloadClinica(),
                direccion: {
                    calle: 'Honduras', numero: 4800, localidad: 'Palermo',
                    provincia: 'CABA', codigoPostal: '1414',
                },
            };
            await expect(service.crear(VET_ID, payloadNumeroInt)).rejects.toThrow(/direccion/);

            const payloadDireccionNoObj = { ...payloadClinica(), direccion: "Honduras 4800" };
            await expect(service.crear(VET_ID, payloadDireccionNoObj)).rejects.toThrow(/direccion/);
        });

        it('rechaza documentos con url vacía o solo espacios', async () => {
            const payload = {
                ...payloadClinica(),
                documentos: [
                    { tipo: 'HABILITACION_MUNICIPAL', url: 'https://x/1.jpg' },
                    { tipo: 'FOTO_FRENTE', url: '   ' },
                    { tipo: 'FOTO_INTERIOR', url: 'https://x/3.jpg' },
                ],
            };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/url/);
        });

        it('normaliza urls con espacios al crear', async () => {
            const vet = crearVetFake();
            repo.findById.mockResolvedValue(vet);
            const payload = {
                ...payloadClinica(),
                documentos: [
                    { tipo: 'HABILITACION_MUNICIPAL', url: '  https://x/1.jpg  ' },
                    { tipo: 'FOTO_FRENTE', url: 'https://x/2.jpg' },
                    { tipo: 'FOTO_INTERIOR', url: 'https://x/3.jpg' },
                ],
            };
            await service.crear(VET_ID, payload);
            expect(vet.verificacion.documentos[0].url).toBe('https://x/1.jpg');
        });

        it('no muta el payload original (normalización devuelve copia)', async () => {
            const vet = crearVetFake();
            repo.findById.mockResolvedValue(vet);
            const urlConEspacios = '  https://x/1.jpg  ';
            const payload = {
                ...payloadClinica(),
                documentos: [
                    { tipo: 'HABILITACION_MUNICIPAL', url: urlConEspacios },
                    { tipo: 'FOTO_FRENTE', url: 'https://x/2.jpg' },
                    { tipo: 'FOTO_INTERIOR', url: 'https://x/3.jpg' },
                ],
            };
            const direccionOriginal = payload.direccion;
            await service.crear(VET_ID, payload);
            // El payload original mantiene los espacios y la misma referencia de dirección.
            expect(payload.documentos[0].url).toBe(urlConEspacios);
            expect(payload.direccion).toBe(direccionOriginal);
            // Lo persistido debe ser una copia, no la misma referencia.
            expect(vet.verificacion.direccion).not.toBe(direccionOriginal);
        });

        it('rechaza documentos con url faltante', async () => {
            const payload = {
                ...payloadClinica(),
                documentos: [
                    { tipo: 'HABILITACION_MUNICIPAL', url: 'https://x/1.jpg' },
                    { tipo: 'FOTO_FRENTE' },
                    { tipo: 'FOTO_INTERIOR', url: 'https://x/3.jpg' },
                ],
            };
            await expect(service.crear(VET_ID, payload)).rejects.toThrow(/url/);
        });

        it('devuelve ValidationError (no TypeError) si campos string llegan como número', async () => {
            repo.findById.mockResolvedValue(crearVetFake());

            await expect(service.crear(VET_ID, { ...payloadClinica(), matriculaProfesional: 1234 }))
                .rejects.toThrow(ValidationError);
            await expect(service.crear(VET_ID, { ...payloadClinica(), telefono: 1133445566 }))
                .rejects.toThrow(ValidationError);
            await expect(service.crear(VET_ID, { ...payloadClinica(), razonSocial: 123 }))
                .rejects.toThrow(ValidationError);
        });

        it('lanza NotFoundError si la vet no existe', async () => {
            repo.findById.mockResolvedValue(null);
            await expect(service.crear(VET_ID, payloadClinica())).rejects.toThrow(NotFoundError);
        });

        it('bloquea si ya existe una verificación PENDIENTE', async () => {
            repo.findById.mockResolvedValue(crearVetFake({ estadoVerificacion: 'PENDIENTE' }));
            await expect(service.crear(VET_ID, payloadClinica())).rejects.toThrow(/PENDIENTE/);
        });

        it('bloquea si ya existe una verificación VERIFICADA', async () => {
            repo.findById.mockResolvedValue(crearVetFake({ estadoVerificacion: 'VERIFICADO' }));
            await expect(service.crear(VET_ID, payloadClinica())).rejects.toThrow(/VERIFICADO/);
        });

        it('bloquea si está RECHAZADO y sugiere reenviar', async () => {
            repo.findById.mockResolvedValue(crearVetFake({ estadoVerificacion: 'RECHAZADO' }));
            await expect(service.crear(VET_ID, payloadClinica())).rejects.toThrow(/reenvío/);
        });
    });

    describe('consultarEstado', () => {
        it('devuelve NO_INICIADA si la vet no tiene verificacion', async () => {
            repo.findById.mockResolvedValue(crearVetFake(null));
            const r = await service.consultarEstado(VET_ID);
            expect(r.estadoVerificacion).toBe('NO_INICIADA');
        });

        it('devuelve DTO si existe verificacion', async () => {
            const verificacion = {
                tipoEstablecimiento: 'CLINICA',
                cuit: '30-12345678-9',
                matriculaProfesional: 'MP-1',
                razonSocial: 'X',
                direccion: { calle: 'c', numero: '1', localidad: 'L', provincia: 'P', codigoPostal: '1' },
                telefono: '123',
                documentos: [{ tipo: 'FOTO_FRENTE', url: 'u', fechaSubida: new Date() }],
                estadoVerificacion: 'VERIFICADO',
                motivoRechazo: null,
                fechaActualizacion: new Date(),
            };
            repo.findById.mockResolvedValue(crearVetFake(verificacion));

            const r = await service.consultarEstado(VET_ID);
            expect(r.estadoVerificacion).toBe('VERIFICADO');
            expect(r.cuit).toBe('30-12345678-9');
        });
    });

    describe('reenviar', () => {
        it('devuelve ValidationError (no TypeError) si payload es null o primitivo', async () => {
            const vet = crearVetFake({ ...payloadClinica(), estadoVerificacion: 'RECHAZADO' });
            repo.findById.mockResolvedValue(vet);
            await expect(service.reenviar(VET_ID, null)).rejects.toThrow(/payload/);
            await expect(service.reenviar(VET_ID, "string")).rejects.toThrow(/payload/);
            await expect(service.reenviar(VET_ID, [])).rejects.toThrow(/payload/);
        });

        it('solo permite reenviar si estado es RECHAZADO', async () => {
            const vet = crearVetFake({ ...payloadClinica(), estadoVerificacion: 'VERIFICADO' });
            repo.findById.mockResolvedValue(vet);
            await expect(service.reenviar(VET_ID, payloadClinica())).rejects.toThrow(/RECHAZADO/);
        });

        it('preserva campos no enviados al reenviar', async () => {
            const original = {
                ...payloadClinica(),
                estadoVerificacion: 'RECHAZADO',
                motivoRechazo: 'Foto borrosa',
                cuit: '30-11111111-1',
            };
            const vet = crearVetFake(original);
            repo.findById.mockResolvedValue(vet);

            // Solo mando documentos nuevos; los datos deben preservarse.
            await service.reenviar(VET_ID, { documentos: docs() });

            expect(vet.verificacion.cuit).toBe('30-11111111-1'); // preservado
            expect(vet.verificacion.estadoVerificacion).toBe('PENDIENTE');
            expect(vet.verificacion.motivoRechazo).toBeNull();
        });
    });

    describe('resolver (admin)', () => {
        it('devuelve ValidationError (no TypeError) si payload es null o primitivo', async () => {
            const vet = crearVetFake({ estadoVerificacion: 'PENDIENTE' });
            repo.findById.mockResolvedValue(vet);
            await expect(service.resolver(VET_ID, null)).rejects.toThrow(/payload/);
            await expect(service.resolver(VET_ID, "x")).rejects.toThrow(/payload/);
            await expect(service.resolver(VET_ID, [])).rejects.toThrow(/payload/);
        });

        it('marca como VERIFICADO', async () => {
            const vet = crearVetFake({ ...payloadClinica(), estadoVerificacion: 'PENDIENTE' });
            repo.findById.mockResolvedValue(vet);

            await service.resolver(VET_ID, { estado: 'VERIFICADO' });

            expect(vet.verificacion.estadoVerificacion).toBe('VERIFICADO');
            expect(vet.verificacion.motivoRechazo).toBeNull();
        });

        it('exige motivo al rechazar', async () => {
            const vet = crearVetFake({ ...payloadClinica(), estadoVerificacion: 'PENDIENTE' });
            repo.findById.mockResolvedValue(vet);

            await expect(service.resolver(VET_ID, { estado: 'RECHAZADO' })).rejects.toThrow(/motivoRechazo/);
        });

        it('guarda motivoRechazo al rechazar', async () => {
            const vet = crearVetFake({ ...payloadClinica(), estadoVerificacion: 'PENDIENTE' });
            repo.findById.mockResolvedValue(vet);

            await service.resolver(VET_ID, { estado: 'RECHAZADO', motivoRechazo: 'CUIT inválido' });

            expect(vet.verificacion.estadoVerificacion).toBe('RECHAZADO');
            expect(vet.verificacion.motivoRechazo).toBe('CUIT inválido');
        });

        it('rechaza estado inválido', async () => {
            repo.findById.mockResolvedValue(crearVetFake({ estadoVerificacion: 'PENDIENTE' }));
            await expect(service.resolver(VET_ID, { estado: 'PENDIENTE' })).rejects.toThrow(ValidationError);
        });
    });

    describe('listarPendientes (admin)', () => {
        const verificacionPendiente = {
            tipoEstablecimiento: 'CLINICA',
            razonSocial: 'Clínica X SRL',
            cuit: '30-12345678-9',
            matriculaProfesional: 'MP-1',
            direccion: { calle: 'c', numero: '1', localidad: 'L', provincia: 'P', codigoPostal: '1' },
            telefono: '123',
            documentos: [{ tipo: 'HABILITACION_MUNICIPAL', url: 'https://x/1.jpg', fechaSubida: new Date() }],
            estadoVerificacion: 'PENDIENTE',
            motivoRechazo: null,
            fechaActualizacion: new Date(),
        };

        it('llama al repo con paginación por defecto y mapea el DTO con documentos', async () => {
            const vetDoc = {
                _id: VET_ID,
                nombre: 'Clínica X',
                email: 'x@x.com',
                nombreUsuario: 'clinicax',
                verificacion: verificacionPendiente,
            };
            repo.findPendientesVerificacion.mockResolvedValue({ items: [vetDoc], total: 1 });

            const r = await service.listarPendientes();

            expect(repo.findPendientesVerificacion).toHaveBeenCalledWith({ page: 1, limit: 20 });
            expect(r.total).toBe(1);
            expect(r.page).toBe(1);
            expect(r.limit).toBe(20);
            expect(r.items).toHaveLength(1);
            expect(r.items[0].veterinariaId).toBe(VET_ID);
            expect(r.items[0].nombre).toBe('Clínica X');
            expect(r.items[0].verificacion.estadoVerificacion).toBe('PENDIENTE');
            expect(r.items[0].verificacion.documentos).toEqual([
                expect.objectContaining({ tipo: 'HABILITACION_MUNICIPAL', url: 'https://x/1.jpg' }),
            ]);
        });

        it('clampa page/limit y los pasa parseados al repo', async () => {
            repo.findPendientesVerificacion.mockResolvedValue({ items: [], total: 0 });

            await service.listarPendientes({ page: '3', limit: '500' });
            expect(repo.findPendientesVerificacion).toHaveBeenCalledWith({ page: 3, limit: 100 });

            await service.listarPendientes({ page: '0', limit: '-5' });
            expect(repo.findPendientesVerificacion).toHaveBeenLastCalledWith({ page: 1, limit: 1 });
        });

        it('devuelve lista vacía sin romper si no hay pendientes', async () => {
            repo.findPendientesVerificacion.mockResolvedValue({ items: [], total: 0 });
            const r = await service.listarPendientes();
            expect(r.items).toEqual([]);
            expect(r.total).toBe(0);
        });
    });
});

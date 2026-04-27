import { jest } from '@jest/globals';
import { VerificacionPaseadorService } from '../../vet/services/verificacionPaseadorService.js';
import { ValidationError, NotFoundError } from '../../vet/errors/AppError.js';

const PASEADOR_ID = '507f1f77bcf86cd799439020';

function crearRepo() {
    return {
        findById: jest.fn(),
        findPendientesVerificacion: jest.fn(),
        countPendientesVerificacion: jest.fn(),
    };
}

function crearPaseadorFake(verificacion = null) {
    return {
        _id: PASEADOR_ID,
        verificacion,
        save: jest.fn().mockResolvedValue(true),
    };
}

function docs(overrides = {}) {
    const base = [
        { tipo: 'DNI_FRENTE', url: 'https://cdn.example.com/dni-f.jpg' },
        { tipo: 'DNI_DORSO', url: 'https://cdn.example.com/dni-d.jpg' },
        { tipo: 'ANTECEDENTES_PENALES', url: 'https://cdn.example.com/penal.pdf' },
        { tipo: 'FOTO_PERFIL', url: 'https://cdn.example.com/perfil.jpg' },
        { tipo: 'CONSTANCIA_FISCAL', url: 'https://cdn.example.com/fiscal.pdf' },
    ];
    if (overrides.replace) {
        return overrides.replace.map((tipo) => base.find((b) => b.tipo === tipo)).filter(Boolean);
    }
    if (overrides.merge) return [...base, ...overrides.merge];
    return base;
}

const payloadValido = (over = {}) => ({
    nombreCompleto: 'Lucas Fernández',
    fechaNacimiento: '1995-03-12',
    cuil: '20-38123456-7',
    direccion: {
        calle: 'Libertador', numero: '5500', localidad: 'Belgrano',
        provincia: 'CABA', codigoPostal: '1426',
    },
    zonaCobertura: ['Belgrano', 'Palermo'],
    telefono: '1122334455',
    documentos: docs(),
    ...over,
});

describe('VerificacionPaseadorService', () => {
    let service;
    let repo;

    beforeEach(() => {
        repo = crearRepo();
        service = new VerificacionPaseadorService(repo);
        repo.findById.mockResolvedValue(crearPaseadorFake(null));
    });

    describe('crear', () => {
        it('happy path: paseador con todos los datos válidos', async () => {
            const paseador = crearPaseadorFake();
            repo.findById.mockResolvedValue(paseador);

            const result = await service.crear(PASEADOR_ID, payloadValido());

            expect(paseador.save).toHaveBeenCalled();
            expect(paseador.verificacion.estadoVerificacion).toBe('PENDIENTE');
            expect(result.cuil).toBe('20-38123456-7');
        });

        it('rechaza menor de 18 años', async () => {
            const hace17 = new Date();
            hace17.setFullYear(hace17.getFullYear() - 17);
            const payload = payloadValido({ fechaNacimiento: hace17.toISOString() });
            await expect(service.crear(PASEADOR_ID, payload)).rejects.toThrow(/18/);
        });

        it('acepta exactamente 18 años', async () => {
            const hace18Justos = new Date();
            hace18Justos.setFullYear(hace18Justos.getFullYear() - 18);
            // Restar 1 día para asegurar que ya cumplió.
            hace18Justos.setDate(hace18Justos.getDate() - 1);
            const paseador = crearPaseadorFake();
            repo.findById.mockResolvedValue(paseador);

            await expect(service.crear(PASEADOR_ID, payloadValido({
                fechaNacimiento: hace18Justos.toISOString(),
            }))).resolves.toBeDefined();
        });

        it('rechaza fechaNacimiento inválida', async () => {
            await expect(service.crear(PASEADOR_ID, payloadValido({ fechaNacimiento: 'no-es-fecha' })))
                .rejects.toThrow(/fechaNacimiento/);
        });

        it('rechaza CUIL con formato inválido', async () => {
            await expect(service.crear(PASEADOR_ID, payloadValido({ cuil: '20381234567' })))
                .rejects.toThrow(/CUIL/);
        });

        it('rechaza si FOTO_PERFIL es PDF', async () => {
            const documentos = docs().map((d) =>
                d.tipo === 'FOTO_PERFIL' ? { ...d, url: 'https://cdn.example.com/perfil.pdf' } : d
            );
            await expect(service.crear(PASEADOR_ID, payloadValido({ documentos })))
                .rejects.toThrow(/FOTO_PERFIL.*imagen/);
        });

        it('acepta otros documentos como PDF', async () => {
            // ANTECEDENTES_PENALES y CONSTANCIA_FISCAL ya son PDF en docs() y debe pasar.
            const paseador = crearPaseadorFake();
            repo.findById.mockResolvedValue(paseador);
            await expect(service.crear(PASEADOR_ID, payloadValido())).resolves.toBeDefined();
        });

        it('rechaza si falta algún documento obligatorio', async () => {
            const documentos = docs({ replace: ['DNI_FRENTE', 'DNI_DORSO', 'FOTO_PERFIL', 'CONSTANCIA_FISCAL'] });
            await expect(service.crear(PASEADOR_ID, payloadValido({ documentos })))
                .rejects.toThrow(/ANTECEDENTES_PENALES/);
        });

        it('rechaza zonaCobertura vacía', async () => {
            await expect(service.crear(PASEADOR_ID, payloadValido({ zonaCobertura: [] })))
                .rejects.toThrow(/zonaCobertura/);
        });

        it('rechaza zonaCobertura con elementos no-string', async () => {
            await expect(service.crear(PASEADOR_ID, payloadValido({ zonaCobertura: ['Palermo', 123] })))
                .rejects.toThrow(/zonaCobertura/);
        });

        it('rechaza dirección incompleta', async () => {
            await expect(service.crear(PASEADOR_ID, payloadValido({ direccion: { calle: 'x' } })))
                .rejects.toThrow(/direccion/);
        });

        it('devuelve ValidationError (no TypeError) si payload es null/array/primitivo', async () => {
            await expect(service.crear(PASEADOR_ID, null)).rejects.toThrow(/payload/);
            await expect(service.crear(PASEADOR_ID, [])).rejects.toThrow(/payload/);
            await expect(service.crear(PASEADOR_ID, 'string')).rejects.toThrow(/payload/);
        });

        it('lanza NotFoundError si el paseador no existe', async () => {
            repo.findById.mockResolvedValue(null);
            await expect(service.crear(PASEADOR_ID, payloadValido())).rejects.toThrow(NotFoundError);
        });

        it('bloquea si ya existe verificación PENDIENTE', async () => {
            repo.findById.mockResolvedValue(crearPaseadorFake({ estadoVerificacion: 'PENDIENTE' }));
            await expect(service.crear(PASEADOR_ID, payloadValido())).rejects.toThrow(/PENDIENTE/);
        });

        it('bloquea si ya existe verificación VERIFICADA', async () => {
            repo.findById.mockResolvedValue(crearPaseadorFake({ estadoVerificacion: 'VERIFICADO' }));
            await expect(service.crear(PASEADOR_ID, payloadValido())).rejects.toThrow(/VERIFICADO/);
        });

        it('si está RECHAZADO sugiere usar reenviar', async () => {
            repo.findById.mockResolvedValue(crearPaseadorFake({ estadoVerificacion: 'RECHAZADO' }));
            await expect(service.crear(PASEADOR_ID, payloadValido())).rejects.toThrow(/reenvío/);
        });

        it('normaliza urls con espacios al persistir', async () => {
            const paseador = crearPaseadorFake();
            repo.findById.mockResolvedValue(paseador);
            const documentos = docs().map((d) => ({ ...d, url: `  ${d.url}  ` }));
            await service.crear(PASEADOR_ID, payloadValido({ documentos }));
            expect(paseador.verificacion.documentos[0].url).not.toMatch(/^\s/);
        });
    });

    describe('consultarEstado', () => {
        it('devuelve NO_INICIADA si no tiene verificación', async () => {
            repo.findById.mockResolvedValue(crearPaseadorFake(null));
            const r = await service.consultarEstado(PASEADOR_ID);
            expect(r.estadoVerificacion).toBe('NO_INICIADA');
        });
    });

    describe('reenviar', () => {
        it('solo permite reenviar si estado es RECHAZADO', async () => {
            repo.findById.mockResolvedValue(crearPaseadorFake({ ...payloadValido(), estadoVerificacion: 'PENDIENTE' }));
            await expect(service.reenviar(PASEADOR_ID, payloadValido())).rejects.toThrow(/RECHAZADO/);
        });

        it('preserva campos no enviados', async () => {
            const original = { ...payloadValido(), estadoVerificacion: 'RECHAZADO', motivoRechazo: 'X', cuil: '20-11111111-1' };
            const paseador = crearPaseadorFake(original);
            repo.findById.mockResolvedValue(paseador);

            await service.reenviar(PASEADOR_ID, { documentos: docs() });

            expect(paseador.verificacion.cuil).toBe('20-11111111-1');
            expect(paseador.verificacion.estadoVerificacion).toBe('PENDIENTE');
            expect(paseador.verificacion.motivoRechazo).toBeNull();
        });
    });

    describe('resolver (admin)', () => {
        it('marca como VERIFICADO', async () => {
            const paseador = crearPaseadorFake({ ...payloadValido(), estadoVerificacion: 'PENDIENTE' });
            repo.findById.mockResolvedValue(paseador);
            await service.resolver(PASEADOR_ID, { estado: 'VERIFICADO' });
            expect(paseador.verificacion.estadoVerificacion).toBe('VERIFICADO');
        });

        it('exige motivo al rechazar', async () => {
            repo.findById.mockResolvedValue(crearPaseadorFake({ estadoVerificacion: 'PENDIENTE' }));
            await expect(service.resolver(PASEADOR_ID, { estado: 'RECHAZADO' })).rejects.toThrow(/motivoRechazo/);
        });

        it('rechaza estado inválido', async () => {
            repo.findById.mockResolvedValue(crearPaseadorFake({ estadoVerificacion: 'PENDIENTE' }));
            await expect(service.resolver(PASEADOR_ID, { estado: 'PENDIENTE' })).rejects.toThrow(ValidationError);
        });
    });
});

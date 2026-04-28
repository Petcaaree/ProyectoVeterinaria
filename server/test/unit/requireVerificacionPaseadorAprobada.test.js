import { jest } from "@jest/globals";

const findById = jest.fn();
jest.unstable_mockModule("../../vet/models/schemas/paseadorSchema.js", () => ({
    PaseadorModel: { findById },
}));

const { requireVerificacionPaseadorAprobada } = await import(
    "../../vet/middlewares/requireVerificacionPaseadorAprobada.js"
);

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

function mockPaseador(paseador) {
    findById.mockReturnValue({ select: jest.fn().mockResolvedValue(paseador) });
}

describe("requireVerificacionPaseadorAprobada", () => {
    beforeEach(() => {
        findById.mockReset();
    });

    it("responde 401 si no hay req.usuario", async () => {
        const req = {};
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionPaseadorAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 404 si el paseador no existe", async () => {
        mockPaseador(null);
        const req = { usuario: { id: "p1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionPaseadorAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 403 NO_INICIADA si no tiene verificacion", async () => {
        mockPaseador({ verificacion: null });
        const req = { usuario: { id: "p1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionPaseadorAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "VERIFICACION_PENDIENTE", estadoActual: "NO_INICIADA" })
        );
    });

    it("responde 403 si estado es PENDIENTE", async () => {
        mockPaseador({ verificacion: { estadoVerificacion: "PENDIENTE" } });
        const req = { usuario: { id: "p1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionPaseadorAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ estadoActual: "PENDIENTE" })
        );
    });

    it("responde 403 si estado es RECHAZADO", async () => {
        mockPaseador({ verificacion: { estadoVerificacion: "RECHAZADO" } });
        const req = { usuario: { id: "p1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionPaseadorAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ estadoActual: "RECHAZADO" })
        );
    });

    it("llama a next() si estado es VERIFICADO", async () => {
        mockPaseador({ verificacion: { estadoVerificacion: "VERIFICADO" } });
        const req = { usuario: { id: "p1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionPaseadorAprobada(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("delega al errorHandler si findById lanza", async () => {
        const boom = new Error("DB down");
        findById.mockReturnValue({ select: jest.fn().mockRejectedValue(boom) });
        const req = { usuario: { id: "p1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionPaseadorAprobada(req, res, next);

        expect(next).toHaveBeenCalledWith(boom);
    });
});

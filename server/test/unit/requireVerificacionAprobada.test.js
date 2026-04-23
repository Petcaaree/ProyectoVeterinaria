import { jest } from "@jest/globals";

const findById = jest.fn();
jest.unstable_mockModule("../../vet/models/schemas/veterinariaSchema.js", () => ({
    VeterinariaModel: { findById },
}));

const { requireVerificacionAprobada } = await import(
    "../../vet/middlewares/requireVerificacionAprobada.js"
);

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

// Helper: la cadena real es findById(id).select('verificacion').
function mockVet(vet) {
    findById.mockReturnValue({ select: jest.fn().mockResolvedValue(vet) });
}

describe("requireVerificacionAprobada", () => {
    beforeEach(() => {
        findById.mockReset();
    });

    it("responde 401 si no hay req.usuario", async () => {
        const req = {};
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 404 si la veterinaria no existe", async () => {
        mockVet(null);
        const req = { usuario: { id: "507f1f77bcf86cd799439011" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 403 NO_INICIADA si la vet no tiene verificacion", async () => {
        mockVet({ verificacion: null });
        const req = { usuario: { id: "v1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "VERIFICACION_PENDIENTE", estadoActual: "NO_INICIADA" })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 403 si estado es PENDIENTE", async () => {
        mockVet({ verificacion: { estadoVerificacion: "PENDIENTE" } });
        const req = { usuario: { id: "v1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "VERIFICACION_PENDIENTE", estadoActual: "PENDIENTE" })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 403 si estado es RECHAZADO", async () => {
        mockVet({ verificacion: { estadoVerificacion: "RECHAZADO" } });
        const req = { usuario: { id: "v1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionAprobada(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ estadoActual: "RECHAZADO" })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("llama a next() si estado es VERIFICADO", async () => {
        mockVet({ verificacion: { estadoVerificacion: "VERIFICADO" } });
        const req = { usuario: { id: "v1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionAprobada(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("delega al errorHandler si findById lanza", async () => {
        const boom = new Error("DB down");
        findById.mockReturnValue({ select: jest.fn().mockRejectedValue(boom) });
        const req = { usuario: { id: "v1" } };
        const res = buildRes();
        const next = jest.fn();

        await requireVerificacionAprobada(req, res, next);

        expect(next).toHaveBeenCalledWith(boom);
    });
});

import { jest } from "@jest/globals";

// Necesario para decryptMP() que ahora valida el middleware.
process.env.MP_TOKEN_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const vetFindById = jest.fn();
const paseFindById = jest.fn();
const cuidFindById = jest.fn();

jest.unstable_mockModule("../../vet/models/schemas/veterinariaSchema.js", () => ({
    VeterinariaModel: { findById: vetFindById },
}));
jest.unstable_mockModule("../../vet/models/schemas/paseadorSchema.js", () => ({
    PaseadorModel: { findById: paseFindById },
}));
jest.unstable_mockModule("../../vet/models/schemas/cuidadorSchema.js", () => ({
    CuidadorModel: { findById: cuidFindById },
}));

const { encryptMP } = await import("../../vet/utils/cryptoMP.js");
const { requireMpConectado } = await import(
    "../../vet/middlewares/requireMpConectado.js"
);

function buildRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

// Cadena real: Model.findById(id).select("mpConectado +mpAccessToken")
function mockProveedor(findByIdFn, proveedor) {
    findByIdFn.mockReturnValue({ select: jest.fn().mockResolvedValue(proveedor) });
}

describe("requireMpConectado", () => {
    beforeEach(() => {
        vetFindById.mockReset();
        paseFindById.mockReset();
        cuidFindById.mockReset();
    });

    it("responde 401 si no hay req.usuario", async () => {
        const req = {};
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 401 si tipoUsuario no corresponde a un proveedor", async () => {
        const req = { usuario: { id: "u1", tipoUsuario: "cliente" } };
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 404 si el proveedor no existe", async () => {
        mockProveedor(vetFindById, null);
        const req = { usuario: { id: "v1", tipoUsuario: "veterinaria" } };
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 403 MP_NO_CONECTADO si mpConectado es false", async () => {
        mockProveedor(vetFindById, { mpConectado: false, mpAccessToken: null });
        const req = { usuario: { id: "v1", tipoUsuario: "veterinaria" } };
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "MP_NO_CONECTADO" })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 403 MP_NO_CONECTADO si mpAccessToken es null aunque mpConectado=true", async () => {
        mockProveedor(paseFindById, { mpConectado: true, mpAccessToken: null });
        const req = { usuario: { id: "p1", tipoUsuario: "paseador" } };
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "MP_NO_CONECTADO" })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("llama a next() si mpConectado=true y mpAccessToken es desencriptable", async () => {
        mockProveedor(cuidFindById, {
            mpConectado: true,
            mpAccessToken: encryptMP("APP_USR-valido"),
        });
        const req = { usuario: { id: "c1", tipoUsuario: "cuidador" } };
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("responde 403 MP_REAUTORIZACION_REQUERIDA si mpAccessToken no es desencriptable", async () => {
        mockProveedor(vetFindById, {
            mpConectado: true,
            mpAccessToken: "no-es-un-cipher-valido",
        });
        const req = { usuario: { id: "v1", tipoUsuario: "veterinaria" } };
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "MP_REAUTORIZACION_REQUERIDA" })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("delega al errorHandler si findById lanza", async () => {
        const boom = new Error("DB down");
        vetFindById.mockReturnValue({ select: jest.fn().mockRejectedValue(boom) });
        const req = { usuario: { id: "v1", tipoUsuario: "veterinaria" } };
        const res = buildRes();
        const next = jest.fn();

        await requireMpConectado(req, res, next);

        expect(next).toHaveBeenCalledWith(boom);
    });
});

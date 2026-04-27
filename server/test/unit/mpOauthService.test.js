import { jest } from "@jest/globals";

// Setup de envs requeridas para que getStateSecret() y requireMpAppCredentials() no exploten
// al importar/instanciar el service.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-suficientemente-largo";
process.env.MP_APP_ID = process.env.MP_APP_ID || "test-app-id";
process.env.MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET || "test-client-secret";
process.env.MP_TOKEN_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { encryptMP } = await import("../../vet/utils/cryptoMP.js");
const { MpOauthService } = await import("../../vet/services/mpOauthService.js");

// Helper: arma un mock del repo con un Model.findById().select() que resuelve a `proveedor`.
function buildRepo(proveedor) {
    const select = jest.fn().mockResolvedValue(proveedor);
    const findById = jest.fn().mockReturnValue({ select });
    return {
        model: { findById },
        // Fallback findById (no se usa en _findProveedorParaMp si Model.findById existe).
        findById: jest.fn().mockResolvedValue(proveedor),
    };
}

function buildService(proveedor) {
    return new MpOauthService({
        veterinariaRepository: buildRepo(proveedor),
        paseadorRepository: buildRepo(proveedor),
        cuidadorRepository: buildRepo(proveedor),
    });
}

describe("MpOauthService.getAccessTokenValido", () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it("lanza MP_NO_CONECTADO si el proveedor no vinculó MP", async () => {
        const proveedor = { mpConectado: false, mpAccessToken: null };
        const svc = buildService(proveedor);

        await expect(
            svc.getAccessTokenValido({ proveedorId: "p1", tipo: "veterinaria" })
        ).rejects.toMatchObject({ code: "MP_NO_CONECTADO" });
    });

    it("devuelve el token desencriptado si está vigente (sin refresh)", async () => {
        const tokenPlano = "APP_USR-test-vigente";
        const futuro = new Date(Date.now() + 10 * 60 * 1000); // +10 min
        const proveedor = {
            mpConectado: true,
            mpAccessToken: encryptMP(tokenPlano),
            mpRefreshToken: null,
            mpTokenExpiresAt: futuro,
            save: jest.fn().mockResolvedValue(undefined),
        };
        const svc = buildService(proveedor);

        const token = await svc.getAccessTokenValido({ proveedorId: "p1", tipo: "veterinaria" });
        expect(token).toBe(tokenPlano);
        // No tocó al proveedor: token vigente no necesita persistencia.
        expect(proveedor.save).not.toHaveBeenCalled();
    });

    it("refresca y persiste el nuevo token cuando está por expirar", async () => {
        const tokenViejo = "APP_USR-viejo";
        const tokenNuevo = "APP_USR-nuevo";
        const refreshTokenPlano = "TG-refresh-1";
        const proveedor = {
            mpConectado: true,
            mpAccessToken: encryptMP(tokenViejo),
            mpRefreshToken: encryptMP(refreshTokenPlano),
            mpTokenExpiresAt: new Date(Date.now() + 1000), // expira ya
            save: jest.fn().mockResolvedValue(undefined),
        };
        const svc = buildService(proveedor);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                access_token: tokenNuevo,
                refresh_token: "TG-refresh-2",
                expires_in: 3600,
            }),
        });

        const token = await svc.getAccessTokenValido({ proveedorId: "p1", tipo: "paseador" });
        expect(token).toBe(tokenNuevo);
        expect(proveedor.save).toHaveBeenCalled();
        // Persiste tokens nuevos encriptados (round-trip implícito: distintos del viejo).
        expect(proveedor.mpAccessToken).not.toBe(encryptMP(tokenViejo));
    });

    it("lanza MP_REAUTORIZACION_REQUERIDA y desconecta si está expirado y no hay refresh_token", async () => {
        const proveedor = {
            mpConectado: true,
            mpAccessToken: encryptMP("APP_USR-x"),
            mpRefreshToken: null,
            mpTokenExpiresAt: new Date(Date.now() - 1000),
            save: jest.fn().mockResolvedValue(undefined),
        };
        const svc = buildService(proveedor);

        await expect(
            svc.getAccessTokenValido({ proveedorId: "p1", tipo: "cuidador" })
        ).rejects.toMatchObject({ code: "MP_REAUTORIZACION_REQUERIDA" });

        expect(proveedor.mpConectado).toBe(false);
        expect(proveedor.mpAccessToken).toBeNull();
        expect(proveedor.mpUserId).toBeNull();
        expect(proveedor.mpConectadoAt).toBeNull();
        expect(proveedor.save).toHaveBeenCalled();
    });

    it("lanza MP_REAUTORIZACION_REQUERIDA y desconecta si MP rechaza el refresh", async () => {
        const proveedor = {
            mpConectado: true,
            mpAccessToken: encryptMP("APP_USR-x"),
            mpRefreshToken: encryptMP("TG-refresh-x"),
            mpTokenExpiresAt: new Date(Date.now() - 1000),
            save: jest.fn().mockResolvedValue(undefined),
        };
        const svc = buildService(proveedor);

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: "invalid_grant" }),
        });

        await expect(
            svc.getAccessTokenValido({ proveedorId: "p1", tipo: "veterinaria" })
        ).rejects.toMatchObject({ code: "MP_REAUTORIZACION_REQUERIDA" });

        expect(proveedor.mpConectado).toBe(false);
        expect(proveedor.mpAccessToken).toBeNull();
        expect(proveedor.save).toHaveBeenCalled();
    });

    it("fuerza reautorización si el access token vigente no se puede desencriptar", async () => {
        // Token corrupto: la rama "no expirado" intenta decryptMP y falla.
        const proveedor = {
            mpConectado: true,
            mpAccessToken: "iv-corrupto:tag-corrupto:data-corrupto",
            mpRefreshToken: null,
            mpTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
            save: jest.fn().mockResolvedValue(undefined),
        };
        const svc = buildService(proveedor);

        await expect(
            svc.getAccessTokenValido({ proveedorId: "p1", tipo: "veterinaria" })
        ).rejects.toMatchObject({ code: "MP_REAUTORIZACION_REQUERIDA" });

        expect(proveedor.mpConectado).toBe(false);
        expect(proveedor.save).toHaveBeenCalled();
    });
});

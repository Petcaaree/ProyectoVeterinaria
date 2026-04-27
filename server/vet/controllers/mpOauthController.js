export class MpOauthController {
    constructor(mpOauthService) {
        this.mpOauthService = mpOauthService;
    }

    // GET /petcare/proveedor/conectar-mp  (proveedor autenticado)
    // Devuelve { auth_url } para que el frontend redirija/abra una ventana.
    async conectar(req, res, next) {
        try {
            const proveedorId = req.usuario.id;
            const tipo = req.usuario.tipoUsuario;
            const auth_url = this.mpOauthService.generarAuthUrl({ proveedorId, tipo });
            res.json({ auth_url });
        } catch (error) {
            next(error);
        }
    }

    // GET /petcare/proveedor/callback-mp?code=...&state=...  (público — lo invoca MP)
    // Tras procesar, redirige al frontend con flag de éxito/error.
    async callback(req, res, next) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        try {
            const { code, state } = req.query;
            await this.mpOauthService.procesarCallback({ code, state });
            return res.redirect(`${frontendUrl}/?mp_connected=true`);
        } catch (error) {
            // Loguear pero no exponer detalles a MP/usuario; redirigir con flag de error.
            req.log?.error?.("Error en callback OAuth MP", { message: error.message });
            // Intentamos también con next por si hay errorHandler global, pero priorizamos UX.
            if (res.headersSent) return next(error);
            return res.redirect(`${frontendUrl}/?mp_connected=false&error=${encodeURIComponent(error.message)}`);
        }
    }

    // GET /petcare/proveedor/mp-status  (proveedor autenticado)
    async estado(req, res, next) {
        try {
            const proveedorId = req.usuario.id;
            const tipo = req.usuario.tipoUsuario;
            const estado = await this.mpOauthService.obtenerEstado({ proveedorId, tipo });
            res.json(estado);
        } catch (error) {
            next(error);
        }
    }

    // DELETE /petcare/proveedor/desconectar-mp  (proveedor autenticado)
    async desconectar(req, res, next) {
        try {
            const proveedorId = req.usuario.id;
            const tipo = req.usuario.tipoUsuario;
            const r = await this.mpOauthService.desconectar({ proveedorId, tipo });
            res.json(r);
        } catch (error) {
            next(error);
        }
    }
}

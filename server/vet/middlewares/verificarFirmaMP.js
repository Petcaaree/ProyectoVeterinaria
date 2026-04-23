import crypto from "crypto";
import logger from "../utils/logger.js";

// Template de firma de MP: id:<dataId>;request-id:<xRequestId>;ts:<ts>;
// Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#editor_5

// Ventana de tolerancia para el timestamp (mitigación de replay).
const TS_SKEW_MS = 5 * 60 * 1000;

function parseXSignature(header) {
  // Formato: "ts=1704908010,v1=abc123..."
  const parts = {};
  for (const segment of header.split(",")) {
    const [k, v] = segment.split("=").map((s) => s?.trim());
    if (k && v) parts[k] = v;
  }
  return { ts: parts.ts, v1: parts.v1 };
}

// No logueamos el valor completo de los headers: aunque v1 ya es un hash,
// evitar dejar rastros en logs reduce la superficie si alguien accede a ellos.
// Guardamos solo metadata suficiente para correlacionar eventos en diagnóstico.
function safeHeaderMeta(header) {
  if (typeof header !== "string") return null;
  const trimmed = header.trim();
  if (!trimmed) return null;
  return {
    present: true,
    length: trimmed.length,
    sha256: crypto.createHash("sha256").update(trimmed).digest("hex").slice(0, 12),
  };
}

function rechazar(req, res, motivo) {
  logger.warn("[webhook MP] firma rechazada", {
    motivo,
    ip: req.ip,
    xRequestIdMeta: safeHeaderMeta(req.headers["x-request-id"]),
    xSignatureMeta: safeHeaderMeta(req.headers["x-signature"]),
  });
  return res.status(403).json({ message: "Firma invalida" });
}

export function verificarFirmaMP(req, res, next) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("[webhook MP] MP_WEBHOOK_SECRET no configurado");
    return rechazar(req, res, "secret no configurado");
  }

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];
  if (!xSignature || !xRequestId) {
    return rechazar(req, res, "headers faltantes");
  }

  const { ts, v1 } = parseXSignature(xSignature);
  if (!ts || !v1) {
    return rechazar(req, res, "x-signature mal formado");
  }

  if (!/^\d+$/.test(ts)) {
    return rechazar(req, res, "ts no numérico");
  }
  // MP envía ts en milisegundos.
  const tsMs = Number(ts);
  if (Math.abs(Date.now() - tsMs) > TS_SKEW_MS) {
    return rechazar(req, res, "ts fuera de ventana (posible replay)");
  }

  // Alineado con PagoController.webhook: body.data.id (v2) o query.id (IPN legacy).
  const dataId = req.body?.data?.id || req.query?.id;
  if (!dataId) {
    return rechazar(req, res, "data.id faltante");
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const esperada = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  let firmasCoinciden = false;
  try {
    const a = Buffer.from(esperada, "hex");
    const b = Buffer.from(v1, "hex");
    firmasCoinciden = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    firmasCoinciden = false;
  }

  if (!firmasCoinciden) {
    return rechazar(req, res, "hash no coincide");
  }

  next();
}

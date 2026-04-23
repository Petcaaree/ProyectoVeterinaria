import crypto from "crypto";
import logger from "../utils/logger.js";

// Template de firma de MP: id:<dataId>;request-id:<xRequestId>;ts:<ts>;
// Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#editor_5

function parseXSignature(header) {
  // Formato: "ts=1704908010,v1=abc123..."
  const parts = {};
  for (const segment of header.split(",")) {
    const [k, v] = segment.split("=").map((s) => s?.trim());
    if (k && v) parts[k] = v;
  }
  return { ts: parts.ts, v1: parts.v1 };
}

function rechazar(req, res, motivo) {
  logger.warn("[webhook MP] firma rechazada", {
    motivo,
    ip: req.ip,
    xRequestId: req.headers["x-request-id"] || null,
    xSignature: req.headers["x-signature"] || null,
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

  const dataId = req.body?.data?.id || req.query?.id || req.query?.["data.id"];
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

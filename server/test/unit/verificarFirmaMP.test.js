import { jest } from "@jest/globals";
import crypto from "crypto";

// Mock del logger antes de importar el middleware
jest.unstable_mockModule("../../vet/utils/logger.js", () => ({
  default: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const { verificarFirmaMP } = await import("../../vet/middlewares/verificarFirmaMP.js");

const SECRET = "test_secret_xyz";

function firmaValida({ dataId, xRequestId, ts, secret = SECRET }) {
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
}

function buildReq({ headers = {}, body = {}, query = {}, ip = "::1" } = {}) {
  return { headers, body, query, ip };
}

function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("verificarFirmaMP", () => {
  const envOriginal = process.env.MP_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
  });

  afterAll(() => {
    if (envOriginal === undefined) delete process.env.MP_WEBHOOK_SECRET;
    else process.env.MP_WEBHOOK_SECRET = envOriginal;
  });

  it("responde 403 si falta el header x-signature", () => {
    const req = buildReq({
      headers: { "x-request-id": "req-1" },
      body: { data: { id: "123" } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 403 si falta el header x-request-id", () => {
    const req = buildReq({
      headers: { "x-signature": "ts=1,v1=abc" },
      body: { data: { id: "123" } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 403 si la firma es invalida", () => {
    const ts = String(Date.now());
    const req = buildReq({
      headers: {
        "x-signature": `ts=${ts},v1=deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef`,
        "x-request-id": "req-1",
      },
      body: { data: { id: "123" } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 403 si MP_WEBHOOK_SECRET no está configurado", () => {
    delete process.env.MP_WEBHOOK_SECRET;
    const req = buildReq({
      headers: { "x-signature": "ts=1,v1=abc", "x-request-id": "req-1" },
      body: { data: { id: "123" } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 403 si falta data.id (no puede reconstruir el manifest)", () => {
    const ts = String(Date.now());
    const req = buildReq({
      headers: {
        "x-signature": `ts=${ts},v1=${firmaValida({ dataId: "123", xRequestId: "req-1", ts })}`,
        "x-request-id": "req-1",
      },
      body: {},
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("llama a next() cuando la firma es válida", () => {
    const ts = String(Date.now());
    const dataId = "123456789";
    const xRequestId = "req-abc";
    const v1 = firmaValida({ dataId, xRequestId, ts });

    const req = buildReq({
      headers: {
        "x-signature": `ts=${ts},v1=${v1}`,
        "x-request-id": xRequestId,
      },
      body: { data: { id: dataId } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("acepta data.id desde query params (flujo IPN legacy)", () => {
    const ts = String(Date.now());
    const dataId = "987";
    const xRequestId = "req-legacy";
    const v1 = firmaValida({ dataId, xRequestId, ts });

    const req = buildReq({
      headers: {
        "x-signature": `ts=${ts},v1=${v1}`,
        "x-request-id": xRequestId,
      },
      query: { id: dataId, topic: "payment" },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("responde 403 si ts no es numérico", () => {
    const req = buildReq({
      headers: {
        "x-signature": "ts=abc,v1=deadbeef",
        "x-request-id": "req-1",
      },
      body: { data: { id: "123" } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 403 si el hash no coincide (ts dentro de ventana, v1 incorrecto)", () => {
    const ts = String(Date.now());
    const dataId = "123";
    const xRequestId = "req-1";
    const firmaCorrecta = firmaValida({ dataId, xRequestId, ts });
    // Alterar el último char para romper la igualdad manteniendo longitud/hex válido.
    const ultimoChar = firmaCorrecta.slice(-1);
    const charMutado = ultimoChar === "0" ? "1" : "0";
    const v1Falso = firmaCorrecta.slice(0, -1) + charMutado;

    const req = buildReq({
      headers: {
        "x-signature": `ts=${ts},v1=${v1Falso}`,
        "x-request-id": xRequestId,
      },
      body: { data: { id: dataId } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("acepta ts en segundos (Unix de 10 dígitos)", () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const dataId = "123";
    const xRequestId = "req-seg";
    const v1 = firmaValida({ dataId, xRequestId, ts });

    const req = buildReq({
      headers: {
        "x-signature": `ts=${ts},v1=${v1}`,
        "x-request-id": xRequestId,
      },
      body: { data: { id: dataId } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("responde 403 si ts está fuera de la ventana (posible replay)", () => {
    const tsViejo = String(Date.now() - 10 * 60 * 1000); // 10 min atrás
    const dataId = "123";
    const xRequestId = "req-1";
    const v1 = firmaValida({ dataId, xRequestId, ts: tsViejo });

    const req = buildReq({
      headers: {
        "x-signature": `ts=${tsViejo},v1=${v1}`,
        "x-request-id": xRequestId,
      },
      body: { data: { id: dataId } },
    });
    const res = buildRes();
    const next = jest.fn();

    verificarFirmaMP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("es resistente a firmas de longitud distinta (no lanza)", () => {
    const req = buildReq({
      headers: {
        "x-signature": "ts=1,v1=short",
        "x-request-id": "req-1",
      },
      body: { data: { id: "123" } },
    });
    const res = buildRes();
    const next = jest.fn();

    expect(() => verificarFirmaMP(req, res, next)).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

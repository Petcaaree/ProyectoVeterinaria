/**
 * Crea una instancia de Express configurada para tests de integración.
 * No conecta a MongoDB real — los tests deben mockear los servicios.
 */
import express from 'express';
import { Server } from '../../server.js';
import { errorHandler } from '../../vet/middlewares/errorHandler.js';
import clienteRoutes from '../../vet/routes/clienteRoutes.js';
import { ClienteController } from '../../vet/controllers/clienteController.js';

/**
 * Crea una app Express de test con un ClienteController inyectado.
 * @param {object} clienteService - Mock del servicio
 * @param {object} [reservaService] - Mock del servicio de reservas (opcional)
 * @returns {import('express').Express}
 */
export function crearTestApp(clienteService, reservaService = {}) {
    const app = express();
    const server = new Server(app, 0);

    const clienteController = new ClienteController(clienteService, reservaService);
    server.setController(ClienteController, clienteController);

    server.addRoute(clienteRoutes);
    server.configureRoutes();

    app.use(errorHandler);

    return app;
}

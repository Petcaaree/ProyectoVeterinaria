import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from 'cors';
import { Server } from "./server.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import routes from "./birbnb/routes/routes.js";

import { CiudadRepository } from "./birbnb/models/repositories/ciudadRepository.js";
import { PaisRepository } from "./birbnb/models/repositories/paisRepository.js";
import { CiudadService } from "./birbnb/services/ciudadService.js";
import { CiudadController } from "./birbnb/controllers/ciudadController.js";

import { AlojamientoRepository } from "./birbnb/models/repositories/alojamientoRepository.js";
import { AnfitrionRepository } from "./birbnb/models/repositories/anfitrionRepository.js";
import { HuespedRepository } from "./birbnb/models/repositories/huespedRepository.js";
import { ReservaRepository } from "./birbnb/models/repositories/reservaRepository.js";

import { AlojamientoService } from "./birbnb/services/alojamientoService.js";
import { AnfitrionService } from "./birbnb/services/anfitrionService.js";
import { HuespedService } from "./birbnb/services/huespedService.js";
import { ReservaService } from "./birbnb/services/reservaService.js";

import { AlojamientoController } from "./birbnb/controllers/alojamientoController.js";
import { AnfitrionController } from "./birbnb/controllers/anfitrionController.js";
import { HuespedController } from "./birbnb/controllers/huespedController.js";
import { ReservaController } from "./birbnb/controllers/reservaController.js";

import { MongoDBClient } from "./birbnb/config/database.js";
import { errorHandler } from "./birbnb/middlewares/errorHandler.js";

// Configuración de dependencias
const paisRepo = new PaisRepository();
const ciudadRepo = new CiudadRepository();
const ciudadService = new CiudadService(ciudadRepo, paisRepo);
const ciudadController = new CiudadController(ciudadService);

const reservaRepo = new ReservaRepository();
const anfitrionRepo = new AnfitrionRepository();
const huespedRepo = new HuespedRepository();
const alojamientoRepo = new AlojamientoRepository();

const reservaService = new ReservaService(reservaRepo, alojamientoRepo, huespedRepo, anfitrionRepo);
const anfitrionService = new AnfitrionService(anfitrionRepo);
const huespedService = new HuespedService(huespedRepo);
const alojamientoService = new AlojamientoService(alojamientoRepo, anfitrionRepo, ciudadRepo, paisRepo);

const reservaController = new ReservaController(reservaService);
const anfitrionController = new AnfitrionController(anfitrionService, reservaService);
const huespedController = new HuespedController(huespedService, reservaService);
const alojamientoController = new AlojamientoController(alojamientoService);

const app = express();
app.use(cors({
    origin: "https://birbnb.vercel.app"
}))
const port = process.env.PORT || 3000;
const server = new Server(app, port);

MongoDBClient.connect();

// Registro del controlador en el servidor
server.setController(CiudadController, ciudadController);
server.setController(ReservaController, reservaController);
server.setController(AnfitrionController, anfitrionController);
server.setController(HuespedController, huespedController);
server.setController(AlojamientoController, alojamientoController);

// Configuración de rutas y lanzamiento
routes.forEach(r => {
    server.addRoute(r);
})
server.configureRoutes();

const swaggerDocument = YAML.load("../docs/swagger.yaml")

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(errorHandler)

server.launch();
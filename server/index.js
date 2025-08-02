import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from 'cors';
import { Server } from "./server.js";

// import swaggerUi from "swagger-ui-express";
// import YAML from "yamljs";

import routes from "./vet/routes/routes.js";

import { CiudadRepository } from "./vet/models/repositories/ciudadRepository.js";
import { LocalidadRepository } from "./vet/models/repositories/localidadRepository.js";
import { CiudadService } from "./vet/services/ciudadService.js";
//import { CiudadController } from "./vet/controllers/ciudadController.js";

import { ServicioVeterinariaRepository } from "./vet/models/repositories/servicioVeterinariaRepository.js";
import { ServicioPaseadorRepository } from "./vet/models/repositories/servicioPaseadorRepository.js";
import { ServicioCuidadorRepository } from "./vet/models/repositories/servicioCuidadorRepository.js";

import { CuidadorRepository } from "./vet/models/repositories/cuidadorRepository.js";
import { PaseadorRepository } from "./vet/models/repositories/paseadorRepository.js";
import { VeterinariaRepository } from "./vet/models/repositories/veterinariaRepository.js";
import { ClienteRepository } from "./vet/models/repositories/clienteRepository.js";
import { ReservaRepository } from "./vet/models/repositories/reservaRepository.js";

/* 
*/
import { PaseadorService } from "./vet/services/paseadorService.js";
import { VeterinariaService } from "./vet/services/veterinariaService.js"; 
import { ClienteService } from "./vet/services/clienteService.js";
import { CuidadorService } from "./vet/services/cuidadorService.js";
import { ServicioVeterinariaService } from "./vet/services/servicioVeterinariaService.js";
import { ServicioCuidadorService } from "./vet/services/servicioCuidadorService.js";
import { ServicioPaseadorService } from "./vet/services/servicioPaseadorService.js";
import { ReservaService } from "./vet/services/reservaService.js";

/* 
*/
import { PaseadorController } from "./vet/controllers/paseadorController.js";
import { VeterinariaController } from "./vet/controllers/veterinariaController.js"; 
import { CuidadorController } from "./vet/controllers/cuidadorController.js";   
import { ClienteController } from "./vet/controllers/clienteController.js";
import { ServicioVeterinariaController } from "./vet/controllers/servicioVeterinariaController.js";
import { ServicioCuidadorController } from "./vet/controllers/servicioCuidadorController.js";
import { ServicioPaseadorController } from "./vet/controllers/servicioPaseadorController.js";
import { ReservaController } from "./vet/controllers/reservaController.js";

import { MongoDBClient } from "./vet/config/database.js";
import { errorHandler } from "./vet/middlewares/errorHandler.js";


 const clienteRepo = new ClienteRepository();
const ciudadRepo = new CiudadRepository();
const localidadRepo = new LocalidadRepository();
const servicioVeterinariaRepo = new ServicioVeterinariaRepository();
const servicioPaseadorRepo = new ServicioPaseadorRepository();
const servicioCuidadorRepo = new ServicioCuidadorRepository();  
const cuidadorRepo = new CuidadorRepository();
const paseadorRepo = new PaseadorRepository();
const veterinariaRepo = new VeterinariaRepository();
const reservaRepo = new ReservaRepository();

const clienteService = new ClienteService(clienteRepo, ciudadRepo, localidadRepo);
const cuidadorService = new CuidadorService(cuidadorRepo, ciudadRepo, localidadRepo);
const paseadorService = new PaseadorService(paseadorRepo, ciudadRepo, localidadRepo);
const veterinariaService = new VeterinariaService(veterinariaRepo, ciudadRepo, localidadRepo);
const servicioVeterinariaService = new ServicioVeterinariaService(servicioVeterinariaRepo, veterinariaRepo, ciudadRepo, localidadRepo, reservaRepo);
const servicioCuidadorService = new ServicioCuidadorService(servicioCuidadorRepo, cuidadorRepo, ciudadRepo, localidadRepo, reservaRepo);
const servicioPaseadorService = new ServicioPaseadorService(servicioPaseadorRepo, paseadorRepo, ciudadRepo, localidadRepo, reservaRepo);
const reservaService = new ReservaService(reservaRepo, servicioVeterinariaRepo, servicioCuidadorRepo, servicioPaseadorRepo,clienteRepo, cuidadorRepo, paseadorRepo, veterinariaRepo);

const clienteController = new ClienteController(clienteService, reservaService);
const cuidadorController = new CuidadorController(cuidadorService, reservaService);
const paseadorController = new PaseadorController(paseadorService, reservaService);
const veterinariaController = new VeterinariaController(veterinariaService, reservaService);
const servicioVeterinariaController = new ServicioVeterinariaController(servicioVeterinariaService);
const servicioCuidadorController = new ServicioCuidadorController(servicioCuidadorService);
const servicioPaseadorController = new ServicioPaseadorController(servicioPaseadorService);
const reservaController = new ReservaController(reservaService);



/*

const ciudadService = new CiudadService(ciudadRepo, localidadRepo);


const clienteController = new ClienteController(clienteService, reservaService);
const ciudadController = new CiudadController(ciudadService);

 */




const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://birbnb.vercel.app"],
    credentials: true
}))

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    if (Object.keys(req.query).length > 0) {
        console.log("📋 Query params:", req.query);
    }
    next();
});

const port = process.env.PORT || 3000;
const server = new Server(app, port);

MongoDBClient.connect();

// Registro del controlador en el servidor
server.setController(ClienteController, clienteController);
server.setController(CuidadorController, cuidadorController);
server.setController(PaseadorController, paseadorController);
server.setController(VeterinariaController, veterinariaController);
server.setController(ServicioVeterinariaController, servicioVeterinariaController);
server.setController(ServicioCuidadorController, servicioCuidadorController);
server.setController(ServicioPaseadorController, servicioPaseadorController);
server.setController(ReservaController, reservaController);

/* server.setController(CiudadController, ciudadController);


server.setController(ReservaController, reservaController); */

// Configuración de rutas y lanzamiento
routes.forEach(r => {
    server.addRoute(r);
})
server.configureRoutes();

// const swaggerDocument = YAML.load("../docs/swagger.yaml")
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(errorHandler)

server.launch();
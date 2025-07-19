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

/* import { ServicioVeterinariaService } from "./vet/services/servicioVeterinariaService.js";
import { ServicioPaseadorService } from "./vet/services/servicioPaseadorService.js";
import { ServicioCuidadorService } from "./vet/services/servicioCuidadorService.js";*/
import { PaseadorService } from "./vet/services/paseadorService.js";
import { VeterinariaService } from "./vet/services/veterinariaService.js"; 
import { ClienteService } from "./vet/services/clienteService.js";
import { CuidadorService } from "./vet/services/cuidadorService.js";

//import { ReservaService } from "./vet/services/reservaService.js";

/* import { ServicioVeterinariaController } from "./vet/controllers/servicioVeterinariaController.js";
import { ServicioPaseadorController } from "./vet/controllers/servicioPaseadorController.js";
import { ServicioCuidadorController } from "./vet/controllers/servicioCuidadorController.js";*/
import { PaseadorController } from "./vet/controllers/paseadorController.js";
import { VeterinariaController } from "./vet/controllers/veterinariaController.js"; 
import { CuidadorController } from "./vet/controllers/cuidadorController.js";   
import { ClienteController } from "./vet/controllers/clienteController.js";
//import { ReservaController } from "./vet/controllers/reservaController.js";

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

const clienteService = new ClienteService(clienteRepo, localidadRepo, ciudadRepo);
const cuidadorService = new CuidadorService(cuidadorRepo, localidadRepo, ciudadRepo);
const paseadorService = new PaseadorService(paseadorRepo, localidadRepo, ciudadRepo);
const veterinariaService = new VeterinariaService(veterinariaRepo, localidadRepo, ciudadRepo);



const clienteController = new ClienteController(clienteService);
const cuidadorController = new CuidadorController(cuidadorService);
const paseadorController = new PaseadorController(paseadorService);
const veterinariaController = new VeterinariaController(veterinariaService);


/*

const ciudadService = new CiudadService(ciudadRepo, localidadRepo);
const servicioVeterinariaService = new ServicioVeterinariaService(servicioVeterinariaRepo);
const servicioPaseadorService = new ServicioPaseadorService(servicioPaseadorRepo);
const servicioCuidadorService = new ServicioCuidadorService(servicioCuidadorRepo);
const cuidadorService = new CuidadorService(cuidadorRepo);
const paseadorService = new PaseadorService(paseadorRepo);
const veterinariaService = new VeterinariaService(veterinariaRepo);
const reservaService = new ReservaService(reservaRepo, clienteRepo, cuidadorRepo, paseadorRepo, veterinariaRepo, servicioCuidadorRepo, servicioPaseadorRepo, servicioVeterinariaRepo);

const clienteController = new ClienteController(clienteService, reservaService);
const ciudadController = new CiudadController(ciudadService);
const servicioVeterinariaController = new ServicioVeterinariaController(servicioVeterinariaService);
const servicioPaseadorController = new ServicioPaseadorController(servicioPaseadorService);
const servicioCuidadorController = new ServicioCuidadorController(servicioCuidadorService);
const cuidadorController = new CuidadorController(cuidadorService);
const paseadorController = new PaseadorController(paseadorService);
const veterinariaController = new VeterinariaController(veterinariaService);
const reservaController = new ReservaController(reservaService); */


/* const reservaRepo = new ReservaRepository();
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
const alojamientoController = new AlojamientoController(alojamientoService);  */

const app = express();
app.use(cors({
    origin: "https://birbnb.vercel.app"
}))
const port = process.env.PORT || 3000;
const server = new Server(app, port);

MongoDBClient.connect();

// Registro del controlador en el servidor
server.setController(ClienteController, clienteController);
server.setController(CuidadorController, cuidadorController);
server.setController(PaseadorController, paseadorController);
server.setController(VeterinariaController, veterinariaController);

/* server.setController(CiudadController, ciudadController);
server.setController(ServicioVeterinariaController, servicioVeterinariaController);
server.setController(ServicioPaseadorController, servicioPaseadorController);
server.setController(ServicioCuidadorController, servicioCuidadorController);
server.setController(CuidadorController, cuidadorController);
server.setController(PaseadorController, paseadorController);
server.setController(VeterinariaController, veterinariaController);
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
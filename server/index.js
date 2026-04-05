import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from 'cors';
import helmet from 'helmet';
// express-mongo-sanitize es incompatible con Express 5 (req.query es read-only)
// Usamos sanitización manual del body
import logger from './vet/utils/logger.js';
import { generalLimiter, authLimiter } from "./vet/middlewares/rateLimitMiddleware.js";
import { Server } from "./server.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import mongoose from "mongoose";
import authRoutes from "./vet/routes/authRoutes.js";

import routes from "./vet/routes/routes.js";
import recordatorioRoutes from "./vet/routes/recordatorioRoutes.js";

import { CiudadRepository } from "./vet/models/repositories/ciudadRepository.js";
import { LocalidadRepository } from "./vet/models/repositories/localidadRepository.js";
import { CiudadController } from "./vet/controllers/ciudadController.js";

import { ServicioVeterinariaRepository } from "./vet/models/repositories/servicioVeterinariaRepository.js";
import { ServicioPaseadorRepository } from "./vet/models/repositories/servicioPaseadorRepository.js";
import { ServicioCuidadorRepository } from "./vet/models/repositories/servicioCuidadorRepository.js";

import { CuidadorRepository } from "./vet/models/repositories/cuidadorRepository.js";
import { PaseadorRepository } from "./vet/models/repositories/paseadorRepository.js";
import { VeterinariaRepository } from "./vet/models/repositories/veterinariaRepository.js";
import { ClienteRepository } from "./vet/models/repositories/clienteRepository.js";
import { ReservaRepository } from "./vet/models/repositories/reservaRepository.js";
import { PagoRepository } from "./vet/models/repositories/pagoRepository.js";

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
import { PagoService } from "./vet/services/pagoService.js";
import { CiudadService } from "./vet/services/ciudadService.js";
import { RecordatorioService } from "./vet/services/recordatorioService.js";

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
import { PagoController } from "./vet/controllers/pagoController.js";

import { AdminRepository } from "./vet/models/repositories/adminRepository.js";
import { ConfiguracionRepository } from "./vet/models/repositories/configuracionRepository.js";
import { AdminService } from "./vet/services/adminService.js";
import { AdminDashboardService } from "./vet/services/adminDashboardService.js";
import { AdminController } from "./vet/controllers/adminController.js";

import { MongoDBClient } from "./vet/config/database.js";
import { errorHandler } from "./vet/middlewares/errorHandler.js";

 const clienteRepo = new ClienteRepository();
const pagoRepo = new PagoRepository();
const ciudadRepo = new CiudadRepository();
const localidadRepo = new LocalidadRepository();
const servicioVeterinariaRepo = new ServicioVeterinariaRepository();
const servicioPaseadorRepo = new ServicioPaseadorRepository();
const servicioCuidadorRepo = new ServicioCuidadorRepository();  
const cuidadorRepo = new CuidadorRepository();
const paseadorRepo = new PaseadorRepository();
const veterinariaRepo = new VeterinariaRepository();
const reservaRepo = new ReservaRepository();

const clienteService = new ClienteService(clienteRepo, ciudadRepo, localidadRepo, reservaRepo);
const cuidadorService = new CuidadorService(cuidadorRepo, ciudadRepo, localidadRepo);
const paseadorService = new PaseadorService(paseadorRepo, ciudadRepo, localidadRepo);
const veterinariaService = new VeterinariaService(veterinariaRepo, ciudadRepo, localidadRepo);
const servicioVeterinariaService = new ServicioVeterinariaService(servicioVeterinariaRepo, veterinariaRepo, ciudadRepo, localidadRepo, reservaRepo);
const servicioCuidadorService = new ServicioCuidadorService(servicioCuidadorRepo, cuidadorRepo, ciudadRepo, localidadRepo, reservaRepo);
const servicioPaseadorService = new ServicioPaseadorService(servicioPaseadorRepo, paseadorRepo, ciudadRepo, localidadRepo, reservaRepo);
const reservaService = new ReservaService(reservaRepo, servicioVeterinariaRepo, servicioCuidadorRepo, servicioPaseadorRepo,clienteRepo, cuidadorRepo, paseadorRepo, veterinariaRepo);
const pagoService = new PagoService(reservaService, pagoRepo);
const ciudadService = new CiudadService(ciudadRepo, localidadRepo);

// Inicializar servicio de recordatorios
const recordatorioService = new RecordatorioService(reservaRepo, clienteRepo, cuidadorRepo, paseadorRepo, veterinariaRepo);

// Hacer el servicio disponible en el contexto de la aplicación
//app.set('recordatorioService', recordatorioService);

const adminRepo = new AdminRepository();
const configuracionRepo = new ConfiguracionRepository();
const adminService = new AdminService(adminRepo);
const adminDashboardService = new AdminDashboardService(
    clienteRepo, veterinariaRepo, paseadorRepo, cuidadorRepo,
    reservaRepo, pagoRepo,
    servicioVeterinariaRepo, servicioPaseadorRepo, servicioCuidadorRepo,
    configuracionRepo
);

const clienteController = new ClienteController(clienteService, reservaService);
const cuidadorController = new CuidadorController(cuidadorService, reservaService);
const paseadorController = new PaseadorController(paseadorService, reservaService);
const veterinariaController = new VeterinariaController(veterinariaService, reservaService);
const servicioVeterinariaController = new ServicioVeterinariaController(servicioVeterinariaService);
const servicioCuidadorController = new ServicioCuidadorController(servicioCuidadorService);
const servicioPaseadorController = new ServicioPaseadorController(servicioPaseadorService);
const reservaController = new ReservaController(reservaService, pagoService);
const pagoController = new PagoController(pagoService, reservaService);
const ciudadController = new CiudadController(ciudadService);
const adminController = new AdminController(adminService, adminDashboardService);

const app = express();

// CORS debe ir ANTES de helmet para que los headers de preflight se envíen correctamente
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
    origin: (origin, callback) => {
        // Permitir requests sin origin (Postman, curl, apps móviles)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin no permitido → ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Responder preflight OPTIONS en todas las rutas (Express 5 syntax)
app.options('/{*path}', cors(corsOptions));
app.use(cors(corsOptions));

// Seguridad: headers HTTP seguros (después de CORS para no interferir)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Sanitización: elimina operadores $ y . de MongoDB en req.body para prevenir NoSQL injection
// (express-mongo-sanitize no es compatible con Express 5 porque req.query es read-only)
function sanitize(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            sanitize(obj[key]);
        }
    }
    return obj;
}
app.use((req, _res, next) => {
    if (req.body) sanitize(req.body);
    next();
});

// Rate limiting general: 100 req / 15min por IP
app.use('/petcare', generalLimiter);

// Rate limiting estricto en rutas de autenticacion: 10 intentos / 15min por IP
app.use('/petcare/login', authLimiter);
app.use('/petcare/signin', authLimiter);
app.use('/petcare/auth/forgot-password', authLimiter);

// Middleware de logging estructurado para todas las peticiones
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });
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
server.setController(PagoController, pagoController);
server.setController(CiudadController, ciudadController);
server.setController(AdminController, adminController);

// Configuración de rutas y lanzamiento
routes.forEach(r => {
    server.addRoute(r);
})

// Agregar rutas de recordatorios
app.use('/api/recordatorios', recordatorioRoutes);

server.configureRoutes();

// Rutas de autenticación (refresh token, logout)
app.use(authRoutes);

// Swagger API docs
const swaggerDocument = YAML.load("../docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'PetCare API Docs',
    customCss: '.swagger-ui .topbar { display: none }'
}));

// Health check endpoint (D5)
const startTime = Date.now();
app.get('/health', (req, res) => {
    const mongoState = mongoose.connection.readyState;
    const mongoStatus = mongoState === 1 ? 'connected' : 'disconnected';
    const mem = process.memoryUsage();

    res.status(mongoState === 1 ? 200 : 503).json({
        status: mongoState === 1 ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        mongodb: mongoStatus,
        memory: {
            rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`
        }
    });
});

app.use(errorHandler)

// Iniciar el servicio de recordatorios después de configurar todo
recordatorioService.iniciar();

server.launch();
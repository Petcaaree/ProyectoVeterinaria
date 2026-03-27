import mongoose from "mongoose";
import logger from "../utils/logger.js";

export class MongoDBClient {
    static async connect() {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            logger.error('MONGODB_URI no está definida en las variables de entorno.');
            process.exit(1);
        }
        try {
            const conn = await mongoose.connect(uri);
            logger.info(`MongoDB conectado: ${conn.connection.host}`);
            logger.info(`Base de datos: ${conn.connection.name}`);

        } catch (error) {
            logger.error(`Error de conexión MongoDB: ${error.message}`);
            process.exit(1);
        }
    }
}
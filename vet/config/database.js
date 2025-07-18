import mongoose from "mongoose";

export class MongoDBClient {
    static async connect() {
        try {
            const conn = await mongoose.connect("mongodb://localhost:27017/vet");
            console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
            console.log(`📦 Base de datos usada: ${conn.connection.name}`);

        } catch (error) {
            console.error(`❌ Error de conexión: ${error.message}`);
            process.exit(1);
        }
    }
}
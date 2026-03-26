import mongoose from "mongoose";

export class MongoDBClient {
    static async connect() {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI no está definida en las variables de entorno.');
            process.exit(1);
        }
        try {
            const conn = await mongoose.connect(uri);
            console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
            console.log(`📦 Base de datos usada: ${conn.connection.name}`);

        } catch (error) {
            console.error(`❌ Error de conexión: ${error.message}`);
            process.exit(1);
        }
    }
}
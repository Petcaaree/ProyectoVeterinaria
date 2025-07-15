import mongoose from "mongoose";

export class MongoDBClient {
    static async connect() {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        } catch (error) {
            console.error(`❌ Error de conexión: ${error.message}`);
            process.exit(1);
        }
    }
}
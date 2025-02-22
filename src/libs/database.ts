import mongoose from "mongoose";


export const connectMongoDB = async () => {
    try {
        // Verificamos que MONGODB_URI esté definido
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URI no está definido en las variables de entorno");
        }

        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
};
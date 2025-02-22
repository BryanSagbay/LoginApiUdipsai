import mongoose from "mongoose";


const MONGO_URL = "mongodb://127.0.0.1/udipsai";

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
};

import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URL;

  if (!mongoURI) {
    throw new Error(
      "La variable MONGO_URL no está configurada"
    );
  }

  await mongoose.connect(mongoURI);

  console.log("MongoDB conectado correctamente");
};
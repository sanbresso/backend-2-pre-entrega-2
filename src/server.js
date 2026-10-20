import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 8080;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Servidor activo en http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Error al iniciar el servidor:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
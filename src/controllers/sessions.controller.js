import { registerUser as registerUserService } from "../services/sessions.service.js";

export function getSessionsInfo(req, res) {
  return res.status(200).json({
    status: "success",
    message: "Módulo de sesiones preparado"
  });
}

export const registerUser = async (req, res) => {
  try {
    const newUser = await registerUserService(req.body);

    return res.status(201).json({
      status: "success",
      payload: newUser
    });

  } catch (error) {
    const statusCode = error.code === 11000
      ? 409
      : error.statusCode || 500;

    const message = error.code === 11000
      ? "El email ya está registrado"
      : statusCode === 500
        ? "Error interno del servidor"
        : error.message;

    if (statusCode === 500) {
      console.error("Error al registrar usuario:", error);
    }

    return res.status(statusCode).json({
      status: "error",
      message
    });
  }
};
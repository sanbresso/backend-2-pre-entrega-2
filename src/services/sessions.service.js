import {
  getUserByEmail,
  saveUser
} from "../repositories/users.repository.js";

import { hashPassword } from "../utils/hash.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const registerUser = async (userData = {}) => {
  const {
    first_name,
    last_name,
    email,
    password
  } = userData ?? {};

  const requiredFields = [
    first_name,
    last_name,
    email,
    password
  ];

  if (
    requiredFields.some(
      field =>
        typeof field !== "string" ||
        !field.trim()
    )
  ) {
    throw createHttpError(
      400,
      "Faltan campos obligatorios"
    );
  }

  if (password.length < 8) {
    throw createHttpError(
      400,
      "La contraseña debe tener al menos 8 caracteres"
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw createHttpError(
      400,
      "Formato de email inválido"
    );
  }

  const existingUser = await getUserByEmail(
    normalizedEmail
  );

  if (existingUser) {
    throw createHttpError(
      409,
      "El email ya está registrado"
    );
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await saveUser({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user"
  });

  return {
    id: newUser._id.toString(),
    first_name: newUser.first_name,
    last_name: newUser.last_name,
    email: newUser.email,
    role: newUser.role
  };
};
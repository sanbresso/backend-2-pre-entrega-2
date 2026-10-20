import {
  findByEmail,
  createUser
} from "../dao/users.dao.js";

export const getUserByEmail = async (email) => {
  return await findByEmail(email);
};

export const saveUser = async (userData) => {
  return await createUser(userData);
};
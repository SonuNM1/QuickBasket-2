import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { executeQuery } from "./DBUtils.js";

const genertedRefreshToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    { expiresIn: "7d" }
  );

  const updateResults = await executeQuery(
    "UPDATE users SET refresh_token = ? WHERE id = ?",
    [token, userId]
  );
  //   console.log(updateResults);

  return token;
};

export default genertedRefreshToken;

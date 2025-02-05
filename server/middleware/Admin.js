import UserModel from "../models/user.model.js";
import { executeQuery } from "../utils/DBUtils.js";

export const admin = async (request, response, next) => {
  try {
    const userId = request.userId;

    //    const user = await UserModel.findById(userId)
    var user = await executeQuery("Select * from users where id=?", [userId]);
    user = user[0];

    if (user.role !== "ADMIN") {
      return response.status(400).json({
        message: "Permission denial",
        error: true,
        success: false,
      });
    }

    next();
  } catch (error) {
    return response.status(500).json({
      message: "Permission denial",
      error: true,
      success: false,
    });
  }
};

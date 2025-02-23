import { Router } from "express";
import { addRating, getRating } from "../controllers/rating.controller.js";
import auth from "../middleware/auth.js";

const ratingRouter = Router();

ratingRouter.post("/add", auth, addRating);
ratingRouter.post("/get", auth, getRating);

export default ratingRouter;

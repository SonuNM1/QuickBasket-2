import { Router } from "express";
import { addRating, deleteRating, editRating, getAllRating, getAverageRating, getRating } from "../controllers/rating.controller.js";
import auth from "../middleware/auth.js";

const ratingRouter = Router();

ratingRouter.post("/add", auth, addRating);
ratingRouter.post("/get", auth, getRating);
ratingRouter.post('/getAll', getAllRating) ; 
ratingRouter.post('/edit', editRating) ; 
ratingRouter.post('/delete', deleteRating) ; 
ratingRouter.post('/average', getAverageRating) ; 

export default ratingRouter;

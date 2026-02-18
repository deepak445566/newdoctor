import express from "express";
import { loginUser, logout, registerUser } from "../controllers/authControllers.js";




const UserRouter = express.Router();

UserRouter.post("/register",registerUser)
UserRouter.post("/login", loginUser)
UserRouter.post("/logout",logout)
export default UserRouter;

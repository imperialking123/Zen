import express from "express";
import ProtectRoute from "../middleware/protectUser.js";
import {
  checkUser,
  handleCheckUsername,
  handleLogin,
  handleLogout,
  handlePreload,
  handleSignup,
} from "../controller/userController.js";

const userRoute = express.Router();

userRoute.post("/signup", handleSignup);
userRoute.post("/login", handleLogin);
userRoute.post("/logout", handleLogout);
userRoute.get("/check", ProtectRoute, checkUser);
userRoute.post("/username/check", handleCheckUsername);
userRoute.get("/preload", ProtectRoute, handlePreload);

export default userRoute;

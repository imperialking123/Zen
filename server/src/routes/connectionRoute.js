import { Router } from "express";
import {
  handleAcceptConnectionPing,
  handleDeleteConnection,
  handleDeleteSentPendingPing,
  handleIgnoreConnectionPing,
  handleNewConnectionPing,
} from "../controller/connectionController.js";
import ProtectRoute from "../middleware/protectUser.js";

const connectionRoute = Router();

connectionRoute.post("/new/ping", ProtectRoute, handleNewConnectionPing);

connectionRoute.post("/accept/ping", ProtectRoute, handleAcceptConnectionPing);

connectionRoute.delete(
  "/pending/ping",
  ProtectRoute,
  handleDeleteSentPendingPing,
);

connectionRoute.patch("/ignore/ping", ProtectRoute, handleIgnoreConnectionPing);

connectionRoute.delete("/connected/:documentId", ProtectRoute, handleDeleteConnection);

export default connectionRoute;

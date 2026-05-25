import { Router } from "express";
import ProtectRoute from "../middleware/protectUser.js";
import {
  handleCreateBulkConversation,
  handleCreateNewConversation,
  handleGetConversation,
} from "../controller/conversationController.js";

const conversationRoute = Router();

conversationRoute.get(
  "/get/:conversationId",
  ProtectRoute,
  handleGetConversation,
);
conversationRoute.post("/create", ProtectRoute, handleCreateNewConversation);
conversationRoute.post(
  "/create/bulk",
  ProtectRoute,
  handleCreateBulkConversation,
);

export default conversationRoute;

import express from "express";
import {
  addComment,
  getMyNotifications,
  getComments,
} from "../controller/notificationController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/", isAuthenticated, getMyNotifications);
notificationRouter.post("/comment", isAuthenticated, addComment);
notificationRouter.get("/order/:orderId/comments", isAuthenticated, getComments);

export default notificationRouter;

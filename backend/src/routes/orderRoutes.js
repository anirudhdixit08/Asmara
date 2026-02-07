import express from "express";
import {
  createOrder,
  getOrderDetails,
  updateTna,
  updateFabric,
  updateTechpack,
  updateCosting,
  updateOrderStatus,
  getAllOrders,
  searchOrderByStyle,
} from "../controller/orderController.js";
import { isAuthenticated, isAuthorised } from "../middleware/authMiddleware.js"; // Based on your auth logic
import upload from "../middleware/multerMiddleware.js";

const orderRouter = express.Router();

orderRouter.post(
  "/create",
  isAuthorised,
  upload.fields([
    { name: "techpack", maxCount: 1 }, // The PDF/ZIP Techpack
    { name: "previewPhoto", maxCount: 1 }, // The Style Image
  ]),
  createOrder,
);

orderRouter.get("/details/:orderId", isAuthenticated, getOrderDetails);

orderRouter.patch("/update-status/:orderId", isAuthenticated, updateOrderStatus);

orderRouter.patch(
  "/update-tna/:tnaId",
  isAuthorised,
  upload.single("fabricSketch"),
  updateTna,
);

orderRouter.get("/search", isAuthenticated, searchOrderByStyle);

orderRouter.patch(
  "/update-fabric/:fabricId",
  isAuthorised,
  // isAuthorised("asmara"),
  upload.single("fabricSketch"), // Matches the field in your Fabric model
  updateFabric,
);

orderRouter.patch(
  "/update-techpack/:techpackId",
  isAuthorised,
  upload.fields([
    { name: "techpackFile", maxCount: 1 }, // The actual PDF/ZIP
    { name: "fabricSketch", maxCount: 1 }, // The drawing for the dashboard
  ]),
  updateTechpack,
);

orderRouter.patch(
  "/update-costing/:costingId",
  isAuthenticated,
  upload.fields([
    { name: "costingSheet", maxCount: 1 }, // PDF/ZIP
    { name: "fabricSketch", maxCount: 1 }, // Technical Sketch
  ]),
  updateCosting,
);

orderRouter.get("/all", isAuthenticated, getAllOrders);

export default orderRouter;

import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import TNA from "../models/tnaModel.js";
import Fabric from "../models/fabricModel.js";
import TechpackIteration from "../models/techpackModel.js";
import Costing from "../models/costingModel.js";
import uploadOnCloudinary from "../utils/cloudinaryUploader.js";

export const createOrder = async (req, res) => {
  try {
    const {
      styleNumber,
      buyerName,
      orderQuantity,
      shipmentDate,
      season,
      factoryOrganisationName,
    } = req.body;

    // 1. Validation for mandatory text fields
    if (
      !styleNumber ||
      !buyerName ||
      !orderQuantity ||
      !shipmentDate ||
      !factoryOrganisationName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields to start the workflow.",
      });
    }

    // 1b. Resolve factory by organisation name (role: factory), case-insensitive
    const name = factoryOrganisationName.trim();
    const factoryUser = await User.findOne({
      role: "factory",
      organisationName: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      isActive: true,
    });
    if (!factoryUser) {
      return res.status(400).json({
        success: false,
        message: "No active factory found with this organisation name.",
      });
    }
    const factoryId = factoryUser._id;

    // 2. Handle Multi-File Upload check
    if (!req.files || !req.files.techpack) {
      return res.status(400).json({
        success: false,
        message: "A Techpack (PDF/ZIP) is mandatory for new orders.",
      });
    }

    // 3. Upload Techpack (Resource Type: Raw)
    const techpackUpload = await uploadOnCloudinary(req.files.techpack[0].path);
    if (!techpackUpload) {
      return res
        .status(500)
        .json({ success: false, message: "Techpack upload failed." });
    }

    // 4. Upload Preview Photo (Resource Type: Image) if provided
    let previewPhotoData = {};
    if (req.files.previewPhoto) {
      const photoUpload = await uploadOnCloudinary(
        req.files.previewPhoto[0].path
      );
      if (photoUpload) {
        previewPhotoData = {
          url: photoUpload.secure_url,
          cloudinaryPublicId: photoUpload.public_id,
        };
      }
    }

    // 5. Create Order with Preview Photo
    const newOrder = new Order({
      styleNumber,
      buyerName,
      orderQuantity,
      shipmentDate,
      season,
      previewPhoto: previewPhotoData, // Assigned to the main Order model
      merchant: req.result._id,
      factory: factoryId,
    });

    // 6. Atomic Initialization of Sub-Modules
    // The Fabric Sketch is left empty here to be updated later in the TNA tab
    const [tna, fabric, techpackDoc, costing] = await Promise.all([
      TNA.create({ orderId: newOrder._id }),
      Fabric.create({ orderId: newOrder._id, colorName: "TBD" }),
      TechpackIteration.create({
        orderId: newOrder._id,
        techpackFile: {
          url: techpackUpload.secure_url,
          cloudinaryPublicId: techpackUpload.public_id,
        },
      }),
      Costing.create({ orderId: newOrder._id }),
    ]);

    // 7. Link Sub-Modules
    newOrder.tna = tna._id;
    newOrder.fabric = fabric._id;
    newOrder.techpackDetails = techpackDoc._id;
    newOrder.costing = costing._id;

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Style Order created successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Style Number already exists." });
    }
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validation
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required." });
    }

    const order = await Order.findById(orderId)
      .populate("tna")
      .populate("fabric")
      .populate("techpackDetails")
      .populate("costing")
      .populate("merchant", "firstName lastName emailId organisationName")
      .populate("factory", "firstName lastName emailId organisationName");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const user = req.result;
    if (user.role === "factory" && order.factory?._id?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this order.",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Fetch Order Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const updateTna = async (req, res) => {
  try {
    if (req.result.role !== "asmara") {
      return res.status(403).json({ success: false, message: "Only Asmara can edit TNA." });
    }
    const { tnaId } = req.params;
    let tnaUpdateData = { ...req.body };

    // 1. Fetch TNA to find the associated Order ID
    const existingTna = await TNA.findById(tnaId);
    if (!existingTna) {
      return res
        .status(404)
        .json({ success: false, message: "TNA not found." });
    }

    // 2. Process sketch upload and update the ORDER model
    if (req.file) {
      const sketchUpload = await uploadOnCloudinary(req.file.path);
      if (sketchUpload) {
        await Order.findByIdAndUpdate(existingTna.orderId, {
          $set: {
            fabricSketch: {
              url: sketchUpload.secure_url,
              cloudinaryPublicId: sketchUpload.public_id,
            },
          },
        });
      }
    }

    // 3. Update TNA milestone dates
    const updatedTna = await TNA.findByIdAndUpdate(
      tnaId,
      {
        $set: tnaUpdateData,
        lastUpdatedBy: req.result._id,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "TNA milestones and Order sketch updated successfully!",
      data: updatedTna,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFabric = async (req, res) => {
  try {
    if (req.result.role !== "asmara") {
      return res.status(403).json({ success: false, message: "Only Asmara can edit Fabric." });
    }
    const { fabricId } = req.params;
    let fabricUpdateData = { ...req.body };

    // 1. Fetch Fabric to find the associated Order ID
    const existingFabric = await Fabric.findById(fabricId);
    if (!existingFabric) {
      return res
        .status(404)
        .json({ success: false, message: "Fabric not found." });
    }

    // 2. Process sketch upload and update the ORDER model
    if (req.file) {
      const sketchUpload = await uploadOnCloudinary(req.file.path);
      if (sketchUpload) {
        await Order.findByIdAndUpdate(existingFabric.orderId, {
          $set: {
            fabricSketch: {
              url: sketchUpload.secure_url,
              cloudinaryPublicId: sketchUpload.public_id,
            },
          },
        });
      }
    }

    // 3. Update Fabric specific details
    const updatedFabric = await Fabric.findByIdAndUpdate(
      fabricId,
      {
        $set: fabricUpdateData,
        lastUpdatedBy: req.result._id,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Fabric details and Order sketch updated successfully!",
      data: updatedFabric,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTechpack = async (req, res) => {
  try {
    if (req.result.role !== "asmara") {
      return res.status(403).json({ success: false, message: "Only Asmara can edit Tech Pack." });
    }
    const { techpackId } = req.params;
    let techpackUpdateData = { ...req.body };

    // 1. Fetch Techpack document to find the associated Order ID
    const existingTechpack = await TechpackIteration.findById(techpackId);
    if (!existingTechpack) {
      return res
        .status(404)
        .json({ success: false, message: "Techpack not found." });
    }

    // 2. Handle Multiple File Fields (techpackFile and fabricSketch)
    if (req.files) {
      // Process the main PDF/ZIP Techpack File (Resource type: raw)
      if (req.files.techpackFile) {
        const fileUpload = await uploadOnCloudinary(
          req.files.techpackFile[0].path
        );
        techpackUpdateData.techpackFile = {
          url: fileUpload.secure_url,
          cloudinaryPublicId: fileUpload.public_id,
        };
      }

      // Process the technical sketch and update the central Order model
      if (req.files.fabricSketch) {
        const sketchUpload = await uploadOnCloudinary(
          req.files.fabricSketch[0].path
        );
        await Order.findByIdAndUpdate(existingTechpack.orderId, {
          $set: {
            fabricSketch: {
              url: sketchUpload.secure_url,
              cloudinaryPublicId: sketchUpload.public_id,
            },
          },
        });
      }
    }

    // 3. Update Techpack milestone dates
    const updatedTechpack = await TechpackIteration.findByIdAndUpdate(
      techpackId,
      {
        $set: techpackUpdateData,
        lastUpdatedBy: req.result._id,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Techpack milestones and visual sketch updated successfully!",
      data: updatedTechpack,
    });
  } catch (error) {
    console.error("Techpack Update Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const updateCosting = async (req, res) => {
  try {
    const { costingId } = req.params;

    // 1. Fetch the document to trigger the pre-save hook later
    const costing = await Costing.findById(costingId);
    if (!costing) {
      return res
        .status(404)
        .json({ success: false, message: "Costing document not found." });
    }

    // 2. Handle Multi-File Upload (Costing Sheet and Fabric Sketch)
    if (req.files) {
      // Process PDF/ZIP Costing Sheet (Resource type: raw)
      if (req.files.costingSheet) {
        const fileUpload = await uploadOnCloudinary(
          req.files.costingSheet[0].path
        );
        costing.costingSheet = {
          url: fileUpload.secure_url,
          cloudinaryPublicId: fileUpload.public_id,
        };
      }

      // Process Technical Sketch and update the central Order model
      if (req.files.fabricSketch) {
        const sketchUpload = await uploadOnCloudinary(
          req.files.fabricSketch[0].path
        );
        await Order.findByIdAndUpdate(costing.orderId, {
          $set: {
            fabricSketch: {
              url: sketchUpload.secure_url,
              cloudinaryPublicId: sketchUpload.public_id,
            },
          },
        });
      }
    }

    // 3. Update Text/Financial Fields (parse FormData string values)
    const numFields = ["fabricCost", "trim", "packagingWithYY", "washingCost", "testing", "cutMakingCost", "overheads"];
    numFields.forEach((key) => {
      if (req.body[key] !== undefined && req.body[key] !== "") {
        costing[key] = Number(req.body[key]) || 0;
      }
    });
    if (req.body.isApproved !== undefined) {
      costing.isApproved = req.body.isApproved === "true" || req.body.isApproved === true;
    }
    costing.lastUpdatedBy = req.result._id;

    // 4. Save to trigger the pre-save finalCost calculation
    await costing.save();

    res.status(200).json({
      success: true,
      message: "Costing updated and Final Cost recalculated!",
      data: costing,
    });
  } catch (error) {
    console.error("Costing Update Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

const ORDER_STATUS_VALUES = ["pending", "in-production", "shipped", "delivered", "cancelled"];
const FACTORY_ALLOWED_STATUSES = ["shipped", "delivered"];

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const user = req.result;

    if (!status || typeof status !== "string") {
      return res.status(400).json({ success: false, message: "Status is required." });
    }
    if (!ORDER_STATUS_VALUES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (user.role === "factory") {
      if (order.factory?.toString() !== user._id.toString()) {
        return res.status(403).json({ success: false, message: "You do not have access to this order." });
      }
      if (!FACTORY_ALLOWED_STATUSES.includes(status)) {
        return res.status(403).json({
          success: false,
          message: "Factory can only set status to Shipped or Delivered.",
        });
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated.",
      data: order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { search } = req.query;
    const user = req.result;

    let query = { isActive: true };

    // Factory sees only orders assigned to them; Asmara sees all
    if (user.role === "factory") {
      query.factory = user._id;
    }

    if (search) {
      query.$or = [
        { styleNumber: { $regex: search, $options: "i" } },
        { buyerName: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .select(
        "styleNumber buyerName orderQuantity shipmentDate season status previewPhoto createdAt"
      )
      .populate("merchant", "firstName lastName emailId organisationName")
      .populate("factory", "firstName lastName emailId organisationName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const searchOrderByStyle = async (req, res) => {
  try {
    const { q } = req.query; // 'q' is the search string from the frontend

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Please provide a style number to search.",
      });
    }

    // Search using regex for partial matches (case-insensitive)
    const orders = await Order.find({
      styleNumber: { $regex: q, $options: "i" },
    })
      .select("styleNumber buyerName previewPhoto season status shipmentDate")
      .limit(10); // Limit results for performance during "live typing"

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Style Search Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

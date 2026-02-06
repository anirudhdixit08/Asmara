// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const orderSchema = new Schema(
//   {
//     styleNumber: {
//       type: String,
//       required: [true, "Style Number is required"],
//       trim: true,
//       index: true,
//     },
//     buyerName: {
//       type: String,
//       required: [true, "Buyer Name is required"],
//       trim: true,
//     },
//     orderQuantity: {
//       type: Number,
//       required: [true, "Order Quantity is required"],
//       min: [1, "Quantity must be at least 1"],
//     },
//     shipmentDate: {
//       type: Date,
//       required: [true, "Shipment Date is required"],
//     },
//     season: {
//       type: String,
//       required: [true, "Season is required"],
//       trim: true,
//     },
//     factory: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Please select a target factory"],
//     },
//     merchant: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     techpack: {
//       url: {
//         type: String,
//         required: [true, "Techpack file URL is required"],
//       },
//       cloudinaryPublicId: {
//         type: String,
//         required: [true, "Techpack public_id is required"],
//       },
//     },
//     status: {
//       type: String,
//       enum: ["pending", "in-production", "shipped", "delivered", "cancelled"],
//       default: "pending",
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);

// export default Order;

import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    // --- Core Order Details (Image 13) ---
    styleNumber: {
      type: String,
      required: [true, "Style Number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    buyerName: {
      type: String,
      required: [true, "Buyer Name is required"],
      trim: true,
    },
    orderQuantity: {
      type: Number,
      required: [true, "Order Quantity is required"],
    },
    shipmentDate: {
      type: Date,
      required: [true, "Shipment Date is required"],
    },
    previewPhoto: {
      url: { type: String },
      cloudinaryPublicId: { type: String },
    },
    fabricSketch: {
      url: { type: String },
      cloudinaryPublicId: { type: String },
    },
    season: {
      type: String,
      required: [true, "Season is required"],
    },

    // --- Participants ---
    merchant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    factory: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A factory must be assigned to the order"],
    },

    // --- Sub-Module References ---
    // These link the main order to the detailed tabs in your Factrix UI
    tna: {
      type: Schema.Types.ObjectId,
      ref: "TNA",
    },
    fabric: {
      type: Schema.Types.ObjectId,
      ref: "Fabric",
    },
    techpackDetails: {
      type: Schema.Types.ObjectId,
      ref: "TechpackIteration",
    },
    costing: {
      type: Schema.Types.ObjectId,
      ref: "Costing",
    },

    // --- Status & Tracking ---
    status: {
      type: String,
      enum: ["pending", "in-production", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

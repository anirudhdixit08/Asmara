import mongoose from "mongoose";

const { Schema } = mongoose;

const costingSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    // --- Financial Breakdown (Matches Image 23/24) ---
    fabricCost: {
      type: Number,
      default: 0,
    },
    trim: {
      type: Number,
      default: 0,
    },
    packagingWithYY: {
      type: Number,
      default: 0,
    },
    washingCost: {
      type: Number,
      default: 0,
    },
    testing: {
      type: Number,
      default: 0,
    },
    cutMakingCost: {
      type: Number,
      default: 0,
    },
    overheads: {
      type: Number,
      default: 0,
    },
    finalCost: {
      type: Number,
      default: 0,
    },

    // --- Approvals & Documentation ---
    // Matches the "Approve" checkbox in your design
    isApproved: {
      type: Boolean,
      default: false,
    },
    // For the "Upload Costing Sheet" button (PDF or ZIP)
    costingSheet: {
      url: { type: String },
      cloudinaryPublicId: { type: String },
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/**
 * Automatically calculates the Final Cost based on the individual
 * components whenever the document is saved.
 */
costingSchema.pre("save", function () {
  this.finalCost =
    (this.fabricCost || 0) +
    (this.trim || 0) +
    (this.packagingWithYY || 0) +
    (this.washingCost || 0) +
    (this.testing || 0) +
    (this.cutMakingCost || 0) +
    (this.overheads || 0);
});

const Costing = mongoose.model("Costing", costingSchema);

export default Costing;

import mongoose from "mongoose";

const { Schema } = mongoose;

const fabricSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    // Matches the "Color Name" field in your design (e.g., Pastel Yellow)
    colorName: {
      type: String,
      required: [true, "Color Name is required"],
      trim: true,
    },
    // Matches the Pantone reference block in your design (e.g., 11-0616 TCX)
    pantoneCode: {
      type: String,
      trim: true,
    },
    // The colored square preview shown in your design
    pantoneColorHex: {
      type: String,
      default: "#FDFD96", // Defaulting to your Pastel Yellow hex
    },
    labDipApprovalDate: {
      type: Date,
    },
    iobApprovalDate: {
      type: Date,
    },
    bulkInhouseDate: {
      type: Date,
    },
    // Matches "Lot Approval Date" in your design
    lotApprovalDate: {
      type: Date,
    },
    // For storing the technical sketch or swatch image shown in the design
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Fabric = mongoose.model("Fabric", fabricSchema);

export default Fabric;

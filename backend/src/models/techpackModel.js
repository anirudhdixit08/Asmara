import mongoose from "mongoose";

const { Schema } = mongoose;

const techpackIterationSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    // Matches "Initial TP" date field in your design (Image 21)
    initialTPDate: {
      type: Date,
    },
    // Matches "1st Fit submission" in your design
    firstFitSubmissionDate: {
      type: Date,
    },
    // Matches "2nd Fit submission" in your design
    secondFitSubmissionDate: {
      type: Date,
    },
    // Matches "PP Approval Date" in your design
    ppApprovalDate: {
      type: Date,
    },
    // The field for fabricSketch as requested (Image 21)
    // Stores the technical drawing/diagram shown on the right of your UI
    // Reference to the actual Techpack file (PDF/ZIP)
    // This allows you to upload a new version during iterations
    techpackFile: {
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

const TechpackIteration = mongoose.model(
  "TechpackIteration",
  techpackIterationSchema
);

export default TechpackIteration;

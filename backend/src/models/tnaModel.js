import mongoose from "mongoose";
const { Schema } = mongoose;

const tnaSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    previewPhoto: {
      url: { type: String },
      cloudinaryPublicId: { type: String },
    },
    greigeCommit: { type: Date },
    colorCommit: { type: Date },
    ppApproval: { type: Date },
    cutDate: { type: Date },
    gacDate: { type: Date },
    tnaClosedWithBuyer: { type: Date },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const TNA = mongoose.model("TNA", tnaSchema);
export default TNA;

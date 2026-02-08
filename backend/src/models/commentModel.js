import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ orderId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;

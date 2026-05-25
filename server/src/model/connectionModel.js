import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true },
);

connectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const Connection = mongoose.model("connection", connectionSchema);

export default Connection;

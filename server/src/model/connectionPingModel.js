import mongoose from "mongoose";

const ConnectionPingSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    to: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },

    message: {
      type: String,
      maxLength: 500,
    },

    isMessageRequest: {
      type: Boolean,
      default: false,
    },

    spaceContextId: {
      type: mongoose.Types.ObjectId,
      ref: "space",
    },

    showFor: {
      type: [mongoose.Types.ObjectId],
      ref: "user",
      default: [], // initially you can populate with `to`
    },
  },
  { timestamps: true }
);

const ConnectionPing = mongoose.model("ConnectionPing", ConnectionPingSchema);

export default ConnectionPing;

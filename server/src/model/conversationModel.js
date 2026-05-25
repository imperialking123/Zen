import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Types.ObjectId],
    ref: "user",
    required: true,
  },

  relation: {
    type: String,
    enum: ["space", "connection"],
    default: "connection",
    required: true,
  },

  connectionId: {
    type: mongoose.Types.ObjectId,
    ref: "connection",
  },

  spaceContext: {
    type: mongoose.Types.ObjectId,
    ref: "space",
  },
  showFor: {
    type: [mongoose.Types.ObjectId],
    ref: "user",
    required: true,
  },
  unreadCount: {
    type: Object,
    default: {},
  },
});

const Conversation = mongoose.model("conversation", conversationSchema);

export default Conversation;

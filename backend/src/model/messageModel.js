import mongoose, { Types } from "mongoose";

/**
 * Attachment Schema - represents file attachments in messages
 * Supports: image, video, audio, document
 */
const AttachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video", "audio", "document"],
    required: true,
  },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  name: { type: String, required: true },
  fileId: { type: String, required: true },
  filePath: { type: String, required: true },
});

/**
 * BaseMessage Schema - common fields for all message types
 */
const BaseMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Types.ObjectId,
    ref: "conversation",
    required: true,
  },
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  receiverId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  status: {
    type: String,
    enum: ["sending", "sent", "delivered", "read", "failed"],
    default: "sent",
    required: true,
  },
});

const MessageSchema = new mongoose.Schema(
  {
    ...BaseMessageSchema.obj,
    type: {
      type: String,
      enum: ["default", "gif"],
      default: "default",
      required: true,
    },
    text: String,
    attachments: [AttachmentSchema],
    gif: {
      type: {
        id: {
          type: String,
          required: true,
        },
        preview: {
          type: String,
          required: true,
        },
        full: {
          type: String,
          required: true,
        },
        width: {
          type: Number,
        },
        height: {
          type: Number,
        },
      },
      required: false,
    },
    replyTo: {
      type: mongoose.Types.ObjectId,
      ref: "message",
    },
    isReplied: {
      type: Boolean,
    },
    isForwarded: {
      type: Boolean,
    },
    reactions: {
      type: Map,
      of: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("message", MessageSchema);

export default Message;

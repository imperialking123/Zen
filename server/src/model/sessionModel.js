import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Types.ObjectId,
    },
    osClient: {
      type: String,
    },
    os: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
    },
    location: {
      formattedLocation: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
        validate: (v) => v.length === 2,
      },
    },
    userAgent: {
      type: String,
      select: false,
    },
    lastUsedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("session", sessionSchema);
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default Session;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      required: true,
      type: String,
      minLength: 6,
      select: false,
    },
    email: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    profile: {
      profilePic: String,
    },
    availability: {
      type: String,
      required: true,
      enum: ["online", "offline", "dnd"],
      default: "online",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchema);

export default User;

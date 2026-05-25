import mongoose from "mongoose";

const gifSchema = new mongoose.Schema({
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
});

const favouriteReactionsSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  gifs: {
    type: Map,
    of: gifSchema,
  },
});

const FavouriteReactions = mongoose.model(
  "favouritereactions",
  favouriteReactionsSchema,
);

export default FavouriteReactions;

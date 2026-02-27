import FavouriteReactions from "../model/favouriteReactionModel.js";
import { emitPayloadToOtherSessions } from '../lib/io.js'
export const handleAddGifToFavourites = async (req, res) => {
  try {

    const user = req.user;
    const session = req.session

    const gif = req.body?.gif

    if (!gif) return res.status(400).json({ message: "GIF_REQUIRED" })

    const { id, preview, full, width, height } = gif || {};

    if (!id || !preview || !full) {
      return res.status(400).json({ message: "INVALID_GIF_DATA" });
    }

    if (
      typeof id !== "string" ||
      typeof preview !== "string" ||
      typeof full !== "string" ||
      typeof width !== "number" ||
      typeof height !== "number"
    ) {
      return res.status(400).json({ message: "INVALID_GIF_DATA" });
    }

    const findReactions = await FavouriteReactions.findOne({ ownerId: user._id })
    
    emitPayloadToOtherSessions(user._id, "SYNC:UPDATE", { type: "gif", gif }, session._id)

    if (!findReactions) {
      await FavouriteReactions.create({
        ownerId: user._id,
        gifs: { [id]: { id, preview, full, width, height } }
      })
    } else {
      if (findReactions.gifs.has(id)) {
        await findReactions.updateOne({ $unset: { [`gifs.${id}`]: "" } });
      } else {
        await findReactions.updateOne({ $set: { [`gifs.${id}`]: { id, preview, full, width, height } } });
      }

    }




    return res.status(204).end()

  } catch (error) {
    console.log(
      "Error on #handleAddGifToFavourite #favouritesController.js Error --> ",
      error.message || error,
    );
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

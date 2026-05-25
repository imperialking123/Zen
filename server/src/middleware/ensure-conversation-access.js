import Connection from "../model/connectionModel.js";
import Conversation from "../model/conversationModel.js";

const EnsureConversationAccess = async (req, res, next) => {
  try {
    const { connectionId } = req?.body || req?.params || {};

    const userId = req.user?._id; 

    if (!connectionId) {
      return res.status(400).json({ message: "CONNECTION_ID_REQUIRED" });
    }

    if (!userId) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    const getConnection = await Connection.findOne({
      _id: connectionId,
      $or: [
        {
          senderId: userId,
        },
        {
          receiverId: userId,
        },
      ],
    });

    if (!getConnection) {
      return res.status(403).json({ message: "ACCESS_DENIED" });
    }

    req.connection = getConnection;

    let getConversation = await Conversation.findOne({
      connectionId: getConnection._id,
    });

    if (!getConversation) {
      getConversation = await Conversation.create({
        connectionId: getConnection._id,
        participants: [getConnection.senderId, getConnection.receiverId],
        relation: "connection",
        showFor: [getConnection.senderId, getConnection.receiverId],
      });
      req.isNewConversation = true;
    }

    req.conversation = getConversation;

    next();
  } catch (error) {
    console.error(
      "Error on EnsureConversationAccess middleware error --->",
      error.message ?? error,
    );

    return res.status(500).json({
      message: "SERVER_ERROR",
    });
  }
};

export default EnsureConversationAccess;

import Connection from "../model/connectionModel.js";
import Conversation from "../model/conversationModel.js";
import User from "../model/userModel.js";

export const handleCreateNewConversation = async (req, res) => {
  try {
    const user = req.user;

    const { connectionId } = req?.body || {};

    //Alert change this check after Space is set
    if (!connectionId) {
      return res.status(400).json({ message: "CONNECTION_ID_REQUIRED" });
    }

    if (typeof connectionId !== "string") {
      return res
        .status(400)
        .json({ message: "INVALID_ID_GIVEN__REQUIRED_STRING" });
    }

    const findConnection = await Connection.findById(connectionId);

    if (!findConnection) {
      return res.status(400).json({ message: "NOT_CONNECTED" });
    }

    const otherUserId =
      findConnection.receiverId.toString() === user._id.toString()
        ? findConnection.senderId
        : findConnection.receiverId;

    const findOtherUser = await User.findById(otherUserId);

    if (!findOtherUser) return res.status(400).json({ message: "NO_USER" });

    const findConversation = await Conversation.findOne({
      connectionId: connectionId,
    });

    if (findConversation) {
      const returnObject = {
        ...findConversation.toObject(),
        otherUser: findOtherUser,
      };

      return res.status(200).json(returnObject);
    }

    const newConversation = await Conversation.create({
      participants: [findConnection.receiverId, findConnection.senderId],
      connectionId: findConnection._id,
      relation: "connection",
      showFor: [findOtherUser._id, user._id],
    });

    const returnObject = {
      ...newConversation.toObject(),
      otherUser: findOtherUser,
    };

    return res.status(201).json(returnObject);
  } catch (error) {
    console.log(
      "Error on handleCreateNewConversation",
      error?.message || error,
    );
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleGetConversation = async (req, res) => {
  try {
    const user = req.user;
    const { conversationId } = req?.params || {};

    if (!conversationId || typeof conversationId !== "string")
      return res.status(400).json({ message: "CONVERSATION_ID_REQUIRED" });

    const findConversation = await Conversation.findById(conversationId);

    if (!findConversation)
      return res.status(400).json({ message: "NO_DOCUMENT" });

    const otherUserId = findConversation.participants.find(
      (p) => p.toString() !== user._id.toString(),
    );

    const otherUser = await User.findById(otherUserId);

    if (!otherUser) return res.status(400).json({ message: "USER_DELETED" });

    const returnObject = {
      ...findConversation.toObject(),
      otherUser: otherUser,
    };

    return res.status(200).json(returnObject);
  } catch (error) {
    console.log(
      "Error on #getConversation  #conversationController.js Error --->  ",
      error.message || error,
    );

    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleCreateBulkConversation = async (req, res) => {
  try {
    const { missingConnectionIds } = req.body || {};

    if (
      !missingConnectionIds ||
      !Array.isArray(missingConnectionIds) ||
      missingConnectionIds.length === 0
    ) {
      return res.status(400).json({ message: "NO_CONTENT_RECEIVED" });
    }

    // Max 5 connections
    if (missingConnectionIds.length > 5) {
      return res.status(400).json({ message: "TOO_MANY_CONNECTIONS" });
    }

    // Validate each connectionId is a non-empty string
    const validConnectionIds = missingConnectionIds.filter((id) => {
      return typeof id === "string" && id.trim().length > 0;
    });

    if (validConnectionIds.length === 0) {
      return res.status(400).json({ message: "INVALID_CONNECTION_IDS" });
    }

    const connections = await Connection.find({
      _id: { $in: validConnectionIds },
    });

    if (connections.length === 0) {
      return res.status(400).json({ message: "INVALID_CONNECTION_IDS" });
    }

    // 1. Get all user IDs first
    const otherUserIds = connections.map((conn) =>
      conn.senderId.toString() === user._id.toString()
        ? conn.receiverId
        : conn.senderId,
    );

    // 2. Fetch all users in ONE query (parallel to DB)
    const otherUsers = await User.find({ _id: { $in: otherUserIds } });

    const userMap = new Map(otherUsers.map((u) => [u._id.toString(), u]));

    const convoPromises = connections.map(async (conn) => {
      const otherUserId =
        conn.senderId.toString() === user._id.toString()
          ? conn.receiverId
          : conn.senderId;

      const otherUser = userMap.get(otherUserId.toString());

      if (!otherUser) return null;

      // Find or create in one operation
      const conversation = await Conversation.findOneAndUpdate(
        { connectionId: conn._id }, // Find by this
        {
          $setOnInsert: {
            // Only set these on creation
            showFor: [conn.receiverId, conn.senderId],
            connectionId: conn._id,
            participants: [conn.receiverId, conn.senderId],
            relation: "connection",
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      return {
        ...conversation.toObject(),
        otherUser,
      };
    });

    const results = await Promise.allSettled(convoPromises);

    const conversations = results
      .filter(
        (result) => result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value);

    return res.status(200).json({ conversations });
  } catch (error) {
    console.log(
      "Error on handleCreateBulkConversation",
      error?.message || error,
    );
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

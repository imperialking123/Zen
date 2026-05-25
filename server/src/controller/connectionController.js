import { emitPayloadToOtherSessions, emitPayLoadToUser } from "../lib/io.js";
import Connection from "../model/connectionModel.js";
import ConnectionPing from "../model/connectionPingModel.js";
import User from "../model/userModel.js";

export const handleNewConnectionPing = async (req, res) => {
  try {
    const { pingArg } = req.body;
    const user = req.user;
    const session = req.session;

    if (!user) return res.status(400).json({ message: "UNAUTHORIZED" });
    if (!pingArg)
      return res.status(400).json({ message: "ERROR_MISSING_PING_ARG" });

    if (user?.username === pingArg) {
      return res.status(400).json({ message: "CANNOT_CONNECT_TO_YOURSELF" });
    }

    const findUser = await User.findOne({ username: pingArg });
    if (!findUser) return res.status(404).json({ message: "USER_NOT_FOUND" });
    if (findUser._id.equals(user._id))
      return res.status(400).json({ message: "CANNOT_CONNECT_TO_YOURSELF" });

    // Check if connection already exists
    const findConnection = await Connection.findOne({
      $or: [
        { receiverId: user._id, senderId: findUser._id },
        { receiverId: findUser._id, senderId: user._id },
      ],
    });
    if (findConnection)
      return res.status(400).json({ message: "ALREADY_CONNECTED" });

    // Check for existing pings
    const existingPing = await ConnectionPing.findOne({
      $or: [
        { from: user._id, to: findUser._id },
        { from: findUser._id, to: user._id },
      ],
    });
    if (existingPing) {
      const message = existingPing.from.equals(user._id)
        ? "PING_ALREADY_SENT"
        : "PING_ALREADY_RECEIVED";
      return res.status(400).json({ message });
    }

    // Check max connections (example: 200 max)
    const userConnectionsCount = await Connection.countDocuments({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    });
    if (userConnectionsCount >= 200)
      return res.status(400).json({ message: "MAX_CONNECTIONS_REACHED" });

    // Create the new ping
    const newConnectionPing = await ConnectionPing.create({
      from: user._id,
      to: findUser._id,
      showFor: [user._id, findUser._id],
      isMessageRequest: false,
    });

    const populatedPing = await newConnectionPing.populate(["from", "to"]);

    // Emit safely
    try {
      emitPayLoadToUser(findUser._id, "EVENT:ADD", {
        type: "ADD_RECEIVED_PING",
        pingData: populatedPing,
      });
    } catch (err) {
      console.error("Failed to emit to recipient socket", err.stack || err);
    }

    try {
      emitPayloadToOtherSessions(
        user._id,
        "SYNC:ADD",
        {
          type: "ADD_SENT_PING",
          connectionPing: populatedPing,
        },
        session._id,
      );
    } catch (err) {
      console.error("Failed to emit to other sessions", err.stack || err);
    }

    console.log(
      `New ConnectionPing Created by ${user._id}. Ping id --> ${newConnectionPing._id}`,
    );

    return res.status(201).json({
      message: "CONNECTION_PING_CREATED",
      pingData: populatedPing,
    });
  } catch (error) {
    console.error("Error on #HandleNewConnectionPing", error.stack || error);
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

//Deletes a ping sent to a user. ie. a connection request
export const handleDeleteSentPendingPing = async (req, res) => {
  try {
    const { documentId } = req?.query || {};

    const user = req.user;
    const session = req.session;

    if (!documentId)
      return res.status(400).json({ message: "INVALID_REQUEST" });

    const connectionPingDoc = await ConnectionPing.findOne({ _id: documentId });
    if (!connectionPingDoc)
      return res.status(400).json({ message: "DOES_NOT_EXIST" });

    const deleteConnectionPing = await ConnectionPing.findOneAndDelete({
      _id: documentId,
    });

    console.log(
      `ConnectionPing Document Deleted. Document ID --> ${deleteConnectionPing._id}`,
    );

    ///Emit to receiver of the connectionPing and update ui
    if (connectionPingDoc.showFor.includes(connectionPingDoc.to)) {
      emitPayLoadToUser(connectionPingDoc.to, "SYNC:REMOVE", {
        type: "REMOVE_RECEIVED_PING",
        documentId: documentId,
      });
    }

    //emit to user other devices connected if any
    emitPayloadToOtherSessions(
      user._id,
      "SYNC:REMOVE",
      {
        type: "REMOVE_SENT_PING",
        documentId: documentId,
      },
      session._id,
    );

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleAcceptConnectionPing = async (req, res) => {
  try {
    const documentId = req.body.documentId;

    const session = req.session;
    const user = req.user;

    if (!documentId)
      return res.status(400).json({ message: "DOCUMENT_ID_REQUIRED" });

    const findPing = await ConnectionPing.findById(documentId);

    if (!findPing) {
      return res.status(400).json({ message: "PING_NOT_FOUND" });
    }
    if (findPing.to.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "ONLY_RECEIVER_CAN_ACCEPT" });
    }

    const otherUser = await User.findById(findPing.from);

    const newConnection = await Connection.create({
      senderId: findPing.from,
      receiverId: findPing.to,
    });

    const serializedConnection = newConnection.toObject();

    const returnObject = {
      ...serializedConnection,
      otherUser: otherUser,
    };

    const pairedWithReturnObject = {
      ...serializedConnection,
      otherUser: user,
    };

    emitPayLoadToUser(otherUser._id.toString(), "EVENT:ADD", {
      type: "ADD_NEW_CONNECTION",
      connectionData: pairedWithReturnObject,
      documentId: documentId,
    });

    emitPayloadToOtherSessions(
      user._id.toString(),
      "SYNC:ADD",
      {
        type: "ADD_CONNECTION",
        connectionData: returnObject,
        documentId: findPing?._id?.toString() || documentId,
      },
      session._id.toString(),
    );

    await findPing.deleteOne();

    res.status(200).json({ connectionData: returnObject });
  } catch (error) {
    console.log(
      "Error on #acceptConnectionPing #connectionController.js  error  -->",
      error.message,
    );

    console.error("Stack trace:", error.stack.split("\n")[1]);
    if (error.code === 11000) {
      return res.status(400).json({ message: "CONNECTION_ALREADY_EXISTS" });
    }

    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleIgnoreConnectionPing = async (req, res) => {
  try {
    const user = req.user;
    const session = req.session;

    const documentId = req.body.documentId;

    if (!documentId) return res.status(400).json({ message: "WRONG_REQUEST" });

    await ConnectionPing.findByIdAndUpdate(
      documentId,
      { $pull: { showFor: user._id } },
      { new: true },
    );

    emitPayloadToOtherSessions(
      user._id.toString(),
      "SYNC:REMOVE",
      {
        type: "REMOVE_RECEIVED_PING",
        documentId: documentId,
      },
      session._id.toString(),
    );

    return res.status(204).end();
  } catch (error) {
    console.log(
      "Error on  #handleIgnoreConnectionPing #connectionController.js",
      error.message || error,
    );

    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleDeleteConnection = async (req, res) => {
  try {
    const user = req.user;
    const session = req.session;

    const { documentId } = req?.params || {};

    if (!documentId || typeof documentId !== "string")
      return res.status(400).json({ message: "DOCUMENT_ID_REQUIRED" });

    const findConnection = await Connection.findById(documentId);

    if (!findConnection)
      return res.status(400).json({ message: "CONNECTION_NOT_FOUND" });

    await findConnection.deleteOne();

    const otherUserId =
      findConnection.receiverId.toString() === user._id.toString()
        ? findConnection.senderId.toString()
        : findConnection.receiverId.toString();

    emitPayloadToOtherSessions(
      user._id.toString(),
      "SYNC:REMOVE",
      {
        type: "REMOVE_CONNECTION",
        documentId: documentId,
      },
      session._id.toString(),
    );

    emitPayLoadToUser(otherUserId, "EVENT:REMOVE", {
      type: "REMOVE_CONNECTION",
      documentId: documentId,
    });

    return res.status(204).end();
  } catch (error) {
    console.log(
      "Error on #handleDeleteConnection #connectionController.js Error --->",
      error?.message || error,
    );

    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const getConnectedPairUserIds = async (userId) => {
  try {
    const allConnections = await Connection.find({
      $or: [{ receiverId: userId }, { senderId: userId }],
    });

    return allConnections.map((connection) => {
      return connection.receiverId.toString() === userId.toString()
        ? connection.senderId.toString()
        : connection.receiverId.toString();
    });
  } catch (error) {
    console.log(
      "Error on getConnectedPairUserIds Error  --> ",
      error.message || error,
    );

    return null;
  }
};

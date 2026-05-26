import http from "http";
import express from "express";
import { Server } from "socket.io";
import User from "../model/userModel.js";
import Conversation from "../model/conversationModel.js";
import dotenv from "dotenv";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import Session from "../model/sessionModel.js";
import { getConnectedPairUserIds } from "../controller/connectionController.js";

dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL;

console.log("FRONTEND_URL in io.js:", FRONTEND_URL);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

const connectedUserMap = new Map();

export const emitPayLoadToUser = (userId, emitDestination, emitPayload) => {
  if (!userId) return;

  const connectedUser = connectedUserMap.get(userId.toString());

  // Check if connectedUser is an array and has at least one connection
  if (!Array.isArray(connectedUser) || connectedUser.length === 0) return;

  connectedUser.forEach((connection) => {
    try {
      io.to(connection.socketId).emit(emitDestination, emitPayload);
    } catch (err) {
      console.error("Failed to emit to socket", connection.socketId, err);
    }
  });
};

export const emitPayloadToOtherSessions = (
  userId,
  emitDestination,
  emitPayload,
  sessionIdToAvoid,
) => {
  if (!userId || !emitDestination || !emitPayload) {
    console.log(
      "#emitPayloadToOtherSessions #io.js. Stopped process because of missing arg",
    );
    return;
  }

  const connectedUser = connectedUserMap.get(userId.toString());

  if (!connectedUser) {
    console.log(
      "#emitPayloadToOtherSessions #io.js. Stopped Process because user was not found in socketMap",
    );
    return;
  }

  if (Array.isArray(connectedUser) && connectedUser.length < 1) {
    console.log("Only one Device Detected. No need for emit");
    return;
  }

  connectedUser.forEach((connected) => {
    const currentSessionId = connected.sessionId.toString();
    const avoidSessionId = sessionIdToAvoid.toString();

    if (currentSessionId !== avoidSessionId) {
      const socketId = connected.socketId;

      if (socketId) {
        io.to(socketId).emit(emitDestination, emitPayload);
      }
    }
  });
};

const updatePresenseOnConnect = async (userDetails) => {
  if (!userDetails || userDetails.availability === "offline") return;

  const userId = userDetails._id.toString();

  // Ensure user actually has an active session
  const sessions = connectedUserMap.get(userId);
  if (!Array.isArray(sessions) || sessions.length < 1) return;

  const idsToEmitTo = await getConnectedPairUserIds(userId);
  if (!Array.isArray(idsToEmitTo) || idsToEmitTo.length < 1) return;

  for (const id of idsToEmitTo) {
    emitPayLoadToUser(id, "EVENT:ADD", {
      type: "ADD_NEW_PRESENSE",
      userId,
      availability: userDetails.availability,
    });
  }
};

const handleSocketDisconnect = async (reason, socket) => {
  const userId = socket.userId;
  const sessionId = socket.sessionId;

  console.log(
    "#handleSocketDisconnect Socket Disconnected Reason --->",
    reason,
  );

  if (
    !userId ||
    !sessionId ||
    typeof userId !== "string" ||
    typeof sessionId !== "string"
  )
    return;

  const userDetails = await User.findById(userId);
  if (!userDetails) return;

  const mapKey = userId.toString();

  const userSessions = connectedUserMap.get(mapKey);
  if (!Array.isArray(userSessions) || userSessions.length < 1) return;

  const updatedSessions = userSessions.filter(
    (cn) => cn.sessionId !== sessionId,
  );

  if (updatedSessions.length > 0) {
    connectedUserMap.set(mapKey, updatedSessions);
    return;
  }

  connectedUserMap.delete(mapKey);

  if (userDetails.availability === "offline") return;

  const idsToEmitTo = await getConnectedPairUserIds(mapKey);

  if (Array.isArray(idsToEmitTo) && idsToEmitTo.length > 0) {
    for (const id of idsToEmitTo) {
      emitPayLoadToUser(id, "EVENT:REMOVE", {
        type: "REMOVE_USER_PRESENCE",
        userId,
      });
    }
  }

  console.log("Presence Updated for User's Connected Pairs UI if Online");
};

const updatePresenseOnIdleChange = async (args, socket) => {
  const userId = socket.userId;
  const sessionId = socket.sessionId;

  if (
    !userId ||
    typeof userId !== "string" ||
    !sessionId ||
    typeof sessionId !== "string"
  )
    return;

  const userDetails = await User.findOne({ _id: userId });
  if (!userDetails) return;

  if (userDetails.availability === "offline") return;

  const connectedUserMapRes = connectedUserMap.get(userId);
  if (!Array.isArray(connectedUserMapRes)) return;

  if (args === "online") {
    updatePresenseOnConnect(userDetails);
    return;
  }

  if (args === "idle") {
    const otherSessions = connectedUserMapRes.filter(
      (cn) => cn.sessionId !== sessionId,
    );

    if (otherSessions.length > 0) return;

    const updatedSessions = connectedUserMapRes.map((cn) => ({
      ...cn,
      availability: "idle",
    }));

    connectedUserMap.set(userId, updatedSessions);

    const idsToEmitTo = await getConnectedPairUserIds(userId);
    if (Array.isArray(idsToEmitTo) && idsToEmitTo.length > 0) {
      for (const id of idsToEmitTo) {
        await emitPayLoadToUser(id, "EVENT:ADD", {
          type: "ADD_NEW_PRESENSE",
          userId,
          availability: "idle",
        });
      }
    }
  }
};

export const getPresenseOfPairs = (otherPairIds) => {
  const returnObject = {};

  if (Array.isArray(otherPairIds) && otherPairIds.length > 0) {
    otherPairIds.forEach((id) => {
      const getPresense = connectedUserMap.get(id);

      if (Array.isArray(getPresense) && getPresense.length > 0) {
        const latestPresense = getPresense[getPresense.length - 1];
        const availability = latestPresense.availability;

        if (availability && typeof availability === "string") {
          returnObject[id] = { availability: availability };
        }
      }
    });

    return returnObject;
  } else {
    return null;
  }
};

const updateMap = (userId, sessionId, socketId, availability) => {
  const getExisting = connectedUserMap.get(userId);
  if (getExisting) {
    const object = {
      sessionId: sessionId,
      socketId: socketId,
      availability: availability,
    };
    getExisting.push(object);
    connectedUserMap.set(userId, getExisting);
  } else {
    const newArray = [
      { sessionId: sessionId, socketId: socketId, availability: availability },
    ];
    connectedUserMap.set(userId, newArray);
  }
};

const protectSocket = async (socket, next) => {
  const rawCookies = socket.request?.headers?.cookie;

  if (!rawCookies) {
    console.log("Attempted socket connection without cookies");
    socket.disconnect();
    return;
  }

  const cookies = cookie.parseCookie(socket.request?.headers?.cookie || "");

  const ZenCookieToken = cookies.ZenChattyVerb;

  if (!ZenCookieToken) {
    console.log(
      "Attempted socket connection without ZenCookies --> ZenChattyVerb",
    );
    socket.disconnect();
    return;
  }

  let verify;

  try {
    verify = jwt.verify(ZenCookieToken, process.env.JWT_SECRET);
  } catch (error) {
    console.log(
      "Verify Failed on #io.js #protectSocket function error message --> ",
      error?.message || error,
    );
    socket.disconnect();
    return;
  }

  const payLoad = verify;

  const userId = payLoad.userId;
  const sessionId = payLoad.sessionId;

  if (!userId || !sessionId) {
    console.log(
      "Attempted connection without required ids supposed to be in cookies",
    );
    socket.disconnect();
    return;
  }

  const userDetails = await User.findOne({ _id: userId });
  const userSession = await Session.findOne({ _id: sessionId });

  if (!userDetails) {
    console.log("Connection rejected: No user found for the provided userId.");
    socket.disconnect();
    return;
  }

  if (!userSession) {
    console.log("Connection rejected: No session found for the provided sessionId.");
    socket.disconnect();
    return;
  }

  socket.userId = userDetails._id.toString();
  socket.sessionId = userSession._id.toString();

  updateMap(
    userDetails._id.toString(),
    userSession._id.toString(),
    socket.id,
    userDetails.availability,
  );
  updatePresenseOnConnect(userDetails);
  next();
};

export const getUserSocket = (userId) => {
  if (!userId) return null;

  const key = String(userId);
  const user = connectedUsers.get(key);

  if (!user || !user.socketId) return null;

  return user.socketId;
};

const handleClearConversationUnread = async (args, socket) => {
  const { conversationId } = args;
  const userId = socket.userId;
  const sessionId = socket.sessionId;

  if (!conversationId || !userId || !sessionId) {
    console.log("Missing conversationId, userId, or sessionId in clearConversationUnread");
    return;
  }

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log("Conversation not found:", conversationId);
      return;
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${userId}`]: 0 }
    });

    const otherUserId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    if (otherUserId) {
      emitPayLoadToUser(otherUserId, "EVENT:ADD", {
        type: "CONVERSATION_UNREAD_CLEARED",
        conversationId,
      });
    }

    emitPayloadToOtherSessions(userId, "EVENT:ADD", {
      type: "CONVERSATION_UNREAD_CLEARED",
      conversationId,
    }, sessionId);

    console.log(`Cleared unread count for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error("Error in handleClearConversationUnread:", error);
  }
};
io.use(protectSocket);

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(
    `User Connected with USERID --> ${userId} and SOCKETID --> ${socket.id}`,
  );

  socket.on("disconnect", (reason) => handleSocketDisconnect(reason, socket));

  socket.on("idlePresenseChange", (args) =>
    updatePresenseOnIdleChange(args, socket),
  );

  socket.on("typingevent", (args) => {
    const to = args.to;

    if (to) {
      emitPayLoadToUser(to, "EVENT:ADD", {
        type: "TYPING_RECEIVE",
        userId: socket.userId,
      });
    }
  });
  socket.on("clearConversationUnread", (args) =>
    handleClearConversationUnread(args, socket),
  );
});

export { io, server, app };

import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import { generateCookieAndSession } from "../lib/utils.js";
import ConnectionPing from "../model/connectionPingModel.js";
import Connection from "../model/connectionModel.js";
import Conversation from "../model/conversationModel.js";
import Session from "../model/sessionModel.js";
import { getPresenseOfPairs } from "../lib/io.js";
import FavouriteReactions from "../model/favouriteReactionModel.js";

const MAX_SESSIONS = 12;

export const handleSignup = async (req, res) => {
  try {
    const {
      displayName = "",
      email = "",
      username = "",
      password = "",
      dob,
    } = req.body;

    // ---------- Display Name (string) ----------
    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        message: "DISPLAY_NAME_REQUIRED",
        errorOnInput: "displayName",
      });
    }
    const displayNameTrim = displayName.trim();
    if (displayNameTrim.length < 2) {
      return res.status(400).json({
        message: "DISPLAY_NAME_NOT_COMPLETE",
        errorOnInput: "displayName",
      });
    }
    if (displayNameTrim.length > 30) {
      return res.status(400).json({
        message: "DISPLAY_NAME_TOO_LONG",
        errorOnInput: "displayName",
      });
    }

    // ---------- Email (string) ----------
    const emailTrim = email.trim().toLowerCase();
    const emailRegex = /^[a-z0-9._%+-]{2,}@[a-z0-9.-]{2,}\.[a-z]{2,}$/;
    if (!emailTrim || !emailRegex.test(emailTrim)) {
      return res.status(400).json({
        message: "EMAIL_INVALID",
        errorOnInput: "email",
      });
    }

    // ---------- Username (string) ----------
    const usernameTrim = username.trim().toLowerCase();
    const usernameRegex = /^[a-z0-9_]{4,20}$/;
    if (!usernameTrim) {
      return res.status(400).json({
        message: "USERNAME_REQUIRED",
        errorOnInput: "username",
      });
    }
    if (!usernameRegex.test(usernameTrim)) {
      return res.status(400).json({
        message:
          "Username must be 4–20 characters (letters, numbers, underscores)",
        errorOnInput: "username",
      });
    }

    // ---------- Password (string) ----------
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        errorOnInput: "password",
      });
    }

    // ---------- Date of Birth (Date object) ----------
    const dobDate = new Date(dob);
    if (!(dobDate instanceof Date) || isNaN(dobDate.getTime())) {
      return res.status(400).json({
        message: "DOB_INVALID",
        errorOnInput: "dob",
      });
    }
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
    if (age < 7) {
      return res.status(400).json({
        message: "DOB_TOO_YOUNG",
        errorOnInput: "dob",
      });
    }

    // ---------- Check Existing User ----------
    const findUser = await User.findOne({
      $or: [{ email: emailTrim }, { username: usernameTrim }],
    });

    if (findUser) {
      if (findUser.email === emailTrim) {
        return res.status(400).json({
          message: "USER_ALREADY_EXISTS",
          errorOnInput: "email",
        });
      } else if (findUser.username === usernameTrim) {
        return res.status(400).json({
          message: "This username is taken. Please choose another",
          errorOnInput: "username",
        });
      }
    }

    // ---------- Hash Password & Create User ----------
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      displayName: displayNameTrim,
      email: emailTrim,
      username: usernameTrim,
      password: hashPassword,
      dob: dobDate,
    });

    console.log("New User Registered");

    console.log("Generating Cookie and Session for userId --> ", newUser._id);
    const tokenResponse = await generateCookieAndSession(
      req,
      newUser._id.toString(),
    );

    if (tokenResponse.isError) {
      return res.status(500).json({ message: tokenResponse.errorMessage });
    }

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("ZenChattyVerb", tokenResponse.token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "Lax",
      secure: isProd,
      path: "/",
    });

    const { password: pass, ...rest } = newUser.toObject();

    return res.status(200).json({ authUser: rest });
  } catch (error) {
    console.log("Error on #signup #userController", error);
    res.status(500).json({ message: "SERVER_ERROR", errorOnInput: false });
  }
};

export const handleLogin = async (req, res) => {
  try {
    const password = req.body.password;
    const handle = req.body.handle?.trim().toLowerCase();

    if (!handle) return res.status(400).json({ message: "HANDLE_REQUIRED" });
    if (!password)
      return res.status(400).json({ message: "PASSWORD_REQUIRED" });
    const user = await User.findOne({
      $or: [{ username: handle }, { email: handle }],
    }).select("+password");

    if (!user) return res.status(400).json({ message: "INVALID_CREDENTIALS" });

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword)
      return res.status(400).json({ message: "INVALID_CREDENTIALS" });

    const sessions = await Session.find({ ownerId: user._id });

    if (sessions && Array.isArray(sessions) && sessions.length > MAX_SESSIONS)
      return res.status(400).json({ message: "MAX_SESSIONS" });

    console.log("Generating Cookie and Session for userId --> ", user._id);
    const tokenResponse = await generateCookieAndSession(
      req,
      user._id.toString(),
    );

    if (tokenResponse.isError) {
      return res.status(500).json({ message: tokenResponse.errorMessage });
    }

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("ZenChattyVerb", tokenResponse.token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "Lax",
      secure: isProd,
      path: "/",
    });
    const { password: pass, ...rest } = user.toObject();
    res.status(200).json({ authUser: rest });
  } catch (error) {
    console.log("Error on Login #userController.js", error?.message || error);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handleLogout = async (req, res) => {
  try {
    res.cookie("ZenChattyVerb", "", {
      maxAge: 0,
      sameSite: "Strict",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    console.log("Error on Logout Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleCheckUsername = async (req, res) => {
  try {
    const usernameQueryKey = req.body.usernameQueryKey;
    if (!usernameQueryKey)
      return res.status(400).json({
        message: "NO_USERNAME_QUERY",
        errorOnInput: false,
        isError: true,
      });

    const findUser = await User.findOne({ username: usernameQueryKey });

    if (findUser) {
      return res.status(400).json({
        message: "USERNAME_TAKEN",
        isError: true,
        usernameQueryKey,
        errorOnInput: true,
      });
    } else {
      return res.status(200).json({
        message: "USERNAME_AVAILABLE",
        isError: false,
        errorOnInput: false,
        usernameQueryKey,
      });
    }
  } catch (error) {
    console.log(
      "Error on #checkUsername #userController.js",
      error?.message || error,
    );
    const errorObject = {
      errorOnInput: false,
      message: "SERVER_ERROR",
      isError: true,
    };

    return res.status(500).json({ errorObject });
  }
};

export const checkUser = async (req, res) => {
  try {
    const user = req.user;

    const session = req.session;

    const newUpdated = await Session.findByIdAndUpdate(session._id, {
      lastUsedAt: new Date(),
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error on #check #userController.js", error.message);

    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export const handlePreload = async (req, res) => {
  try {
    const user = req.user;

    const connections = await Connection.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    });

    const sentConnectionPings = await ConnectionPing.find({
      from: user._id,
    }).populate("to");
    const receivedConnectionPings = await ConnectionPing.find({
      to: user._id,
      showFor: user._id,
    }).populate("from");
    const conversations = await Conversation.find({
      participants: { $in: [user._id] },
    });

    const readyToUseConnections = await Promise.all(
      connections.map(async (connection) => {
        const isSender = connection.senderId.toString() === user._id.toString();
        const otherUserId = isSender
          ? connection.receiverId
          : connection.senderId;

        const otherUser = await User.findById(otherUserId);

        return {
          ...connection.toObject(),
          otherUser,
        };
      }),
    );

    const readyToUseConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = conversation.participants.find(
          (participantId) => participantId.toString() !== user._id.toString(),
        );

        const otherUser = await User.findById(otherUserId);

        return {
          ...conversation.toObject(),
          otherUser,
        };
      }),
    );

    const otherPairIds = connections.map((cn) => {
      const otherUser =
        cn.receiverId.toString() === user._id.toString()
          ? cn.senderId.toString()
          : cn.receiverId.toString();

      return otherUser;
    });

    const getPresenseOfPairsRes = getPresenseOfPairs(otherPairIds);

    const favouriteReactions = await FavouriteReactions.findOne({
      ownerId: user._id,
    });

    const returnObject = {
      connections: readyToUseConnections,
      sentConnectionPings: sentConnectionPings,
      receivedConnectionPings: receivedConnectionPings,
      conversations: readyToUseConversations,
      authUser: user,
      onlinePresenses: getPresenseOfPairsRes,
      favouriteGifs: favouriteReactions?.gifs || [],
    };

    return res.status(200).json(returnObject);
  } catch (error) {
    console.log(
      "Error on #handlePreload #userController.js Error --> ",
      error?.message || error,
    );
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
};

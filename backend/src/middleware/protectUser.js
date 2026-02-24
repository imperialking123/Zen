import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import Session from "../model/sessionModel.js";

const SERVER_STAGE = process.env.SERVER_STAGE;

const ProtectRoute = async (req, res, next) => {


  try {
    const cookie = req.cookies.ZenChattyVerb;
    if (!cookie)
      return res.status(400).json({ message: "NO_AUTHENTICATION_PARAM" });

    let verify;

    try {
      verify = jwt.verify(cookie, process.env.JWT_SECRET);
    } catch (error) {


      const COOKIE_NAME = "ZenChattyVerb"

      //Remove cookie since it's useless anyway

      res.cookie(COOKIE_NAME, "", {
        maxAge: 0,
        httpOnly: true,
        secure: SERVER_STAGE === "prod",
        sameSite: SERVER_STAGE === "prod" ? "none" : "lax",
      });

      console.log("Error verify jwt", error.message || error);
      return res.status(400).json({ message: "UNAUTHORIZED" });
    }

    const decode = jwt.decode(cookie);
    if (!decode || typeof decode !== "object")
      return res.status(400).json({ message: "UNAUTHORIZED" });

    const { userId, sessionId } = decode;

    if (!userId || !sessionId)
      return res
        .status(400)
        .json({ message: "UNAUTHORIZED_NO_REQUIRED_PARAM" });

    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user)
      return res.status(400).json({ message: "INVALID_AUTHENTICATION_PARAM" });

    const session = await Session.findOne({ _id: sessionId });

    if (!session)
      return res.status(400).json({ message: "UNAUTHORIZED_NO_SESSION" });

    req.user = user;
    req.session = session;
    next();
  } catch (err) {
    console.log("SERVER_ERROR", err);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
};

export default ProtectRoute;

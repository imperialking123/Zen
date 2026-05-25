import jwt from "jsonwebtoken";
import ipLocate from "node-iplocate";
import { UAParser } from "ua-parser-js";
import Session from "../model/sessionModel.js";

export const ipLookupClient = new ipLocate(process.env.IP_LOCATE_API_KEY || "");

export const generateCookieAndSession = async (req, userId) => {
  try {
    const ip =
      req.headers["cf-connecting-ip"] || // Cloudflare
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const oneMonthAfter = new Date();
    oneMonthAfter.setMonth(oneMonthAfter.getMonth() + 1);

    //Note always add a temp ip in development when creating a cookie

    const nodeEnv = process.env.NODE_ENV;
    const getIp =
      nodeEnv === "development" || nodeEnv === "dev"
        ? process.env.PLACE_HOLDER_IP
        : ip;
    const ipLocate = await ipLookupClient.lookup(getIp);

    const isUnknownLocation =
      !ipLocate ||
      !ipLocate.country ||
      ipLocate.latitude == null ||
      ipLocate.longitude == null;

    if (isUnknownLocation) {
      console.log(
        `Cookie Generation Failed Reason -->  Unknown location for IP --> ${ip}`,
      );

      return {
        token: null,
        isError: true,
        errorMessage: "BROWSER_ERROR_OR_FIRE_WALL",
      };
    }

    const city = ipLocate.city || ipLocate.subdivision || null;
    const country = ipLocate.country;
    const formattedLocation = city ? `${city}, ${country}` : country;

    const userAgent = UAParser(req.headers["user-agent"]);

    let sessionObject = {
      location: {
        formattedLocation: formattedLocation,
        coordinates: [ipLocate.latitude, ipLocate.longitude],
      },
      ownerId: userId,
      os: userAgent.os?.name || null,
      osClient: userAgent.browser.name || null,
      ip: ip,
      userAgent: userAgent.ua,
      lastUsedAt: new Date(),
      expiresAt: oneMonthAfter,
    };

    const newSession = await Session.create(sessionObject);

    const token = jwt.sign(
      { userId, sessionId: newSession._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    return { token, isError: false, errorMessage: "" };
  } catch (error) {
    console.log(
      "Error on #generateCookieAndSession #utils.js",
      error?.message || error,
    );
    return {
      token: null,
      isError: true,
      errorMessage: "SERVER_ERROR",
    };
  }
};

export const getImageBlurHash = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context failed");

      // Keep resolution low for encoding speed (32x32 is plenty)
      const width = 32;
      const height = 32;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      // Get raw RGBA pixel data
      const imageData = ctx.getImageData(0, 0, width, height);

      // Encode (4, 3 are the components - determines detail level)
      const hash = encode(
        imageData.data,
        imageData.width,
        imageData.height,
        4,
        3,
      );

      URL.revokeObjectURL(img.src); // Clean up memory
      resolve(hash);
    };

    img.onerror = (err) => reject(err);
  });
};

export const getVideoBlurHash = async (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    // We must seek to at least 0.1s because the very first frame is often black
    video.currentTime = 0.5;

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas failure");

      // Small resolution for speed
      canvas.width = 32;
      canvas.height = 32;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const hash = encode(
        imageData.data,
        imageData.width,
        imageData.height,
        4,
        3,
      );

      URL.revokeObjectURL(video.src);
      resolve(hash);
    };

    video.onerror = (err) => reject(err);
  });
};

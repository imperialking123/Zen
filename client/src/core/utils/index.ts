import axios from "axios";
import { encode } from "blurhash";

export const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

class NotificationAudio {
  message = new Audio("/sounds/message.mp3");
  connection = new Audio("/sounds/newconnection.mp3");

  playMessage() {
    this.message.currentTime = 0;
    this.message.play().catch(() => {});
  }

  playConnection() {
    this.connection.currentTime = 0;
    this.connection.play().catch(() => {});
  }
}

export const notificationService = new NotificationAudio();

export const getImageBlurHash = async (file: File): Promise<string> => {
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


export const getVideoBlurHash = async (file: File): Promise<string> => {
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






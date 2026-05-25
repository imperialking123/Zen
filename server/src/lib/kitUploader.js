import dotenv from "dotenv";
import ImageKit from "imagekit";

dotenv.config();
const credentials = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
};

const imageKitInstance = new ImageKit({
  publicKey: credentials.publicKey,
  privateKey: credentials.privateKey,
  urlEndpoint: credentials.urlEndpoint, 
});

export default imageKitInstance;

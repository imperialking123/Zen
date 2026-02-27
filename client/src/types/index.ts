import type { connectionPingType, IUser } from "./schema";

export type loginDetails = {
  handle: string;
  password: string;
};

export type signupDetails = {
  displayName: string;
  email: string;
  username: string;
  password: string;
  dob: Date | null;
};

export type signupResponse = {
  isError: boolean;
  errorText: string;
  errorOnInput: boolean | string;
  authUser: IUser | null;
};

export type usernameCheckResponse = {
  isError: boolean;
  message: string;
  errorOnInput: boolean;
  usernameQueryKey?: string;
};

export type newConnectionPingResponse = {
  isSent: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
  pingData?: connectionPingType;
};

export type MessageActionTranslations = {
  addReaction: string;
  editMessage: string;
  replyMessage: string;
  forwardMessage: string;
  copyText: string;
  deleteMessage: string;
  moreText: string;
};

export type SocketPresenseEvent = {
  type: string;
  availability: "online" | "offline" | "dnd" | "idle";
  userId: string;
};

export type GifCategory = {
  searchterm: string;
  path: string,
  image: string,
  name: string,
};

export interface GifData {
  id: string;
  preview: string;
  full: string;
  width: string | number;
  height: string | number;
}


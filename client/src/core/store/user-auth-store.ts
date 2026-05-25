import { create } from "zustand";
import type { IUser } from "@/core/types/schema";
import type { Socket } from "socket.io-client";

type userAuthStore = {
  authUser: IUser | null;
  isLoginIn: boolean;
  isSigningUp: boolean;
  isCheckingAuth: boolean;
  isCheckingUsername: boolean;
  socket: Socket | null;
  isPoolingReconnection: boolean;
  isIdle?: boolean,
};

const userAuthStore = create<userAuthStore>(() => ({
  authUser: null,
  isLoginIn: false,
  isSigningUp: false,
  isCheckingAuth: true,
  isCheckingUsername: false,
  socket: null,
  isPoolingReconnection: false,
}));

export default userAuthStore;






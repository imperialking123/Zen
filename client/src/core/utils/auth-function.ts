import type { AxiosError } from "axios";
import userAuthStore from "@/core/store/user-auth-store";
import userPresenseStore, {
  type OnlinePresenses,
} from "@/core/store/user-presense-store";
import type {
  GifData,
  loginDetails,
  signupDetails,
  signupResponse,
  usernameCheckResponse,
} from "../types";
import { axiosInstance } from ".";
import i8nextConfig from "../../../i18nextConfig";
import { io } from "socket.io-client";
import userConnectionStore from "@/core/store/user-connections-store";
import type {
  connectionPingType,
  ConnectionType,
  IConversation,
  IUser,
} from "@/core/types/schema";
import userChatStore from "@/core/store/user-chat-store";
import UserFavouriteStore from "@/core/store/user-favourite-store";

const translate = i8nextConfig.getFixedT(null, "auth");

type preloadType = {
  connections: ConnectionType[];
  sentConnectionPings: connectionPingType[];
  receivedConnectionPings: connectionPingType[];
  conversations: IConversation[];
  onlinePresenses: OnlinePresenses;
  favouriteGifs: Record<string, GifData>;
};

export const handlePreload = async () => {
  try {
    const res = await axiosInstance.get<preloadType>("/auth/preload");

    userConnectionStore.setState({
      connections: res.data.connections,
      sentConnectionPings: res.data.sentConnectionPings,
      receivedConnectionPings: res.data.receivedConnectionPings,
    });

    userPresenseStore.setState({
      onlinePresenses: res.data?.onlinePresenses || {},
    });

    userChatStore.setState({
      conversations: res.data.conversations,
    });

    UserFavouriteStore.setState({
      favouriteGifs: res.data.favouriteGifs,
    });
  } catch {
    console.log("Preload Failed");
  }
};

export const ConnectSocket = (userId: string) => {
  const BACKEND_SOCKET_URI = import.meta.env.VITE_BACKEND_URL;

  if (!BACKEND_SOCKET_URI) return;
  if (!userId) return;

  const socketInstance = userAuthStore.getState().socket;
  if (socketInstance) return;
  const newSocket = io(BACKEND_SOCKET_URI, {
    query: {
      userId: userId,
    },
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 15000,
  });
  userAuthStore.setState({ socket: newSocket });
};

export const handleCheckAuth = async () => {
  userAuthStore.setState({ isCheckingAuth: true });
  try {
    const res = await axiosInstance.get("/auth/check");
    const resData: IUser = res.data;

    userAuthStore.setState({ authUser: resData });
    ConnectSocket(resData._id);
    await handlePreload();
  } catch {
    userAuthStore.setState({ authUser: null });
  } finally {
    userAuthStore.setState({ isCheckingAuth: false });
  }
};

export const handleLogin = async (loginDetails: loginDetails) => {
  userAuthStore.setState({ isLoginIn: true });
  try {
    const res = await axiosInstance.post("/auth/login", { ...loginDetails });

    const returnObject = {
      isError: false,
      errorMessage: "",
      authUser: res.data.authUser,
    };

    return returnObject;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const returnObject = {
      isError: true,
      errorMessage: axiosError.response?.data.message
        ? translate(
            `login.form.errorTexts.SERVER_ERRORS.${axiosError.response?.data.message}`,
          )
        : translate("login.form.errorTexts.SERVER_ERRORS.NO_INTERNET"),
      authUser: null,
    };
    return returnObject;
  } finally {
    userAuthStore.setState({ isLoginIn: false });
  }
};

export const handleSignup = async (signupDetails: signupDetails) => {
  if (!signupDetails || typeof signupDetails !== "object") {
    return {
      isError: true,
      errorText: translate("somethingWentWrong"),
      errorOnInput: false,
      authUser: null,
    };
  }

  userAuthStore.setState({ isSigningUp: true });
  const payload = {
    displayName: (signupDetails.displayName || "").trim(),
    email: (signupDetails.email || "").trim().toLowerCase(),
    username: (signupDetails.username || "").trim().toLowerCase(),
    password: signupDetails.password || "",
    dob: signupDetails.dob || null,
  };

  try {
    const res = await axiosInstance.post("/auth/signup", payload);

    const resData: signupResponse = res.data;
    const authUser = resData.authUser;

    return {
      isError: false,
      errorText: "",
      errorOnInput: "",
      authUser: authUser,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      errorOnInput?: string;
    }>;

    const errorText = axiosError.response?.data?.message
      ? translate(
          `signup.form.errorTexts.SERVER_ERRORS.${axiosError.response?.data?.message}`,
        )
      : translate("signup.form.errorTexts.SERVER_ERRORS.NO_INTERNET");
    const errorOnInput = axiosError.response?.data?.errorOnInput || false;

    return {
      isError: true,
      errorText,
      errorOnInput,
      authUser: null,
    };
  } finally {
    userAuthStore.setState({ isSigningUp: false });
  }
};

export const handleCheckUsername = async (usernameQueryKey: string) => {
  try {
    const res = await axiosInstance.post("/auth/username/check", {
      usernameQueryKey: usernameQueryKey,
    });

    const resData: usernameCheckResponse = res.data;
    const message = translate(`signup.form.usernameCheck.${resData.message}`);

    const returnObject = {
      message: message,
      isError: resData.isError || false,
      errorOnInput: resData.errorOnInput,
      usernameQueryKey: resData?.usernameQueryKey || usernameQueryKey,
    };

    return returnObject;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message: string;
      isError: boolean;
      errorOnInput: boolean;
    }>;

    const message = translate(
      `signup.form.usernameCheck.${axiosError.response?.data.message}`,
    );

    const returnObject = {
      message: message,
      isError: axiosError.response?.data.isError || true,
      errorOnInput: axiosError.response?.data.errorOnInput,
      usernameQueryKey: usernameQueryKey,
    };

    return returnObject;
  }
};







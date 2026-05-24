import { isAxiosError } from "axios";
import i18next from "../../../i18nextConfig";

import type {
  GifData,
  IMessage,
} from "@/core/types/schema";
import dayjs from "dayjs";
const translate = i18next.getFixedT(null, "chat");
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import userChatStore from "@/core/store/user-chat-store";
import { axiosInstance } from "../utils";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const MAX_MESSAGE_PER_STORAGE = 120;

export const formatMessageTimestamp = (timestamp: string | Date) => {
  const msgDate = dayjs(timestamp).locale(i18next.language);

  if (msgDate.isToday()) {
    return msgDate.format("h:mm A");
  }

  if (msgDate.isYesterday()) {
    return `Yesterday ${msgDate.format("h:mm A")}`;
  }

  return msgDate.format("M/D/YYYY h:mm A");
};

export const formatSeparatorTimestamp = (
  createdAt: string | Date,
): string | null => {
  try {
    const createdAtDate = new Date(createdAt);

    const intlFormat = new Intl.DateTimeFormat(i18next.language, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const data = intlFormat.format(createdAtDate);
    return data;
  } catch (error) {
    console.log(
      "Failed to format language demarcation",
      (error as Error)?.message || error,
    );

    return null;
  }
};

export const formatDateForTooltip = (date: Date | string) => {
  return new Intl.DateTimeFormat(i18next.language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

export const formatDateSimpleStyle = (createdAt: string | Date) => {
  const intlFormat = new Intl.DateTimeFormat(i18next.language, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const returnString = intlFormat.format(new Date(createdAt));

  return returnString;
};

export const getMessages = async (conversationId: string) => {
  userChatStore.setState({ isGettingMessages: true });
  try {
    if (!conversationId) return;

    const alreadyFetched =
      userChatStore.getState().conversationMessagesFetchHistory.includes(conversationId);

    if (alreadyFetched) return;

    const conversation = userChatStore.getState().conversations.find((c) => c._id === conversationId);

    if (!conversation) return;

    type GetMessageResponse = {
      messages: IMessage[],
      hasMore: boolean,
    }

    const res = await axiosInstance.get<GetMessageResponse>(`/messages/get/all/${conversation.connectionId}`)
    const { messages, hasMore } = res.data;

    userChatStore.setState((state) => ({
      storedMessages: {
        ...state.storedMessages,
        [conversationId]: messages,
      },
      hasMoreTop: {
        ...state.hasMoreTop,
        [conversation._id]: hasMore
      },
      conversationMessagesFetchHistory: [
        ...state.conversationMessagesFetchHistory.filter(p => p !== conversationId),
        conversationId
      ],
    }));
  } catch (error) {
    console.log("Message Fetch Failed")
  } finally {
    userChatStore.setState({ isGettingMessages: false });
  }
};

export const initiateReplyTo = ({
  conversationId,
  messageId,
}: {
  conversationId: string;
  messageId: string;
}) => {
  const el = document.getElementById(messageId);

  const previousIniiated =
    userChatStore.getState().p2pInitiatedReply[conversationId];

  if (previousIniiated) {
    const el = document.getElementById(previousIniiated);
    if (el) {
      el.classList.remove("selectedReplyTo");
      el.classList.remove("message-blink");
    }
  }

  if (el) {
    el.classList.add("selectedReplyTo");
  }
  userChatStore.setState((state) => ({
    p2pInitiatedReply: {
      ...state.p2pInitiatedReply,
      [conversationId]: messageId,
    },
  }));
};

export const removeInitiatedReply = ({
  messageId,
  conversationId,
}: {
  messageId: string;
  conversationId: string;
}) => {
  const el = document.getElementById(messageId);

  if (el) {
    el.classList.remove("selectedReplyTo");
    el.classList.remove("message-blink");
  }

  userChatStore.setState((state) => {
    const { [conversationId]: _, ...rest } = state.p2pInitiatedReply;
    return {
      p2pInitiatedReply: rest,
    };
  });
};

export const SearchGiphy = async (
  query: string,
): Promise<{ gifData: GifData[]; isError: boolean }> => {
  try {
    if (!query || query.trim().length === 0) {
      return {
        gifData: [],
        isError: false,
      };
    }

    const res = await axiosInstance.get(
      `/gif/search/${query}/${i18next.language}`,
    );

    const resData: GifData[] = res.data.data;

    return {
      gifData: resData,
      isError: false,
    };
  } catch (error) {
    const isAxiosErr = isAxiosError(error);

    const message = isAxiosErr
      ? translate(`SearchGiphy.${error.message}`)
      : translate("NO_INTERNET");

    console.error("GIF Search Failed:", message);
    return {
      isError: true,
      gifData: [],
    };
  }
};

export const getEmojiUrl = (emoji: string) => {
  const emojiHex = (): string => {
    return Array.from(emoji)
      .map((char) => char.codePointAt(0)!.toString(16))
      .join("-");
  };

  return `${import.meta.env.VITE_BACKEND_URL}/api/emoji/${emojiHex()}`;
};








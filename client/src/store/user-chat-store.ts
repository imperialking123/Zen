import { create } from "zustand";
import type {
  Attachment,
  GifData,
  IConversation,
  IMessage,
} from "../types/schema";
import { axiosInstance } from "@/utils";

type sendP2PDefaultMessageType = {
  textInput: string;
  attachments: Attachment[];
  senderId: string;
  receiverId: string;
  conversationId: string;
  connectionId: string;
};

type sendP2PGifMessageProps = {
  gifData: GifData;
  senderId: string;
  receiverId: string;
  conversationId: string;
  connectionId: string;
};

type userChatStoreTypes = {
  conversations: IConversation[];
  selectedConversation: IConversation | null;
  isSearchingTenor: boolean;
  storedMessages: Record<string, IMessage[]>;
  isGettingMessages: boolean;

  hasMoreTop: Record<string, boolean>;
  hasMoreBottom: Record<string, boolean>;
  isViewingOld: Record<string, boolean>;
  p2pInitiatedReply: Record<string, string>;
  addConversation: (conversation: IConversation) => void;
  addPendingMessage: ({
    conversationId,
    message,
  }: {
    conversationId: string;
    message: IMessage;
  }) => void;

  updateMessageStatus: ({
    status,
    conversationId,
    tempId,
  }: {
    status: "sending" | "sent" | "delivered" | "read" | "failed";
    conversationId: string;
    tempId: string;
  }) => void;

  forwardMessage: ({
    conversationIds,
    messageContent,
  }: {
    messageContent: IMessage;
    conversationIds: string[];
  }) => void;

  deleteMessage: ({
    convoId,
    messageId,
    ignoreDBDelete,
  }: {
    convoId: string;
    messageId: string;
    ignoreDBDelete?: boolean;
  }) => void;

  getReactionCount: (count: number, locale: string) => string;
  addOrRemoveP2PMessageReaction: ({
    messageId,
    emoji,
    conversationId,
    userId,
    username,
    persistToServer,
  }: {
    messageId: string;
    emoji: string;
    conversationId: string;
    userId: string;
    username: string;
    persistToServer?: boolean;
  }) => void;

  sendP2PDefaultMessage: (props: sendP2PDefaultMessageType) => void;
  addMessageToState: (message: IMessage, conversationId: string) => void;
  updatedMessageOnConvoCreate: ({
    message,
    tempConvoId,
    receivedConvoData,
  }: {
    message: IMessage;
    tempConvoId: string;
    receivedConvoData: IConversation;
  }) => void;
  updateMessageOnSendComplete: ({
    message,
    conversationId,
    tempId,
  }: {
    message: IMessage;
    conversationId: string;
    tempId: string;
  }) => void;
  sendP2PGifMessage: (props: sendP2PGifMessageProps) => void;
  conversationMessagesFetchHistory: string[];
  editTextOnMessageId?: string;
  toggleShowEditMessage: (messageId: string) => void
};
const userChatStore = create<userChatStoreTypes>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  isSearchingTenor: false,
  storedMessages: {},
  isGettingMessages: false,

  hasMoreTop: {},
  isViewingOld: {},
  hasMoreBottom: {},
  p2pInitiatedReply: {},

  addConversation: (conversation) => {
    set({
      conversations: [
        ...get().conversations.filter((p) => p._id !== conversation._id),
        conversation,
      ],
    });
  },
  addPendingMessage: ({ message, conversationId }) => {
    const hasMoreBottom = get().hasMoreBottom[conversationId];

    if (!hasMoreBottom) {
      const messages = get().storedMessages[conversationId] || [];

      const allMessages = [...messages, message];

      set((s) => {
        return {
          storedMessages: {
            ...s.storedMessages,
            [conversationId]: allMessages,
          },
        };
      });
    }
  },
  updateMessageStatus: ({ status, conversationId, tempId }) => {
    const messages = get().storedMessages[conversationId] || [];

    const updatedMessages =
      messages.length > 0
        ? messages.map((msg) => {
          if (msg._id === tempId) {
            return {
              ...msg,
              status,
            };
          } else {
            return msg;
          }
        })
        : [];

    set((s) => {
      return {
        storedMessages: {
          ...s.storedMessages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  forwardMessage: async ({ conversationIds, messageContent }) => {
    const updateMessageStatus = get().updateMessageStatus;
    try {
      const res = await axiosInstance.post<{
        message: string;
        data: { conversationId: string }[];
      }>("/messages/forward", {
        messageContent,
        conversationIds: conversationIds,
      });

      const resData = res.data;

      resData.data.forEach((r) => {
        const { conversationId } = r;
        updateMessageStatus({
          conversationId: conversationId,
          tempId: messageContent._id,
          status: "sent",
        });
      });
    } catch (error) {
      conversationIds.forEach((id) => {
        updateMessageStatus({
          status: "failed",
          tempId: messageContent._id,
          conversationId: id,
        });
      });
      console.log("Failed to Forward Message");
    }
  },

  deleteMessage: async ({ convoId, messageId, ignoreDBDelete }) => {
    const allMessages = get().storedMessages[convoId] || [];

    const updatedMessages =
      allMessages.length > 0
        ? allMessages
          .filter((msg) => msg._id !== messageId) // Remove the message itself
          .map((msg) => {
            // Remove replyTo if it references the deleted message
            if (msg.replyTo?._id === messageId) {
              const { replyTo, ...messageWithoutReply } = msg;
              return messageWithoutReply as IMessage;
            }
            return msg;
          })
        : [];
    set((S) => {
      return {
        storedMessages: {
          ...S.storedMessages,
          [convoId]: updatedMessages,
        },
      };
    });

    if (ignoreDBDelete) return;
    try {
      await axiosInstance.delete(`/messages/delete`, {
        params: {
          convoId,
          messageId,
        },
      });
    } catch {
      console.log("Failed To Delete Message");
    }
  },

  getReactionCount: (count: number, locale: string = "en"): string => {
    if (count < 1000) {
      return new Intl.NumberFormat(locale).format(count);
    } else if (count < 1000000) {
      const k = count / 1000;
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: k < 10 ? 1 : 0 }).format(k)}K`;
    } else {
      const m = count / 1000000;
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: m < 10 ? 1 : 0 }).format(m)}M`;
    }
  },

  addOrRemoveP2PMessageReaction: ({
    messageId,
    emoji,
    username,
    conversationId,
    userId,
    persistToServer = true,
  }) => {
    set((s) => {
      const allMessages = s.storedMessages[conversationId];
      if (!allMessages?.length) return s;

      const msgIndex = allMessages.findIndex((msg) => msg._id === messageId);
      if (msgIndex === -1) return s;

      const msg = allMessages[msgIndex];
      const emojiReactions = msg.reactions?.[emoji] || [];
      const userAlreadyReacted = emojiReactions.some((r) => r._id === userId);

      const updatedEmojiReactions = userAlreadyReacted
        ? emojiReactions.filter((r) => r._id !== userId)
        : [...emojiReactions, { _id: userId, username }];

      const updatedReactions = { ...msg.reactions };
      if (updatedEmojiReactions.length === 0) {
        delete updatedReactions[emoji];
      } else {
        updatedReactions[emoji] = updatedEmojiReactions;
      }

      const updatedMessages = [...allMessages];
      updatedMessages[msgIndex] = { ...msg, reactions: updatedReactions };

      return {
        storedMessages: {
          ...s.storedMessages,
          [conversationId]: updatedMessages,
        },
      };
    });

    if (persistToServer) {
      axiosInstance
        .patch("/messages/react", { messageId, conversationId, emoji })
        .catch((error) => {
          console.log("Couldn't react to message", (error as Error)?.message);
        });
    }
  },

  sendP2PDefaultMessage: async (props) => {
    const {
      textInput,
      attachments,
      senderId,
      conversationId,
      receiverId,
      connectionId,
    } = props;

    if (
      (!textInput || textInput.trim().length === 0) &&
      (!attachments || attachments.length === 0)
    )
      return;

    const msgTempId = crypto.randomUUID().slice(0, 15);

    const date = new Date().toISOString();
    const newMessage: IMessage = {
      type: "default",
      receiverId: receiverId,
      senderId: senderId,
      createdAt: date,
      updatedAt: date,
      conversationId,
      _id: msgTempId,
      tempId: msgTempId,
      status: "sending",
    };
    const p2pInitiatedReply = get().p2pInitiatedReply;

    const replyTo = p2pInitiatedReply[conversationId];

    const isReplied = !!replyTo;

    if (isReplied && replyTo) {
      const messages = get().storedMessages[conversationId];
      const message = messages.find((m) => m._id === replyTo);

      if (message) {
        newMessage.isReplied = true;
        newMessage.replyTo = message;
      }
    }

    if (textInput.length > 0) {
      newMessage.text = textInput;
    }

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      newMessage["attachments"] = attachments;
    }

    // Update Message To State.
    set((s) => {
      const getInitiatedReply = s.p2pInitiatedReply;
      delete getInitiatedReply[conversationId];
      return {
        p2pInitiatedReply: getInitiatedReply,
      };
    });
    get().addMessageToState(newMessage, conversationId);

    let getConvo = get().conversations.find((p) => p._id === conversationId);
    /*---------------- */

    // Settle Conversation Wall by Getting and updating state
    if (!getConvo || getConvo.isTemp) {
      try {
        const convoGetRes = await axiosInstance.post<IConversation>(
          "/conversations/create",
          {
            connectionId,
          },
        );

        getConvo = convoGetRes.data;

        set((s) => ({
          selectedConversation:
            s.selectedConversation?._id === conversationId
              ? convoGetRes.data
              : s.selectedConversation,
        }));
      } catch (error) {
        // Show a UI and force user to refresh
        console.log("Failed to retrieve convo Data. Something Went Wrong");
        get().updateMessageStatus({
          status: "failed",
          conversationId,
          tempId: msgTempId,
        });
      }
    }
    if (!getConvo) {
      get().updateMessageStatus({
        status: "failed",
        conversationId,
        tempId: msgTempId,
      });
      return;
    }

    const formData = new FormData();

    formData.append("receiverId", newMessage.receiverId);
    formData.append("conversationId", newMessage.conversationId);
    formData.append("type", "default");

    if (textInput && textInput.length > 0) {
      formData.append("text", textInput);
    }

    if (newMessage.replyTo) {
      formData.append("replyTo", replyTo);
    }

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.file) {
          formData.append("attachment", attachment.file);
        }
      }
    }

    try {
      const sendMsgRes = await axiosInstance.post("/messages/send", formData);
      get().updateMessageOnSendComplete({
        message: sendMsgRes.data,
        conversationId: getConvo._id,
        tempId: msgTempId,
      });
    } catch (error) {
      console.log("Message Send Failed Show UI");
      return;
    }
  },

  addMessageToState(message, conversationId) {
    set((s) => {
      const storeMessages = s.storedMessages[conversationId];
      if (!storeMessages?.length) return s;

      const msgIndex = storeMessages.findIndex((m) => m._id === message._id);

      // message doesn't exist, add it
      if (msgIndex === -1)
        return {
          storedMessages: {
            ...s.storedMessages,
            [conversationId]: [...storeMessages, message],
          },
        };

      // message exists, replace it
      const updatedMessages = [...storeMessages];
      updatedMessages[msgIndex] = message;

      return {
        storedMessages: {
          ...s.storedMessages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },

  updatedMessageOnConvoCreate: ({
    message,
    tempConvoId,
    receivedConvoData,
  }) => {
    set((s) => {
      const { [tempConvoId]: _, ...remainingMessages } = s.storedMessages;
      const storeMessages = remainingMessages[receivedConvoData._id] || [];

      const msgIndex = storeMessages.findIndex((m) => m._id === message._id);

      const updatedMessages = [...storeMessages];
      if (msgIndex === -1) {
        updatedMessages.push(message);
      } else {
        updatedMessages[msgIndex] = message;
      }

      return {
        storedMessages: {
          ...remainingMessages,
          [receivedConvoData._id]: updatedMessages,
        },
      };
    });
  },

  updateMessageOnSendComplete: ({ message, conversationId, tempId }) => {
    set((s) => {
      const messages = s.storedMessages[conversationId] || [];

      const messageIndex = messages.findIndex(
        (msg) => msg._id === tempId || msg.tempId === tempId,
      );

      if (messageIndex === -1) return s;

      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = message;

      return {
        storedMessages: {
          ...s.storedMessages,
          [conversationId]: updatedMessages,
        },
      };
    });
  },
  sendP2PGifMessage: async (props) => {
    const { gifData, senderId, conversationId, receiverId, connectionId } =
      props;

    if (!gifData || !gifData.preview || !gifData.full) return;

    const msgTempId = crypto.randomUUID().slice(0, 15);

    const date = new Date().toISOString();
    const newMessage: IMessage = {
      type: "gif",
      receiverId: receiverId,
      senderId: senderId,
      createdAt: date,
      updatedAt: date,
      conversationId,
      _id: msgTempId,
      tempId: msgTempId,
      status: "sending",
      gif: gifData,
    };

    const p2pInitiatedReply = get().p2pInitiatedReply;

    const replyTo = p2pInitiatedReply[conversationId];

    const isReplied = !!replyTo;

    if (isReplied && replyTo) {
      const messages = get().storedMessages[conversationId];
      const message = messages.find((m) => m._id === replyTo);

      if (message) {
        newMessage.isReplied = true;
        newMessage.replyTo = message;
      }
    }

    set((s) => {
      const getInitiatedReply = s.p2pInitiatedReply;
      delete getInitiatedReply[conversationId];
      return {
        p2pInitiatedReply: getInitiatedReply,
      };
    });
    // Update Message To State.
    get().addMessageToState(newMessage, conversationId);

    let getConvo = get().conversations.find((p) => p._id === conversationId);
    /*---------------- */

    // Settle Conversation Wall by Getting and updating state
    if (!getConvo || getConvo.isTemp) {
      try {
        const convoGetRes = await axiosInstance.post<IConversation>(
          "/conversations/create",
          {
            connectionId,
          },
        );

        getConvo = convoGetRes.data;

        set((s) => ({
          selectedConversation:
            s.selectedConversation?._id === conversationId
              ? convoGetRes.data
              : s.selectedConversation,
        }));
      } catch (error) {
        // Show a UI and force user to refresh
        console.log("Failed to retrieve convo Data. Something Went Wrong");
        get().updateMessageStatus({
          status: "failed",
          conversationId,
          tempId: msgTempId,
        });
      }
    }
    if (!getConvo) {
      get().updateMessageStatus({
        status: "failed",
        conversationId,
        tempId: msgTempId,
      });
      return;
    }

    const { replyTo: _, ...rest } = newMessage;

    const payload = {
      ...rest,
      replyTo,
    };

    try {
      const sendMsgRes = await axiosInstance.post("/messages/send", payload);
      get().updateMessageOnSendComplete({
        message: sendMsgRes.data,
        conversationId: getConvo._id,
        tempId: msgTempId,
      });
    } catch (error) {
      console.log("Message Send Failed Show UI");
      return;
    }
  },
  conversationMessagesFetchHistory: [],
  toggleShowEditMessage: (messageId) => {
    set((state) => ({
      editTextOnMessageId: state.editTextOnMessageId === messageId ? undefined : messageId
    }));
  }
}));

export default userChatStore;

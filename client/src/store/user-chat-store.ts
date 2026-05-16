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
  handleSentMessageResponse: (
    message: IMessage,
    tempConversationId: string,
    msgTempId: string,
    newConversation?: IConversation,
  ) => void;
  addMessageToState: (message: IMessage, conversationId: string) => void;
  sendP2PGifMessage: (props: sendP2PGifMessageProps) => void;
  conversationMessagesFetchHistory: string[];
  editTextOnMessageId?: string;
  toggleShowEditMessage: (messageId: string) => void;
  editMessage: (
    conversationId: string,
    modifiedText: string,
    messageId: string,
  ) => void;
  removeAttachment: (params: {
    msgIndex: number;
    fileId: string;
    convoId: string;
    persistToServer?: boolean;
  }) => Promise<void>;
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


    const formData = new FormData();
    formData.append("receiverId", newMessage.receiverId);
    formData.append("conversationId", newMessage.conversationId);
    formData.append("connectionId", connectionId);
    formData.append("type", "default");

    if (textInput && textInput.length > 0) {
      formData.append("text", textInput);
    }

    if (newMessage.replyTo) {
      formData.append("replyTo", replyTo);
    }

    if (!getConvo) {
    }

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.file) {
          formData.append("attachment", attachment.file);
          if (attachment.type === "video" || attachment.type === "image") {
            formData.append("blurHash", attachment.blurHash);
          }
        }
      }
    }

    try {
      const sendMsgRes = await axiosInstance.post<{ message: IMessage, newConversation?: IConversation }>("/messages/send", formData);

      const { message, newConversation } = sendMsgRes.data;

      get().handleSentMessageResponse(message, conversationId, msgTempId, newConversation);

    } catch (error) {
      get().updateMessageStatus({
        status: "failed",
        conversationId,
        tempId: conversationId,
      });
    }
  },

  handleSentMessageResponse: (message, tempConversationId, msgTempId, newConversation) => {
    set((s) => {
      // CASE 1 - existing conversation, just swap the temp message in-place
      if (!newConversation) {
        const messages = s.storedMessages[message.conversationId] || [];
        const msgIndex = messages.findIndex(
          (msg) => msg._id === msgTempId || msg.tempId === msgTempId,
        );

        if (msgIndex === -1) return s;

        const updatedMessages = [...messages];
        updatedMessages[msgIndex] = message;

        return {
          storedMessages: {
            ...s.storedMessages,
            [message.conversationId]: updatedMessages,
          },
        };
      }

      // CASE 2 - new conversation was created
      // Add the new conversation to the list
      const updatedConversations = [
        ...s.conversations.filter((p) => p._id !== newConversation._id),
        newConversation,
      ].sort((a, b) => {
        const dateA = new Date(a.updateAt || a.createdAt).getTime();
        const dateB = new Date(b.updateAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      // Handle messages under the new conversationId
      const existingMessages = s.storedMessages[message.conversationId];
      let updatedMessages: IMessage[];

      if (existingMessages && existingMessages.length > 0) {
        // Swap the temp message in-place
        const msgIndex = existingMessages.findIndex(
          (msg) => msg._id === msgTempId || msg.tempId === msgTempId,
        );

        if (msgIndex !== -1) {
          updatedMessages = [...existingMessages];
          updatedMessages[msgIndex] = message;
        } else {
          updatedMessages = [...existingMessages, message];
        }
      } else {
        // No existing messages, just add it
        updatedMessages = [message];
      }

      // If the user is currently viewing the temp conversation, update selectedConversation
      const isViewingTempConvo =
        s.selectedConversation?._id === tempConversationId;

      return {
        conversations: updatedConversations,
        storedMessages: {
          ...s.storedMessages,
          [message.conversationId]: updatedMessages,
        },
        ...(isViewingTempConvo && {
          selectedConversation: newConversation,
        }),
      };
    });
  },

  addMessageToState(message, conversationId) {
    set((s) => {
      const storeMessages = s.storedMessages[conversationId] ?? [];

      const msgIndex = storeMessages.findIndex((m) => m._id === message._id);

      if (msgIndex === -1)
        return {
          storedMessages: {
            ...s.storedMessages,
            [conversationId]: [...storeMessages, message],
          },
        };

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

    if (replyTo) {
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

    get().addMessageToState(newMessage, conversationId);

    try {
      const sendMsgRes = await axiosInstance.post<{ message: IMessage; newConversation?: IConversation }>("/messages/send", {
        receiverId,
        conversationId,
        connectionId,
        type: "gif",
        gif: gifData,
        ...(replyTo && { replyTo }),
      });

      const { message, newConversation } = sendMsgRes.data;
      get().handleSentMessageResponse(message, conversationId, msgTempId, newConversation);
    } catch (error) {
      get().updateMessageStatus({
        status: "failed",
        conversationId,
        tempId: msgTempId,
      });
    }
  },
  conversationMessagesFetchHistory: [],
  toggleShowEditMessage: (messageId) => {
    set((state) => ({
      editTextOnMessageId:
        state.editTextOnMessageId === messageId ? undefined : messageId,
    }));
  },
  editMessage: async (conversationId, modifiedText, messageId) => {
    const messages = get().storedMessages[conversationId] || [];
    const message = messages.find((msg) => msg._id === messageId);

    if (!message || message.type !== "default" || !message.text) {
      return;
    }

    const originalText = message.text;

    if (originalText.trim() === modifiedText.trim()) {
      return;
    }

    try {
      set((state) => {
        const updatedMessages = state.storedMessages[conversationId].map(
          (msg) =>
            msg._id === messageId
              ? { ...msg, text: modifiedText, status: "editing" as const }
              : msg,
        );

        return {
          storedMessages: {
            ...state.storedMessages,
            [conversationId]: updatedMessages,
          },
        };
      });

      const response = await axiosInstance.patch("/messages/edit", {
        messageId,
        conversationId,
        modifiedText,
      });

      set((state) => {
        const confirmedMessages = state.storedMessages[conversationId].map(
          (msg) =>
            msg._id === messageId
              ? { ...msg, ...response.data, status: "sent" as const }
              : msg,
        );

        return {
          storedMessages: {
            ...state.storedMessages,
            [conversationId]: confirmedMessages,
          },
        };
      });
    } catch (error) {
      set((state) => {
        const revertedMessages = state.storedMessages[conversationId].map(
          (msg) =>
            msg._id === messageId
              ? { ...msg, text: originalText, status: "sent" as const }
              : msg,
        );

        return {
          storedMessages: {
            ...state.storedMessages,
            [conversationId]: revertedMessages,
          },
        };
      });
    }
  },

  removeAttachment: async ({
    msgIndex,
    fileId,
    convoId,
    persistToServer = true,
  }) => {
    const messages = get().storedMessages[convoId];
    if (!messages) return;

    const message = messages[msgIndex];
    if (!message) return;

    if (message.type !== "default" || !message.attachments) return;

    // Update the message by removing the attachment with the specified ID
    set((state) => {
      const updatedMessages = [...messages];
      updatedMessages[msgIndex] = {
        ...message,
        attachments:
          message.attachments?.filter((att) => att.fileId !== fileId) || [],
        updatedAt: new Date().toISOString(),
      };

      return {
        storedMessages: {
          ...state.storedMessages,
          [convoId]: updatedMessages,
        },
      };
    });

    if (!persistToServer) return;

    try {
      await axiosInstance.post("/messages/remove-attachment", {
        msgIndex,
        fileId,
        convoId,
      });
    } catch (error) {
      // Undo the update if server request fails
      set((state) => {
        const currentMessages = state.storedMessages[convoId] || [];
        const revertedMessages = [...currentMessages];
        const currentMessage = revertedMessages.find(
          (msg) => msg._id === message._id,
        );

        if (currentMessage) {
          const messageIndex = revertedMessages.findIndex(
            (msg) => msg._id === message._id,
          );
          revertedMessages[messageIndex] = message;
        }

        return {
          storedMessages: {
            ...state.storedMessages,
            [convoId]: revertedMessages,
          },
        };
      });
    }
  },
}));

export default userChatStore;

import { axiosInstance } from "..";
import userChatStore from "../../store/user-chat-store";
import userPresenceStore from "../../store/user-presense-store";
import type { IConversation, IMessage } from "../../types/schema";

const timeoutMap = new Map<string, number>();
const TYPING_RECEIVE_CLEANUP_MS = 4000;


export const HANDLE_NEW_TYPING = (userId: string) => {
  if (timeoutMap.has(userId)) {
    const timeout = timeoutMap.get(userId);
    clearTimeout(timeout);
    timeoutMap.delete(userId);
  }

  const setIsTyping = userPresenceStore.getState().setIsTyping;
  const removeIsTyping = userPresenceStore.getState().removeTyping;
  setIsTyping(userId);
  const timeout = setTimeout(() => {
    removeIsTyping(userId);
  }, TYPING_RECEIVE_CLEANUP_MS);
  timeoutMap.set(userId, timeout);
};

export const HANDLE_RECEIVE_NEW_MESSAGE = async (message: IMessage, newConversation?: IConversation) => {

  try {
    const { conversations, hasMoreBottom, selectedConversation } =
      userChatStore.getState();

    userPresenceStore.getState().removeTyping(message.senderId);

    if (newConversation) {
      userChatStore.getState().addConversation(newConversation);

      // Check if the user has a temp conversation selected that matches this new one
      // by comparing connectionId — this is the "uno reverse" of handleSentMessageResponse
      const isViewingMatchingTempConvo =
        selectedConversation?.isTemp &&
        selectedConversation?.connectionId &&
        newConversation.connectionId &&
        selectedConversation.connectionId === newConversation.connectionId;

      if (isViewingMatchingTempConvo) {
        userChatStore.setState((state) => {
          const tempConvoId = selectedConversation!._id;
          const existingMessages = state.storedMessages[tempConvoId] || [];

          return {
            selectedConversation: newConversation,
            storedMessages: {
              ...state.storedMessages,
              // Move messages from temp convo key to real convo key
              [newConversation._id]: [
                ...existingMessages.filter((m) => m._id !== message._id),
                message,
              ],
            },
          };
        });
        return;
      }
    }

    let findConvo = conversations.find((p) => p._id === message.conversationId);

    if (!findConvo) {
      const res = await axiosInstance.get(
        `/conversations/get/${message.conversationId}`,
      );

      const resData: IConversation = res.data;

      if (!resData) {
        console.error("Failed to fetch conversation");
        return;
      }
      findConvo = resData;

      userChatStore.setState((state) => ({
        conversations: [
          ...state.conversations.filter((p) => p._id !== resData?._id),
          resData,
        ],
      }));
    }

    const convoId = findConvo._id;
    const isSelected = selectedConversation?._id === convoId;
    const hasMoreAtBottom = hasMoreBottom[convoId];

    const incrementUnreadCount = {
      ...(findConvo.unreadCount || {}),
      [message.receiverId || ""]:
        (findConvo.unreadCount?.[message.receiverId || ""] || 0) + 1,
    };

    if (isSelected) {
      if (hasMoreAtBottom) {
        console.log("HASMOREATBOTTOM --->", hasMoreAtBottom);

        userChatStore.setState((state) => {
          return {
            isViewingOld: {
              ...state.isViewingOld,
              [message.conversationId as string]: true,
            },
          };
        });

        return;
      } else {
        userChatStore.setState((state) => {
          const updatedFindConvo = {
            ...findConvo,
            unreadCount: incrementUnreadCount,
          };

          const allMessages =
            state.storedMessages[message.conversationId] || [];
          const updatedMessages = [
            ...allMessages.filter((p) => p._id !== message._id),
            message,
          ];

          return {
            conversations: [
              ...state.conversations.filter((p) => p._id !== convoId),
              updatedFindConvo,
            ],
            storedMessages: {
              ...state.storedMessages,
              [convoId]: updatedMessages,
            },
            selectedConversation: updatedFindConvo,
          };
        });
      }
    } else {
      if (hasMoreAtBottom) {
        userChatStore.setState((state) => {
          const updatedFindConvo = {
            ...findConvo,
            unreadCount: incrementUnreadCount,
          };
          return {
            conversations: [
              ...state.conversations.filter((p) => p._id !== findConvo._id),
              updatedFindConvo,
            ],
            isViewingOld: {
              ...state.isViewingOld,
              [message.conversationId as string]: true,
            },
          };
        });
      } else {
        userChatStore.setState((state) => {
          const allMessages =
            state.storedMessages[message.conversationId as string] || [];

          const restructuredMessages = [
            ...allMessages.filter((m) => m._id !== message._id),
            message,
          ];
          return {
            storedMessages: {
              ...state.storedMessages,
              [message.conversationId]: restructuredMessages,
            },
          };
        });
      }
    }
  } catch (error) {
    console.error(
      "Could not receive message:",
      error instanceof Error ? error.message : error,
    );
  }
};

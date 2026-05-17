import userChatStore from "@/core/store/user-chat-store";
import type { IMessage } from "@/core/types/schema";
import { useShallow } from "zustand/shallow";

const EMPTY_MESSAGES: IMessage[] = [];

const useConversationMessages = (conversationId?: string) => {
  return userChatStore(
    useShallow((state) => {
      if (!conversationId) return EMPTY_MESSAGES;
      return state.storedMessages[conversationId] || EMPTY_MESSAGES;
    }),
  );
};

export default useConversationMessages;






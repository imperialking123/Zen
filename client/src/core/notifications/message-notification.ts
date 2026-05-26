import userAuthStore from "@/core/store/user-auth-store";
import userChatStore from "@/core/store/user-chat-store";
import { playMessageSoundIfAway } from "@/core/notifications/notification";
import type { IMessage } from "@/core/types/schema";
import {
  dispatchWrapperCustomEvent,
  WrapperCustomEventDetailType,
} from "./wrapper-custom-event";
import {
  getMessageWrapperElement,
  isScrolledAwayFromBottom,
  scrollMessageWrapperToBottom,
} from "../utils";
import { clearConversationUnread } from "../utils/chat-functions";

const isOwnMessage = (message: IMessage): boolean => {
  const authUserId = userAuthStore.getState().authUser?._id;
  return Boolean(authUserId && message.senderId === authUserId);
};

export const handleMessageNotification = (message: IMessage) => {
  if (!message || isOwnMessage(message)) return;

  const { conversations, selectedConversation } = userChatStore.getState();

  const conversation = conversations.find(
    (convo) => convo._id === message.conversationId,
  );

  if (!conversation) return;

  const isSelectedConversation =
    selectedConversation?._id === message.conversationId;

  if (isSelectedConversation) {
    const wrapper = getMessageWrapperElement();
    if (!wrapper) return;
    const isScrolledAway = isScrolledAwayFromBottom(wrapper);
    if (!isScrolledAway) {
      clearConversationUnread(conversation._id);
      scrollMessageWrapperToBottom();
      return;
    }

    dispatchWrapperCustomEvent(wrapper, {
      type: WrapperCustomEventDetailType.NEW_MESSAGES_BOTTOM,
    });
    return;
  }

  playMessageSoundIfAway(userAuthStore.getState().isIdle);
};

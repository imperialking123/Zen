import userChatStore from "@/core/store/user-chat-store";
import type {
  connectionPingType,
  ConnectionType,
  IConversation,
  IMessage,
} from "@/core/types/schema";
import { HANDLE_NEW_TYPING, HANDLE_RECEIVE_NEW_MESSAGE, HANDLE_CONVERSATION_UNREAD_CLEARED } from "./chat-events";
import {
  HANDLE_ADD_CONNECTION_PING,
  HANDLE_ADD_NEW_CONNECTION,
  HANDLE_ADD_NEW_PRESENSE,
  HANDLE_REMOVE_CONNECTION,
  HANDLE_REMOVE_USER_PRESENSE,
} from "./connection-event";

// ADD EVENT TYPES
type AddReceivedPingEvent = {
  type: "ADD_RECEIVED_PING";
  pingData: connectionPingType;
};

type AddNewConnectionEvent = {
  type: "ADD_NEW_CONNECTION";
  connectionData: ConnectionType;
  documentId: string;
};

type AddNewPresenseEvent = {
  type: "ADD_NEW_PRESENSE";
  userId: string;
  availability: "online" | "offline" | "dnd" | "idle";
};

type TypingReceiveEvent = {
  type: "TYPING_RECEIVE";
  userId: string;
};

type ReceiveMessageEvent = {
  type: "RECEIVE_MESSAGE";
  message: IMessage;
  newConversation?: IConversation;
};

type ConversationUnreadClearedEvent = {
  type: "CONVERSATION_UNREAD_CLEARED";
  conversationId: string;
};

type ADD_EVENT_CASES_TYPES =
  | AddReceivedPingEvent
  | AddNewConnectionEvent
  | AddNewPresenseEvent
  | TypingReceiveEvent
  | ReceiveMessageEvent
  | ConversationUnreadClearedEvent;

// REMOVE EVENT TYPES
type RemoveConnectionEvent = {
  type: "REMOVE_CONNECTION";
  documentId: string;
};

type RemoveUserPresenceEvent = {
  type: "REMOVE_USER_PRESENSE";
  userId: string;
};

type DeleteMessageEvent = {
  type: "DELETE_MESSAGE";
  conversationId: string;
  messageId: string;
};

type REMOVE_EVENT_CASES_TYPES =
  | RemoveConnectionEvent
  | RemoveUserPresenceEvent
  | DeleteMessageEvent;

// UPDATE EVENT TYPES
type ReactEvent = {
  type: "react";
  messageId: string;
  conversationId: string;
  emoji: string;
  reactedBy: string;
  reactedByUsername: string;
};

type UPDATE_EVENT_CASES_TYPES = ReactEvent;

export const handleEventAdd = (args: ADD_EVENT_CASES_TYPES) => {
  switch (args.type) {
    case "ADD_RECEIVED_PING":
      HANDLE_ADD_CONNECTION_PING(args.pingData);
      break;

    case "ADD_NEW_CONNECTION":
      HANDLE_ADD_NEW_CONNECTION(args.connectionData, args.documentId);
      break;

    case "ADD_NEW_PRESENSE":
      HANDLE_ADD_NEW_PRESENSE(args);
      break;

    case "TYPING_RECEIVE":
      HANDLE_NEW_TYPING(args.userId);
      break;

    case "RECEIVE_MESSAGE":
      void HANDLE_RECEIVE_NEW_MESSAGE(args.message, args.newConversation);
      break;

    case "CONVERSATION_UNREAD_CLEARED":
      HANDLE_CONVERSATION_UNREAD_CLEARED(args.conversationId);
      break;
  }
};

const deleteMessage = userChatStore.getState().deleteMessage;
const addOrRemoveP2PMessageReaction =
  userChatStore.getState().addOrRemoveP2PMessageReaction;

export const handleEventRemove = (args: REMOVE_EVENT_CASES_TYPES) => {
  switch (args.type) {
    case "REMOVE_CONNECTION":
      HANDLE_REMOVE_CONNECTION(args.documentId);
      break;

    case "REMOVE_USER_PRESENSE":
      HANDLE_REMOVE_USER_PRESENSE(args.userId);
      break;

    case "DELETE_MESSAGE":
      deleteMessage({
        convoId: args.conversationId,
        messageId: args.messageId,
        ignoreDBDelete: true,
      });
  }
};

export const handleEventUpdate = (args: UPDATE_EVENT_CASES_TYPES) => {
  switch (args.type) {
    case "react":
      addOrRemoveP2PMessageReaction({
        messageId: args.messageId,
        conversationId: args.conversationId,
        emoji: args.emoji,
        userId: args.reactedBy,
        username: args.reactedByUsername,
        persistToServer: false,
      });
      break;
  }
};

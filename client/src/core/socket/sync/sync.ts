import userChatStore from "@/core/store/user-chat-store";
import type { connectionPingType, ConnectionType } from "@/core/types/schema";
import { HANDLE_REMOVE_CONNECTION } from "@/core/socket/connection-event";
import {
  SYNC_CONNECTIONS,
  ADD_SENT_PING_WITH_SYNC,
  REMOVE_RECEIVED_PING,
  REMOVE_SENT_PING_WITH_SYNC,
} from "./connectionSync";
import type { GifData } from "@/core/types";
import UserFavouriteStore from "@/core/store/user-favourite-store";

// SYNC REMOVE EVENT TYPES
type RemoveSentPingSync = {
  type: "REMOVE_SENT_PING";
  documentId: string;
};

type RemoveReceivedPingSync = {
  type: "REMOVE_RECEIVED_PING";
  documentId: string;
};

type RemoveConnectionSync = {
  type: "REMOVE_CONNECTION";
  documentId: string;
};

type DeleteMessageSync = {
  type: "DELETE_MESSAGE";
  messageId: string;
  conversationId: string;
};

type SYNC_REMOVE_TYPES =
  | RemoveSentPingSync
  | RemoveReceivedPingSync
  | RemoveConnectionSync
  | DeleteMessageSync;

// SYNC ADD EVENT TYPES
type AddSentPingSync = {
  type: "ADD_SENT_PING";
  connectionPing: connectionPingType;
};

type AddConnectionSync = {
  type: "ADD_CONNECTION";
  connectionData: ConnectionType;
  documentId: string;
};

type SYNC_ADD_TYPES = AddSentPingSync | AddConnectionSync;

// SYNC UPDATE EVENT TYPES
type ReactSyncEvent = {
  type: "react";
  messageId: string;
  conversationId: string;
  emoji: string;
  reactedBy: string;
  reactedByUsername: string;
};

type GifUpdateSyncEvent = {
  type: "gif";
  gif: GifData;
};

type SYNC_UPDATE_TYPES = ReactSyncEvent | GifUpdateSyncEvent;

const deleteMessage = userChatStore.getState().deleteMessage;
const addOrRemoveP2PMessageReaction =
  userChatStore.getState().addOrRemoveP2PMessageReaction;

export const handleSyncRemove = (arg: SYNC_REMOVE_TYPES) => {
  switch (arg.type) {
    case "REMOVE_SENT_PING":
      REMOVE_SENT_PING_WITH_SYNC(arg.documentId);
      break;

    case "REMOVE_RECEIVED_PING":
      REMOVE_RECEIVED_PING(arg.documentId);
      break;

    case "REMOVE_CONNECTION":
      HANDLE_REMOVE_CONNECTION(arg.documentId);
      break;

    case "DELETE_MESSAGE":
      deleteMessage({ messageId: arg.messageId, convoId: arg.conversationId });
      break;
  }
};

export const handleSyncAdd = (arg: SYNC_ADD_TYPES) => {
  switch (arg.type) {
    case "ADD_SENT_PING":
      ADD_SENT_PING_WITH_SYNC(arg.connectionPing);
      break;

    case "ADD_CONNECTION":
      SYNC_CONNECTIONS(arg.connectionData, arg.documentId);
      break;
  }
};

export const handleSyncUpdate = (args: SYNC_UPDATE_TYPES) => {
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

    case "gif":
      UserFavouriteStore.getState().toggleFavourite(args.gif, true);
      break;
  }
};






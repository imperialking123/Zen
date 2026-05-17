import { notificationService } from "@/core/utils";

import userPresenseStore from "@/core/store/user-presense-store";
import userConnectionStore from "@/core/store/user-connections-store";
import type { SocketPresenseEvent } from "@/core/types";
import type { connectionPingType, ConnectionType } from "@/core/types/schema";

export const HANDLE_ADD_CONNECTION_PING = (args: connectionPingType | null) => {
  if (!args) return;
  const existingReceivedPings =
    userConnectionStore.getState().receivedConnectionPings;

  const filteredConnections = existingReceivedPings.filter(
    (connection) => connection._id !== args._id,
  );

  userConnectionStore.setState({
    receivedConnectionPings: [...filteredConnections, args],
  });

  notificationService.playConnection();
};

export const HANDLE_ADD_NEW_CONNECTION = (
  connectionData: ConnectionType | null,
  documentId: string | null,
) => {
  if (!documentId || !connectionData) return;

  /// Reason is user cannot accept connection when they are not the receiver of the ping
  const allSentConnectionPings =
    userConnectionStore.getState().sentConnectionPings;
  const allConnections = userConnectionStore.getState().connections;

  userConnectionStore.setState({
    sentConnectionPings: [
      ...allSentConnectionPings.filter((cn) => cn._id !== documentId),
    ],
    connections: [
      ...allConnections.filter((cn) => cn?._id !== connectionData._id),
      connectionData,
    ],
  });
};

export const HANDLE_REMOVE_CONNECTION = (documentId: string | undefined) => {
  if (!documentId) return;

  userConnectionStore.setState((state) => {
    return {
      connections: state.connections.filter((p) => p._id !== documentId),
    };
  });
};

export const HANDLE_ADD_NEW_PRESENSE = (presence: SocketPresenseEvent) => {
  if (!presence || !presence.userId || !presence.availability) return;

  const setPresense = userPresenseStore.getState().setPresence;
  setPresense(presence.userId, presence.availability);
};

export const HANDLE_REMOVE_USER_PRESENSE = (userIdToRemove: string) => {
  userPresenseStore.setState((state) => {
    const newPresenses = { ...state.onlinePresenses };
    delete newPresenses[userIdToRemove];
    return { onlinePresenses: newPresenses };
  });
};






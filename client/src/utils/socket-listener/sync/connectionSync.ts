import userConnectionStore from "../../../store/user-connections-store";
import type { connectionPingType, ConnectionType } from "../../../types/schema";

export const REMOVE_SENT_PING_WITH_SYNC = (id: string | undefined | null) => {
  if (!id) return;
  const allSentPings = userConnectionStore.getState().sentConnectionPings;

  userConnectionStore.setState({
    sentConnectionPings: [...allSentPings.filter((p) => p._id !== id)],
  });
};

export const ADD_SENT_PING_WITH_SYNC = (
  connectionPing: connectionPingType | null | undefined,
) => {
  if (!connectionPing) return;
  const AllSentPing = userConnectionStore.getState().sentConnectionPings;

  userConnectionStore.setState({
    sentConnectionPings: [
      ...AllSentPing.filter((p) => p._id !== connectionPing._id),
      connectionPing,
    ],
  });
};

export const REMOVE_RECEIVED_PING = (id: string | undefined | null) => {
  if (!id) return;
  const allConnectionPings =
    userConnectionStore.getState().receivedConnectionPings;

  userConnectionStore.setState({
    receivedConnectionPings: [
      ...allConnectionPings.filter((p) => p._id !== id),
    ],
  });
};

export const REMOVE_CONNECTION = (documentId: string | undefined) => {
  if (!documentId) return;

  userConnectionStore.setState((state) => {
    return {
      connections: state.connections.filter((p) => p._id !== documentId),
    };
  });
};

export const SYNC_CONNECTIONS = (
  connectionData: ConnectionType,
  documentId: string | null | undefined,
) => {
  if (!connectionData || typeof connectionData !== "object" || !documentId)
    return;

  const allConnections = userConnectionStore.getState().connections;
  const allReceivedPings =
    userConnectionStore.getState().receivedConnectionPings;

  userConnectionStore.setState({
    connections: [
      ...allConnections.filter((cn) => cn._id !== connectionData._id),
      connectionData,
    ],

    receivedConnectionPings: [
      ...allReceivedPings.filter((cn) => cn._id !== documentId?.toString()),
    ],
  });
};

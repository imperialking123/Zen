import { create } from "zustand";
import type { connectionPingType, ConnectionType } from "@/core/types/schema";

type userConnectionStoreTypes = {
  connections: ConnectionType[];
  selectedConnection: ConnectionType | null;
  onlineConnections: string[];
  receivedConnectionPings: connectionPingType[];
  sentConnectionPings: connectionPingType[];
  deletingConnection: string[];
};

const userConnectionStore = create<userConnectionStoreTypes>(() => ({
  connections: [],
  selectedConnection: null,
  onlineConnections: [],
  receivedConnectionPings: [],
  sentConnectionPings: [],
  deletingConnection: [],
}));

export default userConnectionStore;






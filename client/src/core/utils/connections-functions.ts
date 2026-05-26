import type { AxiosError } from "axios";
import i8nextConfig from "../../../i18nextConfig";
import { axiosInstance } from ".";
import userConnectionStore from "@/core/store/user-connections-store";
import type { connectionPingType, ConnectionType } from "@/core/types/schema";
import type { newConnectionPingResponse } from "../types";
import { toast } from "sonner";

const translate = i8nextConfig.getFixedT(null, "connection");

export const createNewConnectionPing = async (pingArg: string) => {
  try {
    const res = await axiosInstance.post("/connections/new/ping", {
      pingArg: pingArg,
    });

    const resData: { pingData: connectionPingType; message: string } = res.data;

    const pendingConnections =
      userConnectionStore.getState().sentConnectionPings;

    const filteredConnection = pendingConnections.filter(
      (cn) => cn._id !== resData.pingData._id,
    );

    userConnectionStore.setState({
      sentConnectionPings: [...filteredConnection, resData.pingData],
    });

    const returnObject: newConnectionPingResponse = {
      isSuccess: true,
      isSent: true,
      isError: false,
      message: translate(`NewConnectionResponses.${resData.message}`),
    };
    return returnObject;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message: string;
    }>;

    const message = translate(
      `NewConnectionResponses.${
        axiosError.response?.data?.message || "NO_INTERNET"
      }`,
    );

    const returnObject = {
      isError: true,
      message,
      pingData: undefined,
      isSent: false,
      isSuccess: false,
    };
    return returnObject;
  }
};

export const deleteSentConnectionPing = async (
  id: string,
  isDeleting: boolean,
) => {
  if (isDeleting) return;
  const allPending = userConnectionStore.getState().deletingConnection;

  userConnectionStore.setState({
    deletingConnection: [...allPending, id],
  });
  try {
    await axiosInstance.delete("/connections/pending/ping", {
      params: { documentId: id },
    });
    const allPendingSentPings =
      userConnectionStore.getState().sentConnectionPings;
    const filteredPings = allPendingSentPings.filter((ping) => ping._id !== id);
    userConnectionStore.setState({ sentConnectionPings: filteredPings });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const errorMessage = axiosError.response?.data.message
      ? translate(`SERVER_RESPONSES.${axiosError.response.data.message}`)
      : translate("SERVER_RESPONSES.NO_INTERNET");
    toast.error(errorMessage, {
      style: {
        fontSize: "13px",
        padding: "10px 12px",
        minWidth: "unset",
        maxWidth: "260px",
        borderRadius: "8px",
        justifySelf: "center",
      },
    });
  } finally {
    userConnectionStore.setState({
      deletingConnection: allPending.filter((p) => p !== id),
    });
  }
};

export const acceptConnectionPing = async (documentId: string) => {
  try {
    if (!documentId) return;

    const res = await axiosInstance.post("/connections/accept/ping", {
      documentId,
    });

    const resData: { connectionData: ConnectionType } = res.data;

    const allConnections = userConnectionStore.getState().connections;
    const receivedConnectionPings =
      userConnectionStore.getState().receivedConnectionPings;

    userConnectionStore.setState({
      receivedConnectionPings: [
        ...receivedConnectionPings.filter((ping) => ping._id !== documentId),
      ],
      connections: [
        ...allConnections.filter((cn) => cn._id !== resData.connectionData._id),
        resData.connectionData,
      ],
    });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const message = axiosError.response?.data?.message;

    if (message) {
      const translatedMessage = translate(message);
      toast.error(translatedMessage);
    }
  }
};

export const ignoreConnectionPing = async (
  documentId: string,
  isDeleting: boolean,
) => {
  if (!documentId || isDeleting) return;

  const deletingConnections = userConnectionStore.getState().deletingConnection;
  userConnectionStore.setState({
    deletingConnection: [
      ...deletingConnections.filter((p) => p !== documentId),
      documentId,
    ],
  });

  try {
    await axiosInstance.patch("/connections/ignore/ping", {
      documentId,
    });
    const allReceivedPings =
      userConnectionStore.getState().receivedConnectionPings;

    userConnectionStore.setState({
      receivedConnectionPings: [
        ...allReceivedPings.filter(
          (ping) => ping._id.toString() !== documentId.toString(),
        ),
      ],
    });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const message = axiosError.response?.data?.message;

    if (message) {
      toast.error(translate(message));
    }
  } finally {
    userConnectionStore.setState({
      deletingConnection: [
        ...deletingConnections.filter((p) => p !== documentId),
      ],
    });
  }
};

export const handleRemoveConnection = async (documentId: string) => {
  userConnectionStore.setState((state) => ({
    deletingConnection: [...state.deletingConnection, documentId],
  }));
  try {
    await axiosInstance.delete(`/connections/connected/${documentId}`);

    userConnectionStore.setState((state) => {
      return {
        connections: state.connections.filter((p) => p._id !== documentId),
      };
    });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const message = axiosError.response?.data.message
      ? translate(
          `DELETE_CONNECTION_RESPONSES.${axiosError.response?.data.message}`,
        )
      : translate("NO_INTERNET");

    toast.error(message, {
      style: {
        fontSize: "13px",
        padding: "10px 12px",
        borderRadius: "8px",
        justifySelf: "center",
      },
    });
    console.log("Error Deleting Error ---> ", message);
  } finally {
    userConnectionStore.setState((state) => ({
      deletingConnection: state.deletingConnection.filter(
        (p) => p !== documentId,
      ),
    }));
  }
};







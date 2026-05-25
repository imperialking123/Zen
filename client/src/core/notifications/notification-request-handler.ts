import type { connectionPingType, IMessage } from "@/core/types/schema";
import { handleMessageNotification } from "./message-notification";
import { playConnectionSound } from "./notification";

type MessageNotificationRequest = {
  type: "MESSAGE";
  message: IMessage;
};

type ConnectionPingNotificationRequest = {
  type: "CONNECTION_PING";
  pingData: connectionPingType;
};

export type NotificationRequest =
  | MessageNotificationRequest
  | ConnectionPingNotificationRequest;

const handleNotificationRequest = (request: NotificationRequest) => {
  switch (request.type) {
    case "MESSAGE":
      handleMessageNotification(request.message);
      break;
    case "CONNECTION_PING":
      if (request.pingData) playConnectionSound();
      break;
  }
};

export default handleNotificationRequest;

import { notificationService } from "@/core/utils";

export const playMessageSoundIfAway = (isIdle?: boolean) => {
  if (document.visibilityState === "hidden" || isIdle) {
    notificationService.playMessage();
  }
};

export const playConnectionSound = () => {
  notificationService.playConnection();
};

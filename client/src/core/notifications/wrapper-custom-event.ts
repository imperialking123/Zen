export const WRAPPER_CUSTOM_EVENT = "wrapper-custom-event";

export const WrapperCustomEventDetailType = {
  NEW_MESSAGES_BOTTOM: "new-messages-bottom",
} as const;

export type WrapperCustomEventDetailType =
  (typeof WrapperCustomEventDetailType)[keyof typeof WrapperCustomEventDetailType];

export type WrapperCustomEventDetail = {
  type: WrapperCustomEventDetailType;
};

export type WrapperCustomEventState = WrapperCustomEventDetail | false;

export const dispatchWrapperCustomEvent = (
  wrapper: HTMLElement,
  detail: WrapperCustomEventDetail,
): void => {
  wrapper.dispatchEvent(
    new CustomEvent<WrapperCustomEventDetail>(WRAPPER_CUSTOM_EVENT, { detail }),
  );
};

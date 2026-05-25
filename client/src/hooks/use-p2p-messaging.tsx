import { useCallback, useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import userChatStore from "@/core/store/user-chat-store";
import userAuthStore from "@/core/store/user-auth-store";
import useConversationMessages from "@/hooks/use-conversation-messages";
import useP2PMessagePagination from "@/hooks/use-p2p-message-pagination";
import { createDialog } from "@/shared/create-dialog";
import { initiateReplyTo } from "@/core/utils/chatFunctions";

import GifFullScreenPreviewUI from "@/shared/ui/gif-fullscreen-preview";
import AttachmentFullScreenUI from "@/shared/ui/attachment-preview/attachment-fullscreen-renderer";
import ForwardMessageUI from "@/shared/ui/message/forward-message-ui";
import DeleteMessageUI from "@/shared/ui/message/delete-message-ui";

import type { IMessage } from "@/core/types/schema";
import type { MessageActionTranslations } from "@/core/types";

export type ShowReactToMessagePicker = {
  isShow: boolean;
  messageId: string;
  domRect: DOMRect | null;
  conversationId: string;
};

export type ShowContextMenuT = {
  x: number;
  y: number;
  index: number;
  message: IMessage;
};

export const useP2PMessaging = (wrapperRef?: React.RefObject<HTMLDivElement | null>) => {
  const selectedConversation = userChatStore((s) => s.selectedConversation);
  const authUser = userAuthStore((s) => s.authUser);
  const addOrRemoveP2PMessageReaction = userChatStore((s) => s.addOrRemoveP2PMessageReaction);
  const toggleShowEditMessage = userChatStore((s) => s.toggleShowEditMessage);
  const editMessage = userChatStore((s) => s.editMessage);
  const removeAttachment = userChatStore((s) => s.removeAttachment);
  const isGettingMessages = userChatStore((s) => s.isGettingMessages);
  const hasMoreAbove = userChatStore(s => selectedConversation ? s.hasMoreTop[selectedConversation._id] : false)

  const displayedMessages = useConversationMessages(selectedConversation?._id);


  const displayedMessagesRef = useRef(displayedMessages);
  useEffect(() => {
    displayedMessagesRef.current = displayedMessages;
  }, [displayedMessages]);

  const { t: translate } = useTranslation(["chat"]);

  const beginningOfChatText = useMemo(() => translate("beginningOfChatText"), [translate]);
  const messageActions = useMemo(
    () => translate("messageActions") as unknown as MessageActionTranslations,
    [translate]
  );

  const [showReactToMesagePicker, setShowReactToMessagePicker] =
    useState<ShowReactToMessagePicker>({
      isShow: false,
      messageId: "",
      conversationId: "",
      domRect: null,
    });

  const [showContextMenu, setShowContextMenu] = useState<ShowContextMenuT | null>(null);

  const { currentUserProfile, otherUserProfile } = useMemo(
    () => ({
      currentUserProfile: authUser ?? undefined,
      otherUserProfile: selectedConversation?.otherUser ?? undefined,
    }),
    [authUser, selectedConversation?.otherUser]
  );

  type handleReactToMessageT = {
    domRect: DOMRect;
    messageId: string;
    conversationId: string;
    closeMenuFirst?: boolean;
  };

  const handleShowReactToMessagePicker = useCallback(
    ({ domRect, messageId, conversationId, closeMenuFirst }: handleReactToMessageT) => {
      if (closeMenuFirst) setShowContextMenu(null);
      setShowReactToMessagePicker({ conversationId, domRect, isShow: true, messageId });
    },
    []
  );

  const handleDisplayGifFullScreen = useCallback(
    (index: number): void => {
      const message = displayedMessagesRef.current[index];
      if (!message || message.type !== "gif" || !authUser || !selectedConversation) return;

      const senderProfile =
        message.senderId === authUser._id ? authUser : selectedConversation.otherUser;

      createDialog.open("showGifFullScreenId", {
        contentWidth: "100%",
        contentRounded: "0px",
        dialogSize: "full",
        showCloseButton: false,
        showBackDrop: true,
        contentHeight: "100%",
        bodyPadding: "0px",
        contentBg: "transparent",
        content: (
          <Suspense>
            <GifFullScreenPreviewUI
              createdAt={message.createdAt}
              gifData={message.gif}
              senderProfile={senderProfile}
            />
          </Suspense>
        ),
      });
    },
    [authUser, selectedConversation]
  );

  const handleDisplayAttachmentFullScreen = useCallback(
    (index: number, fileId: string) => {
      const message = displayedMessagesRef.current[index];
      if (!message || !authUser || !selectedConversation) return;
      if (message.type !== "default" || !message.attachments?.length) return;

      const visualAttachments = message.attachments.filter(
        (p) => p.type === "video" || p.type === "image"
      );

      const clicked = visualAttachments.find((p) => p.fileId === fileId);
      const senderProfile =
        message.senderId === authUser._id ? authUser : selectedConversation.otherUser;

      const arrangedArray = clicked
        ? [clicked, ...visualAttachments.filter((p) => p.fileId !== fileId)]
        : visualAttachments;

      createDialog.open("showAttachmentId", {
        contentWidth: "100%",
        contentRounded: "0px",
        dialogSize: "full",
        showCloseButton: false,
        showBackDrop: true,
        contentHeight: "100%",
        bodyPadding: "0px",
        contentBg: "transparent",
        content: (
          <Suspense>
            <AttachmentFullScreenUI
              attachments={arrangedArray}
              createdAt={message.createdAt}
              senderProfile={senderProfile}
            />
          </Suspense>
        ),
      });
    },
    [authUser, selectedConversation]
  );

  const handleReactToMessage = useCallback(
    (index: number, emoji: string, closeMenuFirst?: boolean) => {
      const message = displayedMessagesRef.current[index];
      if (!message || !authUser || !selectedConversation) return;
      if (closeMenuFirst) setShowContextMenu(null);

      addOrRemoveP2PMessageReaction({
        conversationId: message.conversationId,
        emoji,
        messageId: message._id,
        userId: authUser._id,
        username: authUser.username,
      });
    },
    [authUser, selectedConversation, addOrRemoveP2PMessageReaction]
  );

  type ShowContextMenuDesktopT = { index: number; x: number; y: number };

  const handleShowContextMenu = useCallback(({ index, x, y }: ShowContextMenuDesktopT) => {
    const message = displayedMessagesRef.current[index];
    if (!message) return;
    setShowContextMenu({ x, y, message, index });
  }, []);

  const handleInitiateReply = useCallback((index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessagesRef.current[index];
    if (!message || message.status !== "sent") return;
    if (closeMenuFirst) setShowContextMenu(null);

    initiateReplyTo({
      conversationId: message.conversationId,
      messageId: message._id,
    });
  }, []);

  const handleShowForwardUI = useCallback((index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessagesRef.current[index];
    if (!message) return;
    if (closeMenuFirst) setShowContextMenu(null);

    createDialog.open("forwardToUI", {
      showCloseButton: false,
      bodyPadding: "0px",
      showBackDrop: true,
      contentRounded: { base: "0px", md: "sm", lg: "sm" },
      contentWidth: "100%",
      contentHeight: { base: "100%", lg: "75dvh", md: "75dvh" },
      content: (
        <Suspense>
          <ForwardMessageUI message={message} />
        </Suspense>
      ),
    });
  }, []);

  const handleCopyText = useCallback((index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessagesRef.current[index];
    if (!message) return;
    if (closeMenuFirst) setShowContextMenu(null);

    if (message.type === "default" && message.text && message.text?.trim().length > 0) {
      navigator.clipboard.writeText(message.text);
    }
  }, []);

  const handlePromptForDelete = useCallback(
    (index: number, closeMenuFirst?: boolean) => {
      const message = displayedMessagesRef.current[index];
      if (!message || message.status === "sending" || !authUser || !selectedConversation) return;
      if (closeMenuFirst) setShowContextMenu(null);

      const senderProfile =
        message.senderId !== authUser._id ? selectedConversation.otherUser : authUser;

      createDialog.open("DeleteMessageUI", {
        showCloseButton: false,
        bodyPadding: "0px",
        showBackDrop: true,
        contentRounded: { base: "0px", md: "sm", lg: "sm" },
        contentWidth: "100%",
        content: (
          <Suspense>
            <DeleteMessageUI senderProfile={senderProfile} message={message} />
          </Suspense>
        ),
      });
    },
    [authUser, selectedConversation]
  );

  const handleTriggerEditMode = useCallback(
    (index: number, closeMenuFirst?: boolean) => {
      const message = displayedMessagesRef.current[index];
      if (!message) return;
      if (closeMenuFirst) setShowContextMenu(null);
      toggleShowEditMessage(message._id);
    },
    [toggleShowEditMessage]
  );

  const handleEditMesssage = useCallback(
    (msgIndex: number, text: string) => {
      const message = displayedMessagesRef.current[msgIndex];
      if (!message) return;

      toggleShowEditMessage(message._id);

      if (message.type === "default") {
        if (text.trim().length === 0) {
          handlePromptForDelete(msgIndex, true);
          return;
        }
        editMessage(message.conversationId, text, message._id);
      }
    },
    [toggleShowEditMessage, editMessage, handlePromptForDelete]
  );

  const handleRemoveAttachment = useCallback(
    (msgIndex: number, fileId: string) => {
      const message = displayedMessagesRef.current[msgIndex];
      if (!message || message.type !== "default") return;
      if (!message.attachments || message.attachments.length <= 1) return;

      removeAttachment({ fileId, msgIndex, convoId: message.conversationId });
    },
    [removeAttachment]
  );

  const { topRef } = useP2PMessagePagination(selectedConversation?._id, wrapperRef);

  return {
    selectedConversation,
    displayedMessages,
    authUser,
    isGettingMessages,
    beginningOfChatText,
    messageActions,
    showReactToMesagePicker,
    setShowReactToMessagePicker,
    showContextMenu,
    setShowContextMenu,
    currentUserProfile,
    otherUserProfile,
    handleShowReactToMessagePicker,
    handleDisplayGifFullScreen,
    handleDisplayAttachmentFullScreen,
    handleReactToMessage,
    handleShowContextMenu,
    handleInitiateReply,
    handleShowForwardUI,
    handleCopyText,
    handlePromptForDelete,
    handleTriggerEditMode,
    handleEditMesssage,
    handleRemoveAttachment,
    topRef,
    hasMoreAbove
  };
};

export default useP2PMessaging;
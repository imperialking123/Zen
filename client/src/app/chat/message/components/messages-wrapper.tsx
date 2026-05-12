import { Flex } from "@chakra-ui/react";
import MessageStartUI from "./message-start-ui";
import { useTranslation } from "react-i18next";
import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import userChatStore from "@/store/user-chat-store";
import userAuthStore from "@/store/user-auth-store";
import type { MessageActionTranslations } from "@/types";
import useConversationMessages from "@/hooks/use-conversation-messages";
import MessageSeparator from "./message-separator";
import MessageItemContainer from "@/app/shared/message/message-map/message-item-container";
import ReactToMessageEmojiPicker from "@/app/shared/message/message-map/reaction/react-to-message-emoji-picker";
import { createDialog } from "@/app/dialog/create-dialog";
import AttachmentFullScreenUI from "@/app/dialog/ui/attachment-preview/attachment-fullscreen-renderer";
import GifFullScreenPreviewUI from "@/app/dialog/ui/gif-fullscreen-preview";
import MessageItemContextMenu from "@/app/shared/message/message-context-menu";
import type { IMessage } from "@/types/schema";
import { initiateReplyTo } from "@/utils/chatFunctions";
import ForwardMessageUI from "@/app/dialog/ui/message/forward-message-ui";
import DeleteMessageUI from "@/app/dialog/ui/message/delete-message-ui";

const MessagesWrapper = () => {
  const selectedConversation = userChatStore(
    (state) => state.selectedConversation,
  );
  const displayedMessages = useConversationMessages(selectedConversation?._id);
  const authUser = userAuthStore((state) => state.authUser);
  const addOrRemoveP2PMessageReaction = userChatStore(
    (state) => state.addOrRemoveP2PMessageReaction,
  );

  const toggleShowEditMessage = userChatStore((s) => s.toggleShowEditMessage);
  const editMessage = userChatStore(s => s.editMessage)
  const removeAttachment = userChatStore(s => s.removeAttachment)
  const { t: translate } = useTranslation(["chat"]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const beginningOfChatText = translate("beginningOfChatText");
  const messageActions = translate(
    "messageActions",
  ) as unknown as MessageActionTranslations;

  type ShowReactToMessagePicker = {
    isShow: boolean;
    messageId: string;
    domRect: DOMRect | null;
    conversationId: string;
  };

  const [showReactToMesagePicker, setShowReactToMessagePicker] =
    useState<ShowReactToMessagePicker>({
      isShow: false,
      messageId: "",
      conversationId: "",
      domRect: null,
    });

  type ShowContextMenuT = {
    x: number;
    y: number;
    index: number;
    message: IMessage;
  };

  const [showContextMenu, setShowContextMenu] =
    useState<ShowContextMenuT | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedMessages]);

  const { currentUserProfile, otherUserProfile } = useMemo(
    () => ({
      currentUserProfile: authUser ?? undefined,
      otherUserProfile: selectedConversation?.otherUser ?? undefined,
    }),
    [authUser, selectedConversation?.otherUser],
  );

  type handleReactToMessageT = {
    domRect: DOMRect;
    messageId: string;
    conversationId: string;
    closeMenuFirst?: boolean;
  };

  const handleShowReactToMessagePicker = useCallback(
    ({
      domRect,
      messageId,
      conversationId,
      closeMenuFirst,
    }: handleReactToMessageT) => {
      if (closeMenuFirst) {
        setShowContextMenu(null);
      }
      setShowReactToMessagePicker({
        conversationId,
        domRect,
        isShow: true,
        messageId,
      });
    },
    [],
  );

  const handleDisplayGifFullScreen = useCallback(
    (index: number): void => {
      const message = displayedMessages[index];

      if (!message) return;
      if (message.type !== "gif") return;
      if (!authUser || !selectedConversation) return;

      const senderProfile =
        message.senderId === authUser._id
          ? authUser
          : selectedConversation.otherUser;

      const id = "showGifFullScreenId";
      createDialog.open(id, {
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
    [displayedMessages, authUser, selectedConversation, createDialog],
  );

  const handleDisplayAttachmentFullScreen = useCallback(
    (index: number, fileId: string) => {
      const message = displayedMessages[index];

      if (!message) return;

      if (!authUser || !selectedConversation) return;

      if (
        message.type === "default" &&
        message.attachments &&
        message.attachments.length > 0
      ) {
        const visualAttachments = message.attachments.filter(
          (p) => p.type === "video" || p.type === "image",
        );

        const findAttachmentClicked = visualAttachments.find(
          (p) => p.fileId === fileId,
        );

        const senderProfile =
          message.senderId === authUser._id
            ? authUser
            : selectedConversation.otherUser;

        const arrangedArray = findAttachmentClicked
          ? [
            findAttachmentClicked,
            ...visualAttachments.filter((p) => p.fileId !== fileId),
          ]
          : visualAttachments;

        const id = "showAttachmentId";

        createDialog.open(id, {
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
      }
    },
    [displayedMessages, authUser, selectedConversation, createDialog],
  );

  const handleReactToMessage = (index: number, emoji: string, closeMenuFirst?: boolean) => {
    const message = displayedMessages[index];

    if (!message) return;

    if (!authUser || !selectedConversation) return;

    if (closeMenuFirst) {
      setShowContextMenu(null)
    }

    addOrRemoveP2PMessageReaction({
      conversationId: message.conversationId,
      emoji,
      messageId: message._id,
      userId: authUser._id,
      username: authUser.username,
    });
  };

  type ShowContextMenuDesktopT = {
    index: number;
    x: number;
    y: number;
  };

  const handleShowContextMenu = (props: ShowContextMenuDesktopT) => {
    const { index, x, y } = props;
    const message = displayedMessages[index];
    if (!message) return;

    setShowContextMenu({
      x,
      y,
      message,
      index,
    });
  };

  const handleInitiateReply = (index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessages[index];
    if (!message) return;
    if (message.status !== "sent") return;

    if (closeMenuFirst) {
      setShowContextMenu(null);
    }

    initiateReplyTo({
      conversationId: message.conversationId,
      messageId: message._id,
    });
  };

  const handleShowForwardUI = (index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessages[index];

    if (!message) return;

    if (closeMenuFirst) {
      setShowContextMenu(null);
    }

    const forwardToId = "forwardToUI";

    createDialog.open(forwardToId, {
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
  };

  const handleCopyText = (index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessages[index];

    if (!message) return;

    if (closeMenuFirst) {
      setShowContextMenu(null);
    }

    if (
      message.type === "default" &&
      message.text &&
      message.text.trim().length > 0
    ) {
      navigator.clipboard.writeText(message.text);
    }
  };

  const handlePromptForDelete = (index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessages[index];
    if (!message) return;
    if (message.status === "sending") return;

    if (closeMenuFirst) {
      setShowContextMenu(null);
    }

    if (!authUser || !selectedConversation) return;

    const senderProfile =
      message.senderId !== authUser._id
        ? selectedConversation.otherUser
        : authUser;

    const id = "DeleteMesageUI";
    createDialog.open(id, {
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
  };



  const handleTriggerEditMode = (index: number, closeMenuFirst?: boolean) => {
    const message = displayedMessages[index];
    if (!message) return;

    if (closeMenuFirst) {
      setShowContextMenu(null);
    }
    toggleShowEditMessage(message._id);
  };


  const handleEditMesssage = (msgIndex: number, text: string) => {
    const message = displayedMessages[msgIndex];

    if (!message) return;

    toggleShowEditMessage(message._id)

    if (message.type === "default") {
      if (text.trim().length === 0) {
        handlePromptForDelete(msgIndex, true);
        return;
      }

      editMessage(message.conversationId, text, message._id);
    }
  };

  const handleRemoveAttachment = (msgIndex: number, fileId: string) => {

    const message = displayedMessages[msgIndex]
    if (!message) return;

    if (message.type !== 'default') return;
    if (!message.attachments || message.attachments.length <= 1) return;





    removeAttachment({
      fileId,
      msgIndex,
      convoId: message.conversationId
    })
  }

  return (
    <Flex
      flex={1}
      pt="1.5"
      pr={{ base: "0px", lg: "8px" }}
      overflowY="auto"
      direction="column"
      id="message-wrapper"
      // Add smooth scrolling
      css={{
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "fg.muted",
          borderRadius: "full",
        },
      }}
      w="full"
      pos="relative"
      ref={wrapperRef}
    >
      <MessageStartUI
        beginningOfChatText={beginningOfChatText}
        otherUser={selectedConversation?.otherUser}
      />

      {/* Provide translated message action labels once to avoid repeated lookups. */}
      {displayedMessages.map((message, i) => {
        const currentDay = new Date(message.createdAt).setHours(0, 0, 0, 0);
        const prevDay =
          i > 0
            ? new Date(displayedMessages[i - 1].createdAt).setHours(0, 0, 0, 0)
            : null;
        const showSeparator = i === 0 || currentDay !== prevDay;
        const prevMessage = i > 0 ? displayedMessages[i - 1] : null;

        const showSimpleStyle = prevMessage
          ? Math.abs(
            new Date(message.createdAt).getTime() -
            new Date(prevMessage.createdAt).getTime(),
          ) <
          60 * 1000 && prevMessage.senderId === message.senderId
          : false;

        const isMine = message.senderId === authUser?._id;
        const senderProfile = isMine ? currentUserProfile : otherUserProfile;
        return (
          <Fragment key={message._id}>
            {showSeparator && (
              <MessageSeparator createdAt={message.createdAt} />
            )}
            <MessageItemContainer
              handleRemoveAttachment={handleRemoveAttachment} handleEditMesssage={handleEditMesssage}
              handleInitiateReply={handleInitiateReply}
              handleShowForwardUI={handleShowForwardUI}
              handleTriggerEditMode={handleTriggerEditMode}
              handleShowContextMenu={handleShowContextMenu}
              handleReactToMessage={handleReactToMessage}
              handleOpenAttachmentFullScreen={handleDisplayAttachmentFullScreen}
              handleDisplayGifFullScreen={handleDisplayGifFullScreen}
              index={i}
              MessageActionTranslations={messageActions}
              senderProfile={senderProfile}
              showSimpleStyle={showSimpleStyle}
              message={message}
              handleShowReactToMessagePicker={handleShowReactToMessagePicker}
            />
          </Fragment>
        );
      })}

      {showReactToMesagePicker.isShow &&
        showReactToMesagePicker.messageId &&
        showReactToMesagePicker.domRect !== null && (
          <ReactToMessageEmojiPicker
            conversationId={showReactToMesagePicker.conversationId}
            domRect={showReactToMesagePicker.domRect}
            messageId={showReactToMesagePicker.messageId}
            setShowReactToMessagePicker={setShowReactToMessagePicker}
          />
        )}

      {showContextMenu && showContextMenu !== null && (
        <MessageItemContextMenu
          handleReactToMessage={handleReactToMessage}
          handleTriggerEditMode={handleTriggerEditMode}
          handlePromptForDelete={handlePromptForDelete}
          handleCopyText={handleCopyText}
          handleShowForwardUI={handleShowForwardUI}
          handleInitiateReply={handleInitiateReply}
          handleShowReactToMessagePicker={handleShowReactToMessagePicker}
          displayedMessages={displayedMessages}
          data={showContextMenu}
          setContextMenu={setShowContextMenu}
        />
      )}
      <Flex ref={scrollRef} minH="5px" p="1px" w="full" />
    </Flex>
  );
};

export default MessagesWrapper;

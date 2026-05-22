import { Flex } from "@chakra-ui/react";
import MessageStartUI from "./message-start-ui";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  WRAPPER_CUSTOM_EVENT,
  WrapperCustomEventDetailType,
  type WrapperCustomEventDetail,
  type WrapperCustomEventState,
} from "@/core/notifications/wrapper-custom-event";

import MessageSeparator from "./message-separator";
import MessageItemContainer from "@/shared/message/message-map/message-item-container";
import ReactToMessageEmojiPicker from "@/shared/message/message-map/reaction/react-to-message-emoji-picker";
import MessageItemContextMenu from "@/shared/message/message-context-menu";
import LoadingMessagesUI from "@/shared/message/loading-messages-ui";
import useP2PMessaging from "@/hooks/use-p2p-messaging";
import P2PMessagingActionBar from "./p2p-messaging-action-bar";
import { isScrolledAwayFromBottom, scrollMessageWrapperToBottom } from "@/core/utils";

const MessagesWrapper = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperCustomEvent, setWrapperCustomEvent] = useState<WrapperCustomEventState>(false);
  const {
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
  } = useP2PMessaging(wrapperRef);


  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = useRef(false);

  useEffect(() => {
    if (
      !isGettingMessages &&
      displayedMessages.length > 0 &&
      !hasAutoScrolledRef.current
    ) {
      scrollMessageWrapperToBottom();
      hasAutoScrolledRef.current = true;
    }
  }, [isGettingMessages, displayedMessages.length]);

  const dismissActionBar = useCallback(() => {
    if (wrapperCustomEvent) {
      if (wrapperCustomEvent.type === "new-messages-bottom") {
        scrollMessageWrapperToBottom()
      }
    }
    setWrapperCustomEvent(false);
  }, []);

  const handleWrapperCustomEvent = useCallback((event: Event) => {
    const { detail } = event as CustomEvent<WrapperCustomEventDetail>;
    if (detail?.type === WrapperCustomEventDetailType.NEW_MESSAGES_BOTTOM) {
      setWrapperCustomEvent(detail);
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener(WRAPPER_CUSTOM_EVENT, handleWrapperCustomEvent);
    return () =>
      wrapper.removeEventListener(WRAPPER_CUSTOM_EVENT, handleWrapperCustomEvent);
  }, [handleWrapperCustomEvent]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !wrapperCustomEvent) return;

    const onScroll = () => {
      if (!isScrolledAwayFromBottom(wrapper)) {
        dismissActionBar();
      }
    };

    wrapper.addEventListener("scroll", onScroll, { passive: true });
    return () => wrapper.removeEventListener("scroll", onScroll);
  }, [wrapperCustomEvent, dismissActionBar]);

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
      {!isGettingMessages && !hasMoreAbove && (
        <MessageStartUI
          beginningOfChatText={beginningOfChatText}
          otherUser={selectedConversation?.otherUser}
        />
      )}

      <Flex ref={topRef} h="1px" />
      {(isGettingMessages || hasMoreAbove) && <LoadingMessagesUI count={3} />}

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
          ) < 60 * 1000 && prevMessage.senderId === message.senderId
          : false;

        const isMine = message.senderId === authUser?._id;
        const senderProfile = isMine ? currentUserProfile : otherUserProfile;
        return (
          <Fragment key={message._id}>
            {showSeparator && (
              <MessageSeparator createdAt={message.createdAt} />
            )}
            <MessageItemContainer
              handleRemoveAttachment={handleRemoveAttachment}
              handleEditMesssage={handleEditMesssage}
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
      <P2PMessagingActionBar
        event={wrapperCustomEvent}
        onDismiss={dismissActionBar}
      />
      <Flex id="message-scroll-ref" ref={scrollRef} minH="5px" p="1px" w="full" />
    </Flex>
  );
};

export default MessagesWrapper;

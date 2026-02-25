import type { MessageActionTranslations } from "@/types";
import type { Attachment, IMessage, IUser } from "@/types/schema";
import {
  formatDateSimpleStyle,
  formatMessageTimestamp,
  getEmojiUrl,
} from "@/utils/chatFunctions";
import {
  Avatar,
  Flex,
  Float,
  Image,
  Menu,
  Popover,
  Portal,
  Separator,
  Text,
  type MenuSelectionDetails,
} from "@chakra-ui/react";
import { useId, useRef, useState, type RefObject } from "react";
import { BiSolidPencil } from "react-icons/bi";
import { BsRobot, BsThreeDots } from "react-icons/bs";
import { FaSmile } from "react-icons/fa";
import { HiReply, } from "react-icons/hi";
import { IoCopy } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { P2PMessageReplyUI } from "./message-reply-ui";
import ShowFullTimeStampTooltip from "../show-full-createdAt-tooltip";
import MessageTextRenderer from "./message-text-renderer";
import UploadingFilesUI from "../uploading-files-ui";
import MessageAttachmentRenderer from "./message-attachment-render";
import { Tooltip } from "@/components/ui/tooltip";
import MessageGifRender from "./message-gif-render";
import MessageEmojiReactionUI from "../../emoji-and-reactions/message-emoji-reaction";
import { P2PMessageReactionsRenderer } from "./reaction/message-reactions-renderer";

const scrollCSS = {
  scrollBehavior: "smooth",
  "&::-webkit-scrollbar": {
    width: "4px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "bg.muted",
    borderRadius: "full",
  },
};

interface IMessageActionMenuItemsProps {
  messageActions: MessageActionTranslations;
  isMine: boolean;
  hasText: boolean;
}

const MessageActionMenuItems = (props: IMessageActionMenuItemsProps) => {
  const { messageActions, isMine, hasText } = props;
  const quickReactArray = [
    { text: "👍", value: "👍" },
    { text: "❤️", value: "❤️" },
    { text: "😂", value: "😂" },
    { text: "🔥", value: "🔥" },
  ];

  const {
    deleteMessage,
    forwardMessage,
    replyMessage,
    copyText,
    addReaction,
    editMessage,
  } = messageActions;

  return (
    <Portal>
      <Menu.Positioner>
        <Menu.Content css={scrollCSS} rounded="md" w="210px">
          <Flex justifyContent="center" mb="5px" gap="1">
            {quickReactArray.map((item) => (
              <Menu.Item
                key={item.value}
                value={item.value}
                _hover={{
                  bg: "bg.emphasized",
                }}
                gap="1"
                w="45px"
                h="45px"
                bg="bg.muted"
                fontSize="2xl"
                rounded="md"
                flexDirection="column"
                justifyContent="center"
              >
                <Image src={getEmojiUrl(item.value)} h="22px" w="22px" />
              </Menu.Item>
            ))}
          </Flex>
          <Menu.Item
            p="10px"
            color="fg.muted"
            justifyContent="space-between"
            rounded="md"
            value="addReaction"
          >
            <Text color="fg">{addReaction}</Text> <FaSmile size={18} />
          </Menu.Item>

          <Menu.Separator />

          <Menu.Item
            p="10px"
            color="fg.muted"
            justifyContent="space-between"
            rounded="md"
            value="replyMessage"
          >
            <Text color="fg">{replyMessage}</Text> <HiReply size={18} />
          </Menu.Item>

          <Menu.Item
            p="10px"
            color="fg.muted"
            justifyContent="space-between"
            rounded="md"
            value="forwardMessage"
          >
            <Text color="fg">{forwardMessage}</Text>{" "}
            <HiReply style={{ transform: "scaleX(-1)" }} size={18} />
          </Menu.Item>

          {isMine && hasText && (
            <Menu.Item
              p="10px"
              color="fg.muted"
              justifyContent="space-between"
              rounded="md"
              value="editMessage"
            >
              <Text color="fg">{editMessage}</Text> <BiSolidPencil size={20} />
            </Menu.Item>
          )}

          {hasText && (
            <>
              <Menu.Separator />
              <Menu.Item
                p="10px"
                color="fg.muted"
                justifyContent="space-between"
                rounded="md"
                value="copyText"
              >
                <Text color="fg">{copyText}</Text> <IoCopy size={18} />
              </Menu.Item>
            </>
          )}

          {isMine && (
            <>
              <Menu.Separator />

              <Menu.Item
                p="10px"
                justifyContent="space-between"
                rounded="md"
                value="deleteMessage"
                color="fg.error"
                _hover={{ bg: "bg.error", color: "fg.error" }}
              >
                {deleteMessage} <MdDelete size={19} />
              </Menu.Item>
            </>
          )}
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  );
};

interface IMessageActionToolbarProps {
  handleInitiateReply: () => void;
  messageActions: MessageActionTranslations;
  showMessageActionToolbar: boolean;
  handleForwardMessage: () => void;
  onMenuSelectFunction: (event: MenuSelectionDetails) => void;
  hasText: boolean;
  isMine: boolean;
  emojiRef: RefObject<HTMLDivElement | null>;
  handleReaction: (emoji: string) => void;
}

const MessageActionToolbar = (props: IMessageActionToolbarProps) => {
  const {
    handleInitiateReply,
    messageActions,
    showMessageActionToolbar,
    handleForwardMessage,
    onMenuSelectFunction,
    hasText,
    isMine,
    emojiRef,
    handleReaction
  } = props;
  const quickReactArray = [
    { text: "👍", value: "👍" },
    { text: "❤️", value: "❤️" },
    { text: "😂", value: "😂" },
  ];

  const { addReaction, replyMessage, forwardMessage, moreText } =
    messageActions;

  const tooltipProps = {
    showArrow: true,
    positioning: { placement: "top" } as const,
    contentProps: {
      padding: "8px",
      color: "fg",
      rounded: "md",
      css: { "--tooltip-bg": "colors.bg" },
    },
  };

  const triggerId = useId();
  const id = useId();

  return (
    <Float offsetX={{ base: "120px", lg: "150px" }}>
      <Flex
        opacity={showMessageActionToolbar ? "100%" : "0%"}
        pointerEvents={showMessageActionToolbar ? "auto" : "none"}
        gap="2px"
        border="1px solid"
        borderColor="bg.emphasized"
        p="2px"
        bg="bg"
        rounded="lg"
        alignItems="center"
      >
        {quickReactArray.map((emoji, index) => (
          <Flex
            onClick={() => handleReaction(emoji.value)}
            key={index}
            alignItems="center"
            justifyContent="center"
            _hover={{
              bg: "bg.muted",
            }}
            transition="transform 0.1s ease"
            w="30px"
            h="30px"
            p="3px"
            rounded="sm"
            className="group"
            userSelect="none"
          >
            <Image
              _groupHover={{
                h: "22px",
                w: "22px",
              }}
              src={getEmojiUrl(emoji.value)}
              height="20px"
              w="20px"
              userSelect="none"
            />
          </Flex>
        ))}

        <Separator ml="2px" mr="2px" orientation="vertical" h="5" />

        {/*Reaction */}
        <MessageEmojiReactionUI handleReaction={handleReaction} id={id} >
          <Tooltip ids={{ trigger: id }} content={addReaction} {...tooltipProps}>
            <Popover.Trigger>
              <Flex
                ref={emojiRef}
                alignItems="center"
                justifyContent="center"
                w="30px"
                h="30px"
                p="3px"
                bg="transparent"
                _hover={{ bg: "bg.muted" }}
                transition="0.2s ease"
                rounded="sm"
                className="group"
                cursor="pointer"
              >
                <Flex
                  as={FaSmile}
                  fontSize="20px"
                  color="fg.muted"
                  transition="transform 0.1s ease"
                  _groupHover={{
                    transform: "scale(1.1)",
                  }}
                />
              </Flex>
            </Popover.Trigger>
          </Tooltip>
        </MessageEmojiReactionUI>

        {/*Reply */}
        <Tooltip {...tooltipProps} content={replyMessage}>
          <Flex
            onClick={handleInitiateReply}
            alignItems="center"
            justifyContent="center"
            w="30px"
            h="30px"
            p="3px"
            bg="transparent"
            _hover={{ bg: "bg.muted" }}
            transition="0.2s ease"
            rounded="md"
            className="group"
            cursor="pointer"
          >
            <Flex
              as={HiReply}
              fontSize="20px"
              color="fg.muted"
              transition="transform 0.1s ease"
              _groupHover={{
                transform: "scale(1.1)",
              }}
            />
          </Flex>
        </Tooltip>

        {/*Forward */}
        <Tooltip content={forwardMessage} {...tooltipProps}>
          <Flex
            onClick={handleForwardMessage}
            alignItems="center"
            justifyContent="center"
            w="30px"
            h="30px"
            p="3px"
            bg="transparent"
            _hover={{ bg: "bg.muted" }}
            transition="0.2s ease"
            rounded="sm"
            className="group"
            cursor="pointer"
            transform="scaleX(-1)"
          >
            <Flex
              as={HiReply}
              fontSize="20px"
              color="fg.muted"
              transition="transform 0.1s ease"
              _groupHover={{
                transform: "scale(1.1)",
              }}
            />
          </Flex>
        </Tooltip>

        {/*More */}

        <Menu.Root onSelect={onMenuSelectFunction} ids={{ trigger: triggerId }}>
          <Tooltip
            ids={{ trigger: triggerId }}
            {...tooltipProps}
            content={moreText}
          >
            <Menu.Trigger asChild>
              <Flex
                alignItems="center"
                justifyContent="center"
                w="30px"
                h="30px"
                p="3px"
                bg="transparent"
                _hover={{ bg: "bg.muted" }}
                transition="0.2s ease"
                rounded="md"
                className="group"
                cursor="pointer"
              >
                <Flex
                  as={BsThreeDots}
                  fontSize="20px"
                  color="fg.muted"
                  transition="transform 0.1s ease"
                  _groupHover={{
                    transform: "scale(1.1)",
                  }}
                />
              </Flex>
            </Menu.Trigger>
          </Tooltip>
          <MessageActionMenuItems
            hasText={hasText}
            isMine={isMine}
            messageActions={messageActions}
          />
        </Menu.Root>
      </Flex>
    </Float>
  );
};

interface handleReactionAddOrRemoveProps {
  messageId: string, conversationId: string, emoji: string
}

interface IMessageItemProps {
  senderProfile: IUser | undefined;
  message: IMessage;
  showSimpleStyle: boolean;
  messageActions: MessageActionTranslations;
  getUploadingFilesText: (attachments: Attachment[]) => string;
  isMine: boolean;
  forwardText: string;
  disPlayGifFullScreen: (message: IMessage, senderProfile: IUser) => void;
  handleInitiateReply: (message: IMessage) => void;
  openAttFullScreen: ({
    fileId,
    message,
    senderProfile,
  }: {
    fileId: string;
    message: IMessage;
    senderProfile: IUser;
  }) => void;
  handleShowForwardUI: (message: IMessage) => void;
  handleShowDeleteUI: (message: IMessage) => void; handleCopyText: (message: IMessage) => void
  handleReact: (props: handleReactionAddOrRemoveProps) => void

}

const MessageItemContainer = (props: IMessageItemProps) => {
  const { senderProfile,
    message,
    showSimpleStyle,
    messageActions,
    isMine,
    getUploadingFilesText,
    forwardText,
    disPlayGifFullScreen,
    handleInitiateReply,
    openAttFullScreen,
    handleShowForwardUI,
    handleShowDeleteUI, handleCopyText, handleReact } = props

  const hasText =
    message.type === "default" &&
    !!message.text &&
    message.text.trim().length > 0;

  const [showMessageActionToolbar, setShowMessageActionToolbar] =
    useState(false);

  const isUploading =
    message.type === "default" &&
    message.status === "sending" &&
    (message.attachments?.length ?? 0) > 0;

  const emojiRef = useRef<HTMLDivElement>(null)

  const handleShowForwardUIHelperFunc = () => {
    handleShowForwardUI(message);
  };

  const handleInitiateReplyHelper = () => {
    handleInitiateReply(message);
  };

  const openAttFullscreenHelperFunc = (fileId: string) => {
    if (senderProfile) {
      openAttFullScreen({ fileId, message, senderProfile });
    }
  };

  const handleShowReactionUI = () => {
    if (emojiRef.current) {
      emojiRef.current.click()
    }
  }

  const handleMenuValueSelect = (event: MenuSelectionDetails) => {
    const value = event.value;



    switch (value) {
      case "replyMessage":
        handleInitiateReplyHelper();
        break;

      case "forwardMessage":
        handleShowForwardUIHelperFunc();
        break;
      case "deleteMessage":
        handleShowDeleteUI(message);
        break;

      case "copyText": handleCopyText(message); break

      case "addReaction": handleShowReactionUI(); break
    }
  };

  const handleDisplayGifFullScreen = () => {
    disPlayGifFullScreen(message, senderProfile as IUser);
  };

  const handleOnReact = (emoji: string) => {
    handleReact({ messageId: message._id, conversationId: message.conversationId, emoji })
  }


  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0


  return (
    <Flex
      onMouseEnter={() => setShowMessageActionToolbar(true)}
      onMouseLeave={() => setShowMessageActionToolbar(false)}
      color={message.status === "sending" ? "fg.muted" : ""}
      w="full"
      className="messageItem"
      mb="5px"
      alignItems="start"
      id={message._id}
      pos="relative"
    >
      {/* Profile */}
      <Flex
        justifyContent="center"
        alignItems="center"
        h={
          message.isReplied
            ? "75px"
            : showSimpleStyle
              ? "25px"
              : "50px"
        }
        minW={{ base: "16%", lg: "7%" }}
        maxW={{ base: "16%", lg: "7%" }}
        direction="column"
        alignSelf="stretch"
        gap="3px"
      >
        {message.isReplied && (
          <Flex minW="full" maxW="full" justifyContent="flex-end">
            <Flex
              w="50%"
              p="1px"
              h="12px"
              borderColor="fg.muted"
              _hover={{
                borderColor: "fg",
              }}
              roundedTopLeft="8px"
              borderLeftWidth="2.5px"
              borderTopWidth="2px"
            />
          </Flex>
        )}

        {(!showSimpleStyle || message.isReplied) && (
          <Avatar.Root>
            <Avatar.Fallback>
              <BsRobot size={20} />
            </Avatar.Fallback>
          </Avatar.Root>
        )}

        {showSimpleStyle && !message.isReplied && showMessageActionToolbar && (
          <Text userSelect="none" cursor="pointer" color="fg.muted" fontWeight="500" fontSize="xs">
            {formatDateSimpleStyle(message.createdAt)}
          </Text>
        )}
      </Flex>

      {/*Content */}
      <Flex w="full" direction="column">
        {message.isReplied && (
          <P2PMessageReplyUI replyToMessage={message.replyTo} />
        )}

        {(!showSimpleStyle || message.isReplied) && (
          <Flex gap="5px" alignItems="center">
            <Text
              _hover={{
                textDecoration: "underline",
              }}
              cursor="pointer"
              color="fg.muted"
              fontWeight="600"
            >
              {senderProfile?.displayName || "Deleted User"}
            </Text>

            <ShowFullTimeStampTooltip createdAt={message.createdAt}>
              <Text
                color="gray.fg"
                fontWeight="normal"
                cursor="pointer"
                fontSize="xs"
              >
                {formatMessageTimestamp(message.createdAt)}
              </Text>
            </ShowFullTimeStampTooltip>
          </Flex>
        )}

        <Menu.Root onSelect={handleMenuValueSelect}>
          <Menu.ContextTrigger minW="full" asChild>
            <Flex
              className={message.isForwarded ? "forwardMsg" : ""}
              direction="column"
              pb={showSimpleStyle ? hasReactions ? "5px" : "2.5px" : { base: "3.5px", lg: "3px" }}
              w="full"

            >
              {message.isForwarded && (
                <Flex
                  userSelect="none"
                  fontWeight="500"
                  color="fg.muted"
                  fontSize="sm"
                  fontStyle="italic"
                  alignItems="center"
                  gap="5px"
                >
                  <HiReply style={{ transform: "scaleX(-1)" }} size={18} />
                  <Text>{forwardText}</Text>
                </Flex>
              )}
              {message.type === "default" && !isUploading && hasText && (
                <MessageTextRenderer text={message.text!} />
              )}

              {isUploading && message.attachments && (
                <UploadingFilesUI
                  text={getUploadingFilesText(message.attachments)}
                />
              )}

              {!isUploading &&
                message.type === "default" &&
                message.attachments &&
                message.attachments.length > 0 && (
                  <MessageAttachmentRenderer
                    attachments={message.attachments}
                    displayAttachmentFullscreen={openAttFullscreenHelperFunc}
                  />
                )}

              {message.type === "gif" && (
                <MessageGifRender
                  gifData={message.gif}
                  disPlayGifFullScreen={handleDisplayGifFullScreen}
                />
              )}

              {message.reactions && Object.keys(message.reactions).length > 0 &&
                <P2PMessageReactionsRenderer handleReaction={handleOnReact} reactions={message.reactions} />
              }
            </Flex>
          </Menu.ContextTrigger>

          <MessageActionMenuItems
            hasText={hasText}
            isMine={isMine}
            messageActions={messageActions}
          />
        </Menu.Root>
      </Flex>

      <MessageActionToolbar
        handleReaction={handleOnReact}
        emojiRef={emojiRef}
        hasText={hasText}
        isMine={isMine}
        onMenuSelectFunction={handleMenuValueSelect}
        handleForwardMessage={handleShowForwardUIHelperFunc}
        showMessageActionToolbar={showMessageActionToolbar}
        messageActions={messageActions}
        handleInitiateReply={handleInitiateReplyHelper}
      />
    </Flex>
  );
};

export default MessageItemContainer;

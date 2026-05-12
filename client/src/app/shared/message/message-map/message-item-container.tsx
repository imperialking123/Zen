import type { IMessage, IUser } from "@/types/schema";
import {
  formatDateSimpleStyle,
  formatMessageTimestamp,
  getEmojiUrl,
} from "@/utils/chatFunctions";
import { Text } from "@chakra-ui/react/text";
import { Flex } from "@chakra-ui/react/flex";
import { Avatar } from "@chakra-ui/react/avatar";
import { lazy, memo, type MouseEvent } from "react";
import { BsRobot, BsThreeDots } from "react-icons/bs";
import { P2PMessageReplyUI } from "@/app/shared/message/message-map/message-reply-ui";
import { Separator } from "@chakra-ui/react/separator";
import { FaSmile } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { HiReply } from "react-icons/hi";
import type { MessageActionTranslations } from "@/types";
import { Tooltip, type TooltipProps } from "@/components/ui/tooltip";
import { P2PMessageReactionsRenderer } from "./reaction/message-reactions-renderer";

type handleReactToMessageT = {
  domRect: DOMRect;
  messageId: string;
  conversationId: string;
};

type ShowContextMenuDesktopT = {
  index: number;
  x: number;
  y: number;
};

type MessageItemContainerProps = {
  message: IMessage;
  showSimpleStyle: boolean;
  senderProfile?: IUser;
  MessageActionTranslations: MessageActionTranslations;
  handleShowReactToMessagePicker: (props: handleReactToMessageT) => void;
  handleDisplayGifFullScreen: (index: number) => void;
  handleOpenAttachmentFullScreen: (index: number, fileId: string) => void;
  index: number;
  handleReactToMessage: (index: number, emoji: string) => void;
  handleShowContextMenu: (props: ShowContextMenuDesktopT) => void;
  handleTriggerEditMode: (index: number, closeMenuFirst?: boolean) => void;
  handleInitiateReply: (index: number) => void;
  handleShowForwardUI: (index: number) => void;
  handleEditMesssage: (msgIndex: number, text: string) => void
  handleRemoveAttachment: (msgIndex: number, fileId: string) => void
};

type MessageFloatingMenuProps = {
  MessageActionTranslations: MessageActionTranslations;
  handleShowReactToMessagePicker: (props: handleReactToMessageT) => void;
  messageId: string;
  conversationId: string;
  handleReact: (emoji: string) => void;
  handleTriggerEditMode: (index: number, closeMenuFirst?: boolean) => void;
  handleInitiateReply: (index: number) => void;
  handleShowForwardUI: (index: number) => void;
  handleShowContextMenu: (props: ShowContextMenuDesktopT) => void;
  index: number;
  hasText: boolean
};

const MessageTextRenderer = lazy(
  () => import("@/app/shared/message/message-map/message-text-renderer"),
);

const ShowFullTimeStampTooltip = lazy(
  () => import("@/app/shared/message/show-full-createdAt-tooltip"),
);

const MessageGifRender = lazy(
  () => import("@/app/shared/message/message-map/message-gif-render"),
);

const MessageAttachmentRenderer = lazy(
  () => import("@/app/shared/message/message-map/attachment/message-attachment-render"),
);

const MessageFloatingMenu = memo(
  (props: MessageFloatingMenuProps) => {
    const {
      MessageActionTranslations,
      handleShowReactToMessagePicker,
      messageId,
      conversationId,
      handleReact,
      handleTriggerEditMode,
      index,
      handleShowContextMenu,
      hasText
    } = props;

    const randomFavouriteReaction = [
      { emoji: "👍", value: "thumbs_up" },
      { emoji: "❤️", value: "heart" },
      { emoji: "😂", value: "laughing" },
    ];

    const { editMessage, replyMessage, addReaction, forwardMessage, moreText } =
      MessageActionTranslations;

    const tooltipProps: Partial<TooltipProps> = {
      positioning: {
        placement: "top",
      },
      contentProps: {
        padding: "8px",
        rounded: "md",
        color: "fg",
        css: {
          "--tooltip-bg": "colors.bg",
        },
      },
      portalled: false,
    };

    const handleEmojiButtonClick = (e: MouseEvent<HTMLDivElement>) => {
      const domRect = e.currentTarget.getBoundingClientRect();
      if (domRect) {
        void handleShowReactToMessagePicker({
          conversationId,
          messageId,
          domRect,
        });
      }
    };

    const handleOpenMenu = (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()

      const x = rect.left
      const y = rect.top

      handleShowContextMenu({
        index,
        x, y
      })
    }


    return (
      <div className="MessageFloatingMenu">
        {randomFavouriteReaction.map((emoji) => {
          return (
            <div
              onClick={() => handleReact(emoji.emoji)}
              key={emoji.value}
              className="flooatingMenuEmoji"
              style={{
                backgroundImage: `url(${getEmojiUrl(emoji.emoji)})`,
              }}
            ></div>
          );
        })}

        <Separator mx="3px" orientation="vertical" h={4} />

        <Tooltip {...tooltipProps} content={addReaction}>
          <div
            onClick={handleEmojiButtonClick}
            className="MessageItemFloatingMenuButton"
          >
            <FaSmile />
          </div>
        </Tooltip>

        {hasText && <Tooltip {...tooltipProps} content={editMessage}>
          <div
            onClick={() => handleTriggerEditMode(index)}
            className="MessageItemFloatingMenuButton"
          >
            <BiSolidPencil />
          </div>
        </Tooltip>}

        <Tooltip content={replyMessage} {...tooltipProps}>
          <div
            onClick={() => props.handleInitiateReply(index)}
            className="MessageItemFloatingMenuButton"
          >
            <HiReply />
          </div>
        </Tooltip>

        <Tooltip {...tooltipProps} content={forwardMessage}>
          <div
            onClick={() => props.handleShowForwardUI(index)}
            className="MessageItemFloatingMenuButton"
          >
            <HiReply style={{ transform: "scaleX(-1)" }} />
          </div>
        </Tooltip>

        <Tooltip {...tooltipProps} content={moreText}>
          <div onClick={handleOpenMenu} className="MessageItemFloatingMenuButton">
            <BsThreeDots />
          </div>
        </Tooltip>
      </div>
    );
  },
  () => true,
);

const MessageItemContainer = (props: MessageItemContainerProps) => {
  const {
    message,
    showSimpleStyle,
    senderProfile,
    MessageActionTranslations,
    handleShowReactToMessagePicker,
    handleDisplayGifFullScreen,
    index,
    handleOpenAttachmentFullScreen,
    handleReactToMessage,
    handleShowContextMenu,
    handleTriggerEditMode,
    handleInitiateReply,
    handleRemoveAttachment
  } = props;

  

  const disPlayGifFullScreen = () => {
    void handleDisplayGifFullScreen(index);
  };

  const openAttFullScreen = (fileId: string) => {
    void handleOpenAttachmentFullScreen(index, fileId);
  };

  const handleReaction = (emoji: string) => {
    handleReactToMessage(index, emoji);
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleShowContextMenu({
      index,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const hasText = Boolean(message.type === "default" && message.text && message.text.trim.length > 0)
  return (
    <div className="messageItem">
      <Flex
        justifyContent="center"
        alignItems="center"
        h={message.isReplied ? "75px" : showSimpleStyle ? "25px" : "50px"}
        minW={{ base: "16%", lg: "65px" }}
        maxW={{ base: "16%", lg: "65px" }}
        direction="column"
        alignSelf="stretch"
        gap="3px"
        id={message._id}
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

        {showSimpleStyle && !message.isReplied && (
          <Text
            userSelect="none"
            cursor="pointer"
            color="fg.muted"
            fontWeight="500"
            fontSize="xs"
            className="simpleDate"
          >
            {formatDateSimpleStyle(message.createdAt)}
          </Text>
        )}
      </Flex>

      <Flex

        py={showSimpleStyle ? "2px" : "2px" }
        flexDir="column"
        flex={1}
      >
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
              fontSize="sm"
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

        {/* Message Contents */}
        <Flex onContextMenu={handleContextMenu}  direction="column">
          {message.type === "default" && message.text && (
            <MessageTextRenderer
              handleEditMesssage={props.handleEditMesssage}
              handleTriggerEditMode={handleTriggerEditMode}
              index={index}
              messageId={message._id}
              text={message.text}
            />
          )}
          {message.type === "gif" && message.gif && (
            <div
              style={{
                paddingTop: showSimpleStyle ? "5px" : "",
              }}
            >
              <MessageGifRender
                gifData={message.gif}
                disPlayGifFullScreen={disPlayGifFullScreen}
              />
            </div>
          )}
          {message.type === "default" &&
            message.attachments &&
            message.attachments.length > 0 && (
              <MessageAttachmentRenderer
                msgIndex={index}
                handleRemoveAttachment={handleRemoveAttachment}
                attachments={message.attachments}
                displayAttachmentFullscreen={openAttFullScreen}
              />
            )}
          {message.reactions &&
            Object.entries(message.reactions).length > 0 && (
              <P2PMessageReactionsRenderer
                handleReaction={handleReaction}
                reactions={message.reactions}
              />
            )}
        </Flex>
      </Flex>

      <MessageFloatingMenu
        hasText={hasText}
        handleShowContextMenu={handleShowContextMenu}
        handleShowForwardUI={props.handleShowForwardUI}
        handleInitiateReply={handleInitiateReply}
        index={index}
        handleTriggerEditMode={handleTriggerEditMode}
        handleReact={handleReaction}
        conversationId={message.conversationId}
        messageId={message._id}
        handleShowReactToMessagePicker={handleShowReactToMessagePicker}
        MessageActionTranslations={MessageActionTranslations}
      />
    </div>
  );
};

export default memo(MessageItemContainer, (prevProps, nextProps) => {
  const isRerender =
    prevProps.message.updatedAt === nextProps.message.updatedAt &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.reactions === nextProps.message.reactions;
    prevProps.showSimpleStyle === nextProps.showSimpleStyle

  return isRerender;
});

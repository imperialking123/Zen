import type { IMessage, IUser } from "@/types/schema";
import {
  formatDateSimpleStyle,
  formatMessageTimestamp,
} from "@/utils/chatFunctions";
import { Text } from "@chakra-ui/react/text";
import { Flex } from "@chakra-ui/react/flex";
import { Avatar } from "@chakra-ui/react/avatar";
import { lazy, memo } from "react";
import { BsRobot } from "react-icons/bs";
import { P2PMessageReplyUI } from "@/app/shared/message/message-map/message-reply-ui";

type MessageItemContainerProps = {
  message: IMessage;
  showSimpleStyle: boolean;
  senderProfile?: IUser;
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
  () => import("@/app/shared/message/message-map/message-attachment-render"),
);

const MessageItemContainer = (props: MessageItemContainerProps) => {
  const { message, showSimpleStyle, senderProfile } = props;

  const hasReactions =
    message.reactions && Object.keys(message.reactions).length > 0;

  const disPlayGifFullScreen = () => {};

  return (
    <div className="messageItem">
      <Flex
        justifyContent="center"
        alignItems="center"
        h={message.isReplied ? "75px" : showSimpleStyle ? "25px" : "50px"}
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

        {showSimpleStyle && !message.isReplied && (
          <Text
            userSelect="none"
            cursor="pointer"
            color="fg.muted"
            fontWeight="500"
            fontSize="xs"
            className="simple"
          >
            {formatDateSimpleStyle(message.createdAt)}
          </Text>
        )}
      </Flex>

      <Flex
        pb={
          showSimpleStyle
            ? hasReactions
              ? "5px"
              : "2.5px"
            : { base: "3.5px", lg: "3px" }
        }
        flexDir="column"
        w="full"
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
        <Flex w="full" direction="column">
          {message.type === "default" && message.text && (
            <MessageTextRenderer text={message.text} />
          )}
          {message.type === "gif" && message.gif && (
            <MessageGifRender
              gifData={message.gif}
              disPlayGifFullScreen={disPlayGifFullScreen}
            />
          )}
          {message.type === "default" &&
            message.attachments &&
            message.attachments.length > 0 && (
              <MessageAttachmentRenderer
                attachments={message.attachments}
                displayAttachmentFullscreen={disPlayGifFullScreen}
              />
            )}
        </Flex>
      </Flex>
    </div>
  );
};

export default memo(MessageItemContainer, (prevProps, nextProps) => {
  const isRerender =
    prevProps.message.updatedAt === nextProps.message.updatedAt &&
    prevProps.message.status === nextProps.message.status;

  return isRerender;
});

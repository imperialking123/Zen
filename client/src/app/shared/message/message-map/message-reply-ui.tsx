import userAuthStore from "@/store/user-auth-store";
import userChatStore from "@/store/user-chat-store";
import type { IMessage } from "@/types/schema";
import { Avatar } from "@chakra-ui/react/avatar";
import { Flex } from "@chakra-ui/react/flex";
import { Text } from "@chakra-ui/react/text";
import { useTranslation } from "react-i18next";
import { BsImageFill, BsRobot } from "react-icons/bs";
import { useMemo, memo, useCallback } from "react";

const P2PMessageReplyUI = ({
  replyToMessage,
}: {
  replyToMessage?: IMessage;
}) => {


  const selectedConversation = userChatStore((state) => state.selectedConversation);
  const authUser = userAuthStore((state) => state.authUser);

  const otherUser = replyToMessage && authUser && selectedConversation
    ? replyToMessage.senderId === authUser._id
      ? authUser
      : selectedConversation.otherUser
    : null;

  const { t: translate } = useTranslation(["chat"]);


  const { messageDeletedText } = translate("MessageReplyUI") as unknown as {
    messageDeletedText: string;
  };



  const replyRendition = useMemo(() => {
    if (
      !replyToMessage ||
      typeof replyToMessage === "undefined" ||
      typeof replyToMessage === "string"
    ) {
      return (
        <Text
          fontSize="sm"
          cursor="pointer"
          color="fg.muted"
          fontStyle="italic"
        >
          {messageDeletedText}
        </Text>
      );
    }

    if (replyToMessage && replyToMessage.type === "default") {
      return (
        <Flex alignItems="center" gap="5px" w="full" minW="0">
          {replyToMessage.text && replyToMessage.text.length > 0 && (
            <Text
              fontSize="sm"
              color="fg.muted"
              fontStyle="italic"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              w="0"
              flex="1"
            >
              {replyToMessage.text}
            </Text>
          )}{" "}
          {replyToMessage.attachments &&
            replyToMessage.attachments.length > 0 && (
              <Flex flexShrink="0">
                <BsImageFill color="fg.muted" />
              </Flex>
            )}
        </Flex>
      );
    }
    return null;
  }, [replyToMessage, messageDeletedText]);


  const hasReplyTo = !!replyToMessage;

  // Memoize scrollToReplied function  only recreates when replyToMessage._id changes
  const scrollToReplied = useCallback(() => {
    if (!hasReplyTo || !replyToMessage?._id) return;

    const el = document.getElementById(replyToMessage._id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("message-blink");
      el.classList.add("message-blink");
    }
  }, [hasReplyTo, replyToMessage?._id]);

  return (
    <Flex userSelect="none" gap="5px" alignItems="center" pl="5px" w="full" minW="0">
      {otherUser && (
        <Flex gap="5px" alignItems="center" flexShrink="0">
          <Avatar.Root boxSize="20px">
            <Avatar.Fallback>
              <BsRobot style={{ width: "10px", height: "10px" }} />
            </Avatar.Fallback>
          </Avatar.Root>

          <Text
            color="fg.muted"
            _hover={{
              textDecor: "underline",
            }}
          >
            {otherUser.displayName}
          </Text>
        </Flex>
      )}
      <Flex flex="1" minW="0" onClick={scrollToReplied}>
        {replyRendition}
      </Flex>
    </Flex>
  );
};

const MemoizedP2PMessageReplyUI = memo(P2PMessageReplyUI);

export { MemoizedP2PMessageReplyUI as P2PMessageReplyUI };

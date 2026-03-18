import { AbsoluteCenter, Flex, Heading, Text } from "@chakra-ui/react";

import MessageTopRibbon from "./components/top-message-ribbon";
import { useTranslation } from "react-i18next";
import MessagesWrapper from "./components/messages-wrapper";

import { useEffect, useState } from "react";
import AuthLogo from "@/components/ui/logo-export";
import type { IConversation } from "@/types/schema";
import { getMessages } from "@/utils/chatFunctions";
import MessageInputUI from "@/app/shared/message/message-input-ui";
import { useNavigate, useParams } from "react-router-dom";
import userChatStore from "@/store/user-chat-store";

export const NoConversationSelectedUI = () => {
  return (
    <AbsoluteCenter
      pos="relative"
      maxW="full"
      minW="full"
      minH="full"
      maxH="full"
      userSelect="none"
      flexDir="column"
    >
      <AuthLogo />
      <Heading mt={10} size="lg" mb={2}>
        Conversations start here
      </Heading>
      <Text
        w={{ lg: "auto", md: "auto", base: "90%" }}
        textAlign="center"
        color="fg.muted"
        fontSize="md"
      >
        Choose a chat, speak your mind, and let the flow take over!
      </Text>
    </AbsoluteCenter>
  );
};

const MessageContainer = () => {
  const { t: translate } = useTranslation(["chat"]);
  const { id } = useParams();
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation>();

  const conversations = userChatStore((state) => state.conversations);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const getConversation = conversations.find((p) => p._id === id);

    if (getConversation) {
      setSelectedConversation(getConversation);
      userChatStore.setState({ selectedConversation: getConversation });
      if (!getConversation.isTemp) {
        getMessages(getConversation._id);
        document.title = ` • Zen | @${getConversation.otherUser.username}`;
      }
    } else {
      navigate("/app/chat", { replace: true });
    }
  }, [id, navigate]);

  if (!selectedConversation) {
    return <NoConversationSelectedUI />;
  }

  const messageInputPlaceholder = translate("messageInputPlaceholder", {
    username: selectedConversation.otherUser.username,
  });

  const handleUnSelectConversation = () => {
    navigate("..");
    userChatStore.setState({
      selectedConversation: null,
    });
  };

  return (
    <Flex direction="column" maxW="full" minW="full" minH="full" maxH="full">
      <MessageTopRibbon
        handleUnSelectConversation={handleUnSelectConversation}
        otherUser={selectedConversation?.otherUser}
      />
      <MessagesWrapper />
      <MessageInputUI inputPlaceHolder={messageInputPlaceholder} />
    </Flex>
  );
};

export default MessageContainer;

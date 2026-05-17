import { AbsoluteCenter, Flex, Heading, Text } from "@chakra-ui/react";

import MessageTopRibbon from "./components/top-message-ribbon";
import { useTranslation } from "react-i18next";
import MessagesWrapper from "./components/messages-wrapper";

import { useEffect, useState } from "react";
import AuthLogo from "@/components/ui/logo-export";
import type { IConversation } from "@/core/types/schema";
import { getMessages } from "@/core/utils/chatFunctions";
import MessageInputUI from "@/shared/message/message-input-ui";
import { useNavigate, useParams } from "react-router-dom";
import userChatStore from "@/core/store/user-chat-store";

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


  const [isUserProfileSidebarOpen, setIsUserProfileSidebarOpen] = useState<boolean | "default">("default")


  if (!selectedConversation) {
    navigate("/app")
    return <div></div>
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
    <Flex direction="column" className="message-container" maxW="full" minW="full" minH="full" maxH="full">




      <MessageTopRibbon
        isUserProfileSidebarOpen={Boolean(isUserProfileSidebarOpen)}
        handleUnSelectConversation={handleUnSelectConversation}
        otherUser={selectedConversation?.otherUser}
        onToggleUserProfileSidebar={() => setIsUserProfileSidebarOpen(!isUserProfileSidebarOpen)}
      />
      <Flex gap="3px" h="calc(100% - 55px)" >
        <Flex w={{
          base: "full",
          lg: isUserProfileSidebarOpen ? "65%" : "full"

        }} direction="column">
          <MessagesWrapper />
          <MessageInputUI inputPlaceHolder={messageInputPlaceholder} />
        </Flex>

        <Flex
          display={{
            base: "flex",
            md: "none",
            lg: isUserProfileSidebarOpen ? "flex" : "none"
          }}
          borderLeft={{
            base: "none",
            lg: "1px solid var(--chakra-colors-bg-emphasized)"
          }}
          position={{
            base: "fixed",
            md: "static",
            lg: "static"
          }}
          inset={{
            base: "0",
            md: "auto",
            lg: "auto"
          }}
          flex={{
            base: "none",
            md: "0",
            lg: "1"
          }}
          transform={{
            base: isUserProfileSidebarOpen === "default" ? "translateX(100%)" : isUserProfileSidebarOpen ? "translateX(0)" : "translateX(100%)",
            md: "none",
            lg: "none"
          }}
          transition={{
            base: "transform 0.3s ease-out",
            md: "none",
            lg: "none"
          }}
          zIndex={{
            base: "overlay",
            md: "auto",
            lg: "auto"
          }}
          direction="column"
        >

        </Flex>
      </Flex>








    </Flex>
  );
};

export default MessageContainer;






import { Flex } from "@chakra-ui/react";
import userChatStore from "@/store/user-chat-store";
import ChatSideBar from "./components/chat-side-bar";

import { Outlet } from "react-router-dom";

const ChatsContainer = () => {
  const selectedConversation = userChatStore(
    (state) => state.selectedConversation,
  );

  return (
    <Flex w="full" h="full" roundedTopLeft={{ lg: "15px", md: "15px" }}>
      <ChatSideBar />

      <Flex
        pos={{ base: "fixed", md: "relative", lg: "relative" }}
        right={{
          base: selectedConversation ? "0%" : "-100%",
          md: "auto",
          lg: "auto",
        }}
        transition="0.3s ease"
        zIndex={{ base: 20, md: "auto", lg: "auto" }}
        h={{ base: "100dvh", md: "auto", lg: "auto" }}
        w={{ base: "100vw", md: "70%", lg: "73%" }}
        bg={{
          base: "bg",
          md: "inherit",
          lg: "inherit",
        }}
      >
        <Outlet />
      </Flex>
    </Flex>
  );
};

export default ChatsContainer;

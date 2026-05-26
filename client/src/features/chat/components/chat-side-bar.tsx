import { Flex, Heading, IconButton, Input, InputGroup } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import userChatStore from "@/core/store/user-chat-store";
import CreateDmUI from "./create-dm";
import ConversationItem from "./conversation-item";
import userAuthStore from "@/core/store/user-auth-store";

const ChatSideBar = () => {
  const { t: translate } = useTranslation(["chat"]);

  const { id: activeConversationId } = useParams<{ id: string }>();

  const conversations = userChatStore((state) => state.conversations);
  const authUser = userAuthStore(s => s.authUser)
  const chatTitle = translate("ChatTitle");
  const newChatText = translate("NewChat");
  const searchText = translate("SearchChats");
  const selectConnectionsTitle = translate("selectConnectionsTitle");
  const selectConnectionsDescription = translate(
    "selectConnectionsDescription",
  );


  const searchConnectionsPlaceHolder = translate(
    "searchConnectionsPlaceHolder",
  );

  const noConnectionsText = translate("noConnectionsText")

  return (
    <Flex
      borderRight={{ base: "none", lg: "1px solid ", md: "1px solid" }}
      borderColor={{
        base: "none",
        lg: "colorPalette.muted",
        md: "colorPalette.muted",
      }}
      w={{ base: "100%", lg: "27%", md: "30%" }}
      direction="column"
      alignItems="center"
    >
      {/*Top Bar */}
      <Flex
        alignItems="center"
        w="full"
        direction="column"
      >
        <Flex
          userSelect="none"
          alignItems="center"
          justifyContent="space-between"
          w="full"
          p="10px"
        >
          <Heading
            fontSize={{ base: "2xl", md: "xl", lg: "xl" }}
            fontWeight="600"
          >
            {chatTitle}
          </Heading>
          <CreateDmUI
            noConnectionsText={noConnectionsText}
            searchConnectionsPlaceHolder={searchConnectionsPlaceHolder}
            selectConnectionsTitle={selectConnectionsTitle}
            selectConnectionsDescription={selectConnectionsDescription}
            newChatText={newChatText}
          >
            <IconButton
              focusRing="none"
              rounded="full"
              variant="ghost"
              size="xs"
            >
              <LuPlus />
            </IconButton>
          </CreateDmUI>
        </Flex>

        <Flex minW="95%" maxW="95%" justifyContent="center" alignItems="center">
          <InputGroup>
            <Input
              rounded="lg"
              variant="subtle"
              w="full"
              placeholder={searchText}
              size="sm"
              maxLength={35}
            />
          </InputGroup>
        </Flex>
      </Flex>

      {/*Top Bar */}

      <Flex

        css={{
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "bg.emphasized",
            borderRadius: "full",
          },
        }}
        overflowY="auto"
        gap="5px"
        p="10px"
        direction="column"
        w="full"
        flex={1}
      >
        {conversations
          .filter((p) => !p.isTemp)
          .map((convo) => {
            const isSelected = activeConversationId === convo._id;
            return (
              <ConversationItem
                currentUserId={authUser?._id ?? ""}
                convoItem={convo}
                key={convo._id || `temp-${convo.otherUser._id}-${convo.createdAt}`}
                isSelected={isSelected}
              />
            );
          })}
      </Flex>
    </Flex>
  );
};
export default ChatSideBar;






import { Flex, Input, InputGroup, ScrollArea, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";

import { ConnectionItem } from "./connection-item";
import type { ConnectionType, IConversation } from "@/types/schema";
import userConnectionStore from "@/store/user-connections-store";
import userChatStore from "@/store/user-chat-store";
import { useNavigate } from "react-router-dom";
import userAuthStore from "@/store/user-auth-store";


const AllConnectionsUI = ({
  connections,
}: {
  connections: ConnectionType[];
}) => {
  const { t: translate } = useTranslation(["connection"]);
  const searchConnectionsPlaceHolderText = translate(
    "searchConnectionsPlaceHolderText",
  );

  const deletingConnection = userConnectionStore(
    (state) => state.deletingConnection,
  );

  const connectionLength = connections.length;

  const START_VIDEO_CALL_TEXT = translate("START_VIDEO_CALL_TEXT");
  const START_VOICE_CALL_TEXT = translate("START_VOICE_CALL_TEXT");
  const REMOVE_CONNECTION_TEXT = translate("REMOVE_CONNECTION_TEXT");
  const SEND_MESSAGE_TEXT = translate("SEND_MESSAGE_TEXT");
  const MORE_TEXT = translate("MORE_TEXT");
  const ALL_CONNECTION_HEADER_TEXT = translate("ALL_CONNECTION_HEADER_TEXT");

  const navigate = useNavigate()
  const authUser = userAuthStore(s => s.authUser!)
  const handleCreateDM = (connection: ConnectionType) => {



    const getConvo = userChatStore
      .getState()
      .conversations.find((p) =>
        p.participants.includes(connection.otherUser._id),
      );

    if (getConvo) {
      navigate(`/app/chat/${getConvo._id}`);
      return
    }






    const conversationOBJ: IConversation = {
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      _id: crypto.randomUUID(),
      isTemp: true,
      otherUser: connection.otherUser,
      participants: [authUser._id || "", connection.otherUser._id],
      relation: "connection",
      connectionId: connection._id,
      showFor: [connection.otherUser._id, authUser._id],
    };


    userChatStore.setState((state) => {
      const conversations = [conversationOBJ, ...state.conversations];

      return {
        conversations,
      };
    });

    navigate(`/app/chat/${conversationOBJ._id}`);

  };

  return (
    <Flex
      gap="10px"
      pt="10px"
      direction="column"
      flex={1}
      alignItems="center"
      maxH="full"
      minH="full"
    >
      <Flex
        minW={{ base: "95%", lg: "95%" }}
        maxW={{ base: "95%", lg: "95%" }}
        justifyContent="center"
        alignItems="center"
      >
        <InputGroup startElement={<FiSearch />}>
          <Input
            variant="subtle"
            w="full"
            placeholder={searchConnectionsPlaceHolderText}
            maxLength={35}
          />
        </InputGroup>
      </Flex>

      <ScrollArea.Root>
        <ScrollArea.Viewport>
          <ScrollArea.Content paddingEnd="3" textStyle="sm">
            <Flex
              gap="10px"
              px="10px"
              w="full"
              userSelect="none"
              direction="column"
            >
              <Text ml="2%" mt="5px" mb="5px" fontSize="md">
                {ALL_CONNECTION_HEADER_TEXT} - {connectionLength}
              </Text>

              {connections.map((connection) => {
                const isDeleting = deletingConnection.includes(connection._id);

                return (
                  <ConnectionItem
                    handleCreateDM={handleCreateDM}
                    isDeleting={isDeleting}
                    MORE_TEXT={MORE_TEXT}
                    connectionItem={connection}
                    START_VOICE_CALL_TEXT={START_VOICE_CALL_TEXT}
                    SEND_MESSAGE_TEXT={SEND_MESSAGE_TEXT}
                    key={connection._id}
                    START_VIDEO_CALL_TEXT={START_VIDEO_CALL_TEXT}
                    REMOVE_CONNECTION_TEXT={REMOVE_CONNECTION_TEXT}
                  />
                );
              })}
            </Flex>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar />
      </ScrollArea.Root>
    </Flex>
  );
};

export default AllConnectionsUI;

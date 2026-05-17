import { Flex, Input, InputGroup, ScrollArea, Text } from "@chakra-ui/react";

import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {
  ReceivedConnectionPingItem,
  SentPendingConnectionPingItem,
} from "./connection-item";
import type { connectionPingType } from "@/core/types/schema";
import userConnectionStore from "@/core/store/user-connections-store";


const PendingSentConnectionPingMapper = ({
  sentConnectionPings,
}: {
  sentConnectionPings: connectionPingType[];
}) => {
  if (Array.isArray(sentConnectionPings) && sentConnectionPings.length < 1)
    return null;

  const { deletingConnection } = userConnectionStore();
  const sentLength = sentConnectionPings.length;

  return (
    <Flex gap="10px" px="10px" w="full" userSelect="none" direction="column">
      <Text ml="2%" mt="5px" mb="5px" fontSize="md">
        Sent - {sentLength}
      </Text>

      {sentConnectionPings.map((item) => {
        const isDeleting = deletingConnection.includes(item._id);

        return (
          <SentPendingConnectionPingItem
            isDeleting={isDeleting}
            key={item._id}
            pendingItem={item}
          />
        );
      })}
    </Flex>
  );
};

const ReceivedConnectionPingMapper = ({
  receivedConnectionPings,
}: {
  receivedConnectionPings: connectionPingType[];
}) => {
  if (
    Array.isArray(receivedConnectionPings) &&
    receivedConnectionPings.length < 1
  )
    return null;

  const sentLength = receivedConnectionPings.length;

  const { deletingConnection } = userConnectionStore();

  return (
    <Flex px="10px" w="full" userSelect="none" direction="column">
      <Text ml="2%" mt="10px" mb="10px" fontSize="md">
        Received - {sentLength}
      </Text>

      {receivedConnectionPings.map((item) => {
        const isDeleting = deletingConnection.includes(item._id);

        return (
          <ReceivedConnectionPingItem
            isDeleting={isDeleting}
            key={item._id}
            pendingItem={item}
          />
        );
      })}
    </Flex>
  );
};

const PendingConnectionsUI = ({
  sentConnectionPings,
  receivedConnectionPings,
}: {
  sentConnectionPings: connectionPingType[];
  receivedConnectionPings: connectionPingType[];
}) => {
  const { t: translate } = useTranslation(["connection"]);
  const searchConnectionsPlaceHolderText = translate(
    "searchConnectionsPlaceHolderText"
  );

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
            <PendingSentConnectionPingMapper
              sentConnectionPings={sentConnectionPings}
            />
            <ReceivedConnectionPingMapper
              receivedConnectionPings={receivedConnectionPings}
            />
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar />
      </ScrollArea.Root>
    </Flex>
  );
};

export default PendingConnectionsUI;






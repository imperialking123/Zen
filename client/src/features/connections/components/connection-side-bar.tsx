import { Button, Flex, Heading } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AllConnectionsUI from "./all-connection-ui";
import NewConnectionUI from "./new-connection-ui";
import PendingConnectionsUI from "./pending-connection-ui";
import userConnectionStore from "@/core/store/user-connections-store";

const ConnectionSideBar = () => {
  const {
    connections,
    onlineConnections,
    receivedConnectionPings,
    sentConnectionPings,
  } = userConnectionStore();
  const { t: translate } = useTranslation(["connection"]);

  const [showConnectionsUiOff, setShowConnectionUiOff] = useState<
    "online" | "all" | "new" | "pending"
  >(() => {
    if (
      Array.isArray(receivedConnectionPings) &&
      receivedConnectionPings.length > 0
    ) {
      return "pending";
    }
    if (Array.isArray(connections) && connections.length > 0) {
      return "all";
    }
    return "new";
  });

  const connectionHeaderText = translate("ConnectionHeaderText");

  const ConnectionAddButtonText = translate("ConnectionAddButtonText");
  const OnlineConnectionsButtonText = translate("OnlineConnectionsButtonText");
  const PendingPingsButtonText = translate("PendingPingsButtonText");
  const AllConnectionsButtonText = translate("AllConnectionsButtonText");

  const hasPending =
    (Array.isArray(receivedConnectionPings) &&
      receivedConnectionPings.length > 0) ||
    (Array.isArray(sentConnectionPings) && sentConnectionPings.length > 0);

  return (
    <Flex
      minW={{ base: "100%", lg: "40%" }}
      maxW={{ base: "100%", lg: "40%" }}
      borderRight={{ base: "none", lg: "1px solid " }}
      borderColor={{ base: "none", lg: "colorPalette.muted" }}
      direction="column"
      alignItems="center"
      maxH="100%"
      overflow="hidden"
    >
      <Flex
        userSelect="none"
        alignItems="center"
        justifyContent="space-between"
        w="full"
        px="10px"
        py="8px"
        maxH="8%"
        minH="8%"
        borderBottom="1px solid"
        borderColor="colorPalette.muted"
      >
        <Heading fontWeight="600">{connectionHeaderText}</Heading>

        <Flex gap="10px" alignItems="center">
          {Array.isArray(onlineConnections) && onlineConnections.length > 0 && (
            <Button
              rounded="md"
              variant="ghost"
              size={{ base: "sm", lg: "xs" }}
            >
              {OnlineConnectionsButtonText}
            </Button>
          )}
          {Array.isArray(connections) && connections.length > 0 && (
            <Button
              rounded="md"
              onClick={() => setShowConnectionUiOff("all")}
              variant="ghost"
              size={{ base: "sm", lg: "xs" }}
            >
              {AllConnectionsButtonText}
            </Button>
          )}

          {hasPending && (
            <Button
              rounded="md"
              variant={showConnectionsUiOff === "pending" ? "subtle" : "ghost"}
              size={{ base: "sm", lg: "xs" }}
              onClick={() => setShowConnectionUiOff("pending")}
            >
              {PendingPingsButtonText}
              {receivedConnectionPings.length > 0 && (
                <Flex
                  ml="2"
                  bg="red.500"
                  color="white"
                  w="4"
                  h="4"
                  borderRadius="full"
                  justifyContent="center"
                  alignItems="center"
                  fontSize="2xs"
                  fontWeight="bold"
                >
                  {receivedConnectionPings.length > 9
                    ? "9+"
                    : receivedConnectionPings.length}
                </Flex>
              )}
            </Button>
          )}
          <Button
            rounded="md"
            onClick={() => setShowConnectionUiOff("new")}
            size={{ base: "sm", lg: "xs" }}
          >
            <LuPlus />
            {ConnectionAddButtonText}
          </Button>
        </Flex>
      </Flex>

      <Flex minH="calc(100% - 8%)" maxH="calc(100% - 8%)" w="full">
        {showConnectionsUiOff === "pending" && (
          <PendingConnectionsUI
            sentConnectionPings={sentConnectionPings}
            receivedConnectionPings={receivedConnectionPings}
          />
        )}
        {showConnectionsUiOff === "all" && (
          <AllConnectionsUI connections={connections} />
        )}
        {showConnectionsUiOff === "new" && <NewConnectionUI />}
      </Flex>
    </Flex>
  );
};

export default ConnectionSideBar;






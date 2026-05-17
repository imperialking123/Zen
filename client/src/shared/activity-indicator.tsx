import { Box, Flex, Float, Text } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import userPresenseStore from "@/core/store/user-presense-store";

export const OnlineIndicator = ({ userId }: { userId: string }) => {
  const presence = userPresenseStore((state) => state.onlinePresenses[userId]);
  const isOnline = !!presence;

  const getIndicatorConfig = () => {
    if (!isOnline) return { color: "#80848e", status: "offline" };
    if (presence.availability === "dnd") return { color: "#f23f43", status: "dnd" };
    if (presence.availability === "idle") return { color: "#f0b232", status: "idle" };
    return { color: "#23a55a", status: "online" };
  };

  const { color, status } = getIndicatorConfig();

  return (
    <Float placement="bottom-end" offset="2">
      <Box
        w="16px"
        h="16px"
        rounded="full"
        bg="bg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.3s ease-in-out"
      >
        <Box
          w="10px"
          h="10px"
          rounded="full"
          bg={status === "offline" ? "transparent" : color}
          border={status === "offline" ? "2px solid" : "none"}
          borderColor={color}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {status === "dnd" && (
            <Box w="6px" h="2px" bg="bg" rounded="full" />
          )}
          {status === "idle" && (
            <Box
              position="absolute"
              top="-3px"
              left="-3px"
              w="7px"
              h="7px"
              rounded="full"
              bg="bg"
            />
          )}
        </Box>
      </Box>
    </Float>
  );
};

export const ConversationActivityIndicator = ({
  userId,
}: {
  userId: string;
}) => {
  const presence = userPresenseStore((state) => state.onlinePresenses[userId]);
  const isOnline = !!presence;
  const typing = userPresenseStore((state) => state.typingEvents[userId]);
  const isTyping = !!typing;

  const getStatusConfig = () => {
    if (!isOnline) return { color: "#80848e", status: "offline" };
    if (presence.availability === "dnd") return { color: "#f23f43", status: "dnd" };
    if (presence.availability === "idle") return { color: "#f0b232", status: "idle" };
    return { color: "#23a55a", status: "online" };
  };

  const { color, status } = getStatusConfig();

  return (
    <Float placement="bottom-end" offset="2">
      <Box
        p={isTyping ? "0px" : "3px"}
        rounded="full"
        bg="bg"
        transition="all 0.3s ease-in-out"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {isTyping ? (
          <Box
            bg={color}
            rounded="full"
            px="6px"
            h="16px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <BeatLoader
              color="white"
              margin={1}
              size={4}
              cssOverride={{ display: "flex" }}
            />
          </Box>
        ) : (
          <Box
            w="10px"
            h="10px"
            rounded="full"
            bg={status === "offline" ? "transparent" : color}
            border={status === "offline" ? "2px solid" : "none"}
            borderColor={color}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            {status === "dnd" && <Box w="6px" h="2px" bg="bg" rounded="full" />}
            {status === "idle" && (
              <Box
                position="absolute"
                top="-3px"
                left="-3px"
                w="7px"
                h="7px"
                rounded="full"
                bg="bg"
              />
            )}
          </Box>
        )}
      </Box>
    </Float>
  );
};

export const P2PChatIndicator = ({
  userId,
  displayName,
}: {
  userId: string | undefined;
  displayName: string | undefined;
}) => {
  if (!userId) return;
  const typing = userPresenseStore((state) => state.typingEvents[userId]);
  const isTyping = !!typing;

  const { t } = useTranslation(["chat"]);

  const typingText = t("typingText", {
    name: displayName,
  });

  return (
    <Flex
      userSelect="none"
      pointerEvents="none"
      fontSize="13px"
      minW="full"
      maxW="full"
      rounded="md"
      gap="10px"
      minH="20px"
      bg="transparent"
    >
      {isTyping && (
        <Flex
          w={{ lg: "7%" }}
          alignItems="center"
          justifyContent="center"
          minW="60px"
        >
          <BeatLoader size={8} />
        </Flex>
      )}

      {isTyping && <Text>{typingText}</Text>}
    </Flex>
  );
};






import type { WrapperCustomEventState } from "@/core/notifications/wrapper-custom-event";
import { WrapperCustomEventDetailType } from "@/core/notifications/wrapper-custom-event";

import { Button, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FaArrowDown } from "react-icons/fa";

interface P2PMessagingActionBarProps {
  event: WrapperCustomEventState;
  onDismiss: () => void;
}

const P2PMessagingActionBar = ({ event, onDismiss }: P2PMessagingActionBarProps) => {
  const isVisible = Boolean(event);
  const { t: translate } = useTranslation(["chat"])
  const getText = (): string => {
    if (event && event.type === WrapperCustomEventDetailType.NEW_MESSAGES_BOTTOM) {
      return translate("newMessagesBottom");
    }
    return "";
  };

  return (
    <Flex
      pos="fixed"
      bottom="110px"
      left="50%"
      gap="10px"
      transform={
        isVisible
          ? "translateX(-50%) translateY(0) scale(1)"
          : "translateX(-50%) translateY(50px) scale(0.8)"
      }
      opacity={isVisible ? 1 : 0}
      pointerEvents={isVisible ? "auto" : "none"}
      transition="transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease-in-out"
      h="40px"
      w="max-content"
      maxW="280px"
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      boxShadow="lg"
      borderRadius="full"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      px="4"
    >
      <Text fontSize="xs" >
        {getText()}
      </Text>
      <Button
        size="xs"
        borderRadius="full"
        px="3"
        display="flex"
        alignItems="center"
        gap="1.5"
        onClick={() => onDismiss()}
      >
        <FaArrowDown size={10} />

      </Button>
    </Flex>
  );
};

export default P2PMessagingActionBar;

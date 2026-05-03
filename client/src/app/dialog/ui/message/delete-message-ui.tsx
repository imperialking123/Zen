import type { IMessage, IUser } from "@/types/schema";
import {
  Button,
  CloseButton,
  Flex,
  Heading,
  Text,
  type SystemStyleObject,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import MessageItemPreview from "./message-item-preview";
import { createDialog } from "../../create-dialog";
import userChatStore from "@/store/user-chat-store";

const DeleteMessageUI = ({
  message,
  senderProfile,
}: {
  message: IMessage;
  senderProfile: IUser;
}) => {
  const scrollCSS: SystemStyleObject = {
    scrollBehavior: "smooth",
    "&::-webkit-scrollbar": {
      width: "5px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "fg.muted",
      borderRadius: "full",
    },
  };
  const handleClose = () => {
    const id = "DeleteMesageUI";
    createDialog.close(id)
  };

  const deleteMessage = userChatStore.getState().deleteMessage

  const handleDeleteMessage = () => {
    void deleteMessage({ convoId: message.conversationId, messageId: message._id })

    handleClose()

  };

  const { t: translate, i18n } = useTranslation(["chat"]);

  const { headerText, descriptionText, deleteText, cancelText } = translate(
    "DeleteMessageUI",
  ) as unknown as {
    headerText: string;
    descriptionText: string;
    cancelText: string;
    deleteText: string;
  };

  return (
    <Flex
      display="flex"
      pb="10px"
      w="full"
      direction="column"
      h={{ base: "100dvh", md: "auto", lg: "auto" }}
      maxH={{ base: "100dvh", md: "75dvh", lg: "75dvh" }}
      overflow="hidden"
    >
      {/* Top section - fixed height */}
      <Flex direction="column" flex="0 0 auto">
        {/*Top UI */}
        <Flex direction="column">
          <Flex px="15px" pt="10px" w="full" flexDir="column">
            <Flex justifyContent="space-between">
              <Heading>{headerText}</Heading>
              <CloseButton
                focusRing="none"
                rounded="xl"
                onClick={handleClose}
              />
            </Flex>

            <Text>{descriptionText}</Text>
          </Flex>
        </Flex>
        {/*Top UI */}
      </Flex>

      {/*Message Display Mappings UI */}
      <Flex
        my="10px"
        css={scrollCSS}
        overflowY="auto"
        direction="column"
        gap="5px"
        px="10px"
        alignItems="center"
        py="8px"
        flex="1  auto"
        minH="0"
        w="full"
      >
        <MessageItemPreview language={i18n.language} senderProfile={senderProfile} message={message} />
      </Flex>
      {/*Message Display Mappings UI */}

      {/* Bottom section - fixed height */}
      <Flex
        pb="10px"
        justifyContent="center"
        flexDir="column"
        w="full"
        flex="0 0 auto"
      >
        <Flex px="10px" w="full" gap="10px">
          <Button onClick={handleClose} variant="subtle" flex={1} rounded="lg">
            {cancelText}
          </Button>
          <Button flex={1} rounded="lg" onClick={handleDeleteMessage}>
            {deleteText}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DeleteMessageUI;

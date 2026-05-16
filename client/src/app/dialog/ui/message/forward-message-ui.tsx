import {
  type ConnectionType,
  type IConversation,
  type IMessage,
} from "@/types/schema";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  Heading,
  Input,
  InputGroup,
  Text,
  type SystemStyleObject,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { createDialog } from "../../create-dialog";
import { FaSearch } from "react-icons/fa";

import { getEmojiUrl } from "@/functions/chatFunctions";
import { IoMdImage } from "react-icons/io";
import { RiAttachment2 } from "react-icons/ri";
import { HiGif } from "react-icons/hi2";
import userConnectionStore from "@/store/user-connections-store";
import { BsRobot } from "react-icons/bs";
import { ConversationActivityIndicator } from "@/app/shared/activity-indicator";
import { useState } from "react";
import { IoSend } from "react-icons/io5";
import userChatStore from "@/store/user-chat-store";
import { axiosInstance } from "@/utils";
import { BeatLoader } from "react-spinners";
import userAuthStore from "@/store/user-auth-store";
import { useNavigate } from "react-router-dom";

const MessageTextRenderer = ({
  text,
  maxH,
}: {
  text: string;
  maxH: string;
}) => {
  const emojiRegex =
    /(\p{RI}\p{RI}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*/gu;

  const parts = text.split(emojiRegex);

  const showBig = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F){1,7}$/u.test(
    text.trim(),
  );

  return (
    <Box
      wordBreak="break-word"
      fontWeight="400"
      fontSize="13px"
      lineHeight="1.5"
      whiteSpace="pre-wrap"
      overflowWrap="anywhere"
      color="gray.700"
      _dark={{
        color: "gray.100",
      }}
      letterSpacing="0.01em"
      pb="5px"
      userSelect="text"
      lineClamp={3}
      maxH={maxH}
    >
      {parts.map((part, index) => {
        if (part.match(emojiRegex)) {
          return (
            <span className="emojiContainer">
              <img
                draggable={false}
                onError={(e) => (e.currentTarget.style.display = "none")}
                className="emoji"
                src={getEmojiUrl(part)}
                width={showBig ? "45px" : "22px"}
                height={showBig ? "45px" : "22px"}
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",

                  objectFit: "contain",
                }}
              />
            </span>
          );
        } else if (part) {
          return <span key={index}>{part}</span>;
        }
        return null;
      })}
    </Box>
  );
};

const ForwardMessagePreview = ({
  message,
  mediaText,
  fileText,
}: {
  message: IMessage;
  mediaText: string;
  fileText: string;
}) => {
  const HasAttachmentIndicator = () => {
    if (
      message.type === "default" &&
      message.attachments &&
      message.attachments.length > 0
    ) {
      const attachments = message.attachments;
      const visualAtt = attachments.filter(
        (p) => p.type === "video" || p.type === "image",
      );

      const files = attachments.filter(
        (p) => p.type === "audio" || p.type === "document",
      );

      if (visualAtt && visualAtt.length > 0) {
        const text = visualAtt.length > 1 ? `${mediaText}s` : `${mediaText}`;
        return (
          <Flex alignItems="center" gap="5px">
            <IoMdImage size={20} />
            <Text>
              {visualAtt.length} {text}
            </Text>
          </Flex>
        );
      }

      if (files && files.length > 0) {
        const text = files.length > 1 ? `${fileText}s` : `${fileText}`;

        return (
          <Flex alignItems="center" gap="5px">
            <RiAttachment2 size={20} />
            <Text>
              {files.length} {text}
            </Text>
          </Flex>
        );
      }
    } else {
      return null;
    }
  };

  return (
    <Flex w="full" maxH="80px">
      <Flex
        w="full"
        pl="5px"
        borderLeft="2px solid"
        borderColor="fg.muted"
        alignItems="center"
        justifyContent="space-between"
      >
        {message.type === "default" && (
          <Flex color="fg.muted" gap="8px" direction="column">
            {message.text && message.text.length > 0 && (
              <MessageTextRenderer
                maxH={
                  Array.isArray(message.attachments) &&
                  message.attachments.length > 0
                    ? "40px"
                    : "70px"
                }
                text={message.text}
              />
            )}
            <HasAttachmentIndicator />
          </Flex>
        )}
        {message.type === "gif" && (
          <Flex alignItems="center" w="full" justifyContent="space-between">
            <HiGif size={25} />

            <video
              className="isLoading"
              src={message.gif.preview}
              height="60px"
              width="60px"
              style={{
                objectFit: "cover",
                borderRadius: "15px",
              }}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

const ForwardMessageUI = ({ message }: { message: IMessage }) => {
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
  const { t: translate } = useTranslation(["chat"]);

  const {
    headerText,
    descriptionT,
    searchText,
    sendText,
    cancelText,
    mediaText,
    fileText,
    maxSelectedT,
    notFoundText,
  } = translate("ForwardMessageUI") as unknown as {
    headerText: string;
    descriptionT: string;
    searchText: string;
    mediaText: string;
    fileText: string;
    cancelText: string;
    sendText: string;
    maxSelectedT: string;
    notFoundText: string;
  };

  const handleClose = () => {
    const forwardToId = "forwardToUI";
    createDialog.close(forwardToId);
  };

  const connections = userConnectionStore((state) => state.connections);
  const conversations = userChatStore((s) => s.conversations);
  const addPendingMessage = userChatStore((s) => s.addPendingMessage);
  const forwardMessage = userChatStore((state) => state.forwardMessage);
  const authUser = userAuthStore((s) => s.authUser);
  const currentConversation = conversations.find(
    (p) => p._id === message.conversationId,
  );

  const messageFetchHistory = userChatStore(
    (state) => state.conversationMessagesFetchHistory,
  );
  const navigate = useNavigate();

  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>(
    [],
  );

  const [searchedConnections, setSearchedConnections] = useState<
    ConnectionType[]
  >([]);
  const [searchInput, setSearchInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedConnectionIds((prev) =>
      prev.includes(id)
        ? prev.filter((existingId) => existingId !== id)
        : [...prev, id],
    );
  };

  const sendTextT =
    selectedConnectionIds.length > 1
      ? `${sendText} (${selectedConnectionIds.length})`
      : sendText;

  const descriptionText =
    selectedConnectionIds.length === 5 ? maxSelectedT : descriptionT;

  const handleOnchange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value === "") {
      setSearchInput(value);
      setSearchedConnections(connections);
      return;
    }

    const filtered = connections.filter(
      (cn) =>
        cn.otherUser?.username?.toLowerCase()?.includes(value) ||
        cn.otherUser?.displayName?.toLowerCase()?.includes(value),
    );

    setSearchedConnections(filtered);
    setSearchInput(value);
  };

  const handleForwardMessage = async () => {
    if (!authUser) return;
    const existingConversationIds: string[] = [];
    const missingConnectionIds: string[] = [];
    setIsSending(true);

    selectedConnectionIds.forEach((connId) => {
      const findConvo = conversations.find(
        (d) => d.connectionId === connId && !d.isTemp,
      );

      if (findConvo) {
        existingConversationIds.push(findConvo._id);
      } else {
        missingConnectionIds.push(connId);
      }
    });

    let allConversationIds = [...existingConversationIds];
    const allConversation = conversations.filter((conv) =>
      existingConversationIds.includes(conv._id),
    );

    // Create missing conversations if needed
    if (missingConnectionIds.length > 0) {
      const res = await axiosInstance.post<{ conversations: IConversation[] }>(
        "/conversations/create/bulk",
        { missingConnectionIds },
      );

      res.data.conversations.forEach((convo) => {
        userChatStore.getState().addConversation(convo);
        allConversationIds.push(convo._id);
      });
    }

    allConversation.forEach((convo) => {
      const date = new Date().toISOString();

      const tempId = crypto.randomUUID();

      const receiverId = convo.participants.find((p) => p !== authUser._id);

      if (!receiverId) return;

      const newMessage = {
        _id: tempId,
        isForwarded: true,
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        status: "sending",
        type: message.type,
        createdAt: date,
        updatedAt: date,
        ...(message.type === "default" &&
          "text" in message && { text: message.text }),
        ...(message.type === "gif" && "gif" in message && { gif: message.gif }),
      } as IMessage;

      if (messageFetchHistory.includes(convo._id)) {
        addPendingMessage({ message: newMessage, conversationId: convo._id });
      }
    });

    if (isSending) return;

    forwardMessage({
      conversationIds: allConversationIds,
      messageContent: message,
    });

    const lastConvo = allConversation[allConversation.length - 1];

    handleClose();

    if (lastConvo) {
      navigate(`/app/chat/${lastConvo._id}`);
    }
  };

  return (
    <Flex display="flex" pb="10px" w="full" direction="column" h="full">
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

          <Flex px="15px">
            <InputGroup startElement={<FaSearch />}>
              <Input
                onChange={handleOnchange}
                w="full"
                rounded="lg"
                placeholder={searchText}
              />
            </InputGroup>
          </Flex>
        </Flex>
        {/*Top UI */}
      </Flex>

      {/*Connection Mappings UI - takes remaining space */}
      <Flex
        css={scrollCSS}
        overflow="auto"
        direction="column"
        gap="5px"
        px="10px"
        alignItems="center"
        py="8px"
        flex="1 1 0"
        minH="0"
      >
        {/* Your mapping code here - same as before */}
        {connections.length > 0 &&
          !searchInput &&
          connections
            .filter((p) => p._id !== currentConversation?.connectionId || "")
            .map((connection) => {
              const user = connection.otherUser;

              if (!user) return null;

              const isChecked = selectedConnectionIds.includes(connection._id);

              const showDisabledStyling = isChecked
                ? false
                : selectedConnectionIds.length === 5;

              return (
                <Flex
                  opacity={showDisabledStyling ? "80%" : "100%"}
                  cursor={showDisabledStyling ? "disabled" : "pointer"}
                  onClick={() => {
                    if (showDisabledStyling) return;
                    handleSelect(connection._id);
                  }}
                  p="5px"
                  pl="10px"
                  pr="15px"
                  justifyContent="space-between"
                  rounded="lg"
                  key={connection._id}
                  w="full"
                  _hover={{ bg: "bg.muted" }}
                >
                  <Flex gap="15px" alignItems="center">
                    <Flex pos="relative">
                      {/*Alert setup profile pic here */}
                      <Avatar.Root size="xs">
                        <Avatar.Fallback>
                          <BsRobot />
                        </Avatar.Fallback>
                      </Avatar.Root>

                      <ConversationActivityIndicator
                        userId={connection.otherUser._id}
                      />
                    </Flex>

                    <Flex direction="column">
                      <Text fontWeight="600">{user.displayName}</Text>
                      <Text color="fg.muted">{user.username}</Text>
                    </Flex>
                  </Flex>
                  <Checkbox.Root checked={isChecked}>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control rounded="md" />
                  </Checkbox.Root>
                </Flex>
              );
            })}

        {searchInput &&
          searchInput.length > 0 &&
          searchedConnections.length > 0 &&
          searchedConnections.map((connection) => {
            const user = connection.otherUser;

            if (!user) return null;

            const isChecked = selectedConnectionIds.includes(connection._id);

            const showDisabledStyling = isChecked
              ? false
              : selectedConnectionIds.length === 5;

            return (
              <Flex
                opacity={showDisabledStyling ? "80%" : "100%"}
                cursor={showDisabledStyling ? "disabled" : "pointer"}
                onClick={() => {
                  if (showDisabledStyling) return;
                  handleSelect(connection._id);
                }}
                p="5px"
                pl="10px"
                pr="15px"
                justifyContent="space-between"
                rounded="lg"
                key={connection._id}
                w="full"
                _hover={{ bg: "bg.muted" }}
              >
                <Flex gap="15px" alignItems="center">
                  <Flex pos="relative">
                    {/*Alert setup profile pic here */}
                    <Avatar.Root size="xs">
                      <Avatar.Fallback>
                        <BsRobot />
                      </Avatar.Fallback>
                    </Avatar.Root>

                    <ConversationActivityIndicator
                      userId={connection.otherUser._id}
                    />
                  </Flex>

                  <Flex direction="column">
                    <Text fontWeight="600">{user.displayName}</Text>
                    <Text color="fg.muted">{user.username}</Text>
                  </Flex>
                </Flex>
                <Checkbox.Root checked={isChecked}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control rounded="md" />
                </Checkbox.Root>
              </Flex>
            );
          })}

        {searchInput && searchedConnections.length === 0 && (
          <Flex w="full" pt="4" px={5} justifyContent="center">
            <Text textAlign="center">{notFoundText}</Text>
          </Flex>
        )}
      </Flex>
      {/*Connection Mappings UI */}

      {/* Bottom section - fixed height */}
      <Flex
        pb="10px"
        justifyContent="center"
        flexDir="column"
        w="full"
        flex="0 0 auto"
      >
        <Flex
          direction="column"
          p="8px"
          borderTop="1px solid"
          borderColor="bg.emphasized"
        >
          <ForwardMessagePreview
            fileText={fileText}
            mediaText={mediaText}
            message={message}
          />
        </Flex>
        <Flex px="10px" w="full" gap="10px">
          <Button onClick={handleClose} variant="subtle" flex={1} rounded="lg">
            {cancelText}
          </Button>
          <Button
            disabled={selectedConnectionIds.length < 1}
            flex={1}
            rounded="lg"
            onClick={handleForwardMessage}
          >
            {isSending ? (
              <BeatLoader size={10} color="white" />
            ) : (
              <>
                {sendTextT} <IoSend />
              </>
            )}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ForwardMessageUI;

import {
  Avatar,
  Checkbox,
  Flex,
  IconButton,
  Menu,
  Portal,
  Text,
  type MenuSelectionDetails,
} from "@chakra-ui/react";

import { LuX } from "react-icons/lu";

import { useTranslation } from "react-i18next";

import { IoMdCheckmark } from "react-icons/io";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoChatbubbleSharp } from "react-icons/io5";
import { useId } from "react";
import type { connectionPingType, ConnectionType, IUser } from "@/core/types/schema";
import { Tooltip } from "@/components/ui/tooltip";
import { acceptConnectionPing, deleteSentConnectionPing, handleRemoveConnection, ignoreConnectionPing } from "@/core/utils/connections-functions";
import { OnlineIndicator } from "@/shared/activity-indicator";


export const SentPendingConnectionPingItem = ({
  pendingItem,
  isDeleting,
}: {
  pendingItem: connectionPingType;
  isDeleting: boolean;
}) => {
  const pingedUser = pendingItem.to as IUser;

  const { t } = useTranslation(["connection"]);

  const CancelConnectionPingText = t("CancelConnectionPing");

  return (
    <Flex
      animation={isDeleting ? "pulse" : ""}
      borderColor={{ _light: "gray.200", _dark: "gray.900" }}
      p="10px"
      w="full"
      justifyContent="space-between"
      alignItems="center"
      transition="0.2s ease"
      borderTop="1px solid"
      _hover={{
        bg: { _light: "gray.200", _dark: "gray.900" },
        rounded: "10px",
      }}
    >
      <Flex gap="8px" alignItems="center">
        <Avatar.Root>
          <Avatar.Fallback name={pingedUser.displayName || "Z"} />
          <Avatar.Image src={pingedUser.profile?.profilePic} />
        </Avatar.Root>

        <Flex direction="column">
          <Text fontSize="md" fontWeight="600">
            {pingedUser.displayName}
          </Text>
          <Text color={{ _light: "gray.500", _dark: "gray.300" }}>
            {pingedUser.username}
          </Text>
        </Flex>
      </Flex>

      <Tooltip
        positioning={{ placement: "top" }}
        showArrow
        content={CancelConnectionPingText}
      >
        <IconButton
          _hover={{
            colorPalette: "red",
          }}
          rounded="full"
          variant="ghost"
          onClick={() => deleteSentConnectionPing(pendingItem._id, isDeleting)}
        >
          <LuX />
        </IconButton>
      </Tooltip>
    </Flex>
  );
};

export const ReceivedConnectionPingItem = ({
  pendingItem,
  isDeleting,
}: {
  pendingItem: connectionPingType;
  isDeleting: boolean;
}) => {
  const pingFrom = pendingItem.from as IUser;

  const { t } = useTranslation(["connection"]);

  const ignoreConnectionText = t("ignoreConnectionText");

  const acceptConnectionText = t("acceptConnectionText");

  return (
    <Flex
      animation={isDeleting ? "pulse" : ""}
      borderColor={{ _light: "gray.200", _dark: "gray.900" }}
      p="10px"
      w="full"
      justifyContent="space-between"
      alignItems="center"
      transition="0.2s ease"
      borderTop="1px solid"
      _hover={{
        bg: { _light: "gray.200", _dark: "gray.900" },
        rounded: "10px",
      }}
    >
      <Flex gap="8px" alignItems="center">
        <Avatar.Root>
          <Avatar.Fallback name={pingFrom.displayName || "Z"} />
          <Avatar.Image src={pingFrom.profile?.profilePic} />
        </Avatar.Root>

        <Flex direction="column">
          <Text fontSize="md" fontWeight="600">
            {pingFrom.displayName}
          </Text>
          <Text color={{ _light: "gray.500", _dark: "gray.300" }}>
            {pingFrom.username}
          </Text>
        </Flex>
      </Flex>

      <Flex alignItems="center" gap="10px">
        <Tooltip
          positioning={{ placement: "top" }}
          showArrow
          content={ignoreConnectionText}
        >
          <IconButton
            onClick={() =>
              ignoreConnectionPing(pendingItem._id.toString(), isDeleting)
            }
            rounded="full"
            variant="ghost"
          >
            <LuX />
          </IconButton>
        </Tooltip>

        <Tooltip
          positioning={{ placement: "top" }}
          showArrow
          content={acceptConnectionText}
        >
          <IconButton
            onClick={() => acceptConnectionPing(pendingItem._id)}
            _hover={{
              colorPalette: "green",
            }}
            rounded="full"
            variant="ghost"
          >
            <IoMdCheckmark />
          </IconButton>
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export const ConnectionItem = ({
  connectionItem,
  START_VIDEO_CALL_TEXT,
  START_VOICE_CALL_TEXT,
  SEND_MESSAGE_TEXT,
  REMOVE_CONNECTION_TEXT,
  MORE_TEXT,
  isDeleting,
  handleCreateDM
}: {
  connectionItem: ConnectionType;
  START_VIDEO_CALL_TEXT: string;
  START_VOICE_CALL_TEXT: string;
  REMOVE_CONNECTION_TEXT: string;
  SEND_MESSAGE_TEXT: string;
  MORE_TEXT: string;
  isDeleting: boolean;
  handleCreateDM: (connection: ConnectionType) => void
}) => {
  const otherUser = connectionItem.otherUser;

  const triggerId = useId();

  const handleOnSelect = (event: MenuSelectionDetails) => {
    switch (event.value) {
      case "remove:connection":
        handleRemoveConnection(connectionItem._id);
        break;
    }
  };

  return (
    <Flex
      p="10px"
      animation={isDeleting ? "pulse" : "none"}
      borderTop="1px solid"
      borderTopColor="bg.muted"
      w="full"
      justifyContent="space-between"
      alignItems="center"
      transition="0.2s ease"
      _hover={{
        bg: "bg.muted",
        rounded: "10px",
      }}
    >
      <Flex gap="8px" alignItems="center">
        <Avatar.Root>
          <Avatar.Fallback />
          <Avatar.Image src={otherUser.profile?.profilePic} />
          <OnlineIndicator userId={otherUser._id} />
        </Avatar.Root>

        <Flex direction="column">
          <Text fontSize="md" fontWeight="600">
            {otherUser.displayName}
          </Text>
          <Text color={{ _light: "gray.500", _dark: "gray.300" }}>
            {otherUser.username}
          </Text>
        </Flex>
      </Flex>

      <Flex alignItems="center" gap="10px">
        <Tooltip
          lazyMount
          unmountOnExit
          showArrow
          positioning={{ placement: "top" }}
          content={SEND_MESSAGE_TEXT}
        >
          <IconButton
            onClick={() => handleCreateDM(connectionItem)}
            _hover={{
              bg: "bg.emphasized",
            }}
            variant="ghost"
            rounded="full"
          >
            <IoChatbubbleSharp />
          </IconButton>
        </Tooltip>

        <Menu.Root
          lazyMount
          unmountOnExit
          onSelect={handleOnSelect}
          positioning={{ placement: "top" }}
          ids={{ trigger: triggerId }}
        >
          <Tooltip
            ids={{ trigger: triggerId }}
            positioning={{ placement: "top" }}
            content={MORE_TEXT}
            showArrow
          >
            <Menu.Trigger focusRing="none" asChild>
              <IconButton
                _hover={{
                  bg: "bg.emphasized",
                }}
                variant="ghost"
                rounded="full"
              >
                <HiOutlineDotsVertical />
              </IconButton>
            </Menu.Trigger>
          </Tooltip>
          <Portal>
            <Menu.Positioner>
              <Menu.Content rounded="lg">
                <Menu.Item rounded="sm" value="start:video">
                  {START_VIDEO_CALL_TEXT}
                </Menu.Item>
                <Menu.Item rounded="sm" value="start:audio">
                  {START_VOICE_CALL_TEXT}
                </Menu.Item>
                <Menu.Item
                  color="fg.error"
                  _hover={{ bg: "bg.error", color: "fg.error" }}
                  rounded="sm"
                  value="remove:connection"
                >
                  {REMOVE_CONNECTION_TEXT}
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
};

export const CreateDmConnectionItem = ({
  connectionItem,
  isSelected,
  handleSelectConnection,
}: {
  connectionItem: ConnectionType;
  isSelected: boolean;
  handleSelectConnection: (connectionData: ConnectionType) => void;
}) => {
  return (
    <Flex
      onClick={() => handleSelectConnection(connectionItem)}
      userSelect="none"
      justifyContent="space-between"
      p="5px"
      alignItems="center"
      _hover={{
        bg: "bg.muted",
      }}
      rounded="md"
      transition="0.2s ease"
      px="10px"
    >
      <Flex alignItems="center" gap="5px">
        <Avatar.Root>
          <Avatar.Fallback name={connectionItem.otherUser.displayName} />

          {connectionItem.otherUser?.profile?.profilePic && (
            <Avatar.Image src={connectionItem.otherUser.profile.profilePic} />
          )}
        </Avatar.Root>

        <Flex flexDirection="column">
          <Text fontWeight="600">{connectionItem.otherUser.displayName}</Text>
          <Text color="fg.muted" fontSize="xs">
            {connectionItem.otherUser.username}
          </Text>
        </Flex>
      </Flex>

      <Checkbox.Root checked={isSelected}>
        <Checkbox.HiddenInput />
        <Checkbox.Control rounded="sm" />
      </Checkbox.Root>
    </Flex>
  );
};






import type { MessageActionTranslations } from "@/types";
import type { IMessage } from "@/types/schema";
import { getEmojiUrl } from "@/utils/chatFunctions";
import { Flex, Separator } from "@chakra-ui/react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from "react";
import { useTranslation } from "react-i18next";
import { FaSmile } from "react-icons/fa";
import { HiReply } from "react-icons/hi";
import { IoCopy } from "react-icons/io5";
import type { IconType } from "react-icons/lib";
import { MdDelete, MdModeEdit } from "react-icons/md";

type ContextMenuT = {
  x: number;
  y: number;
  index: number;
  message: IMessage;
};

type handleShowReactToMessageT = {
  domRect: DOMRect;
  messageId: string;
  conversationId: string;
  closeMenuFirst?: boolean;
};

type MessageItemContextMenuProps = {
  data: ContextMenuT;
  setContextMenu: Dispatch<SetStateAction<ContextMenuT | null>>;
  displayedMessages: IMessage[];
  handleShowReactToMessagePicker: (props: handleShowReactToMessageT) => void;
  handleInitiateReply: (index: number, closeMenuFirst?: boolean) => void;
  handleShowForwardUI: (index: number, closeMenuFirst?: boolean) => void;
  handleCopyText: (index: number, closeMenuFirst?: boolean) => void;
  handlePromptForDelete: (index: number, closeMenuFirst?: boolean) => void;
  handleTriggerEditMode: (index: number, closeMenuFirst?: boolean) => void
};

interface ButtonProps extends ComponentPropsWithRef<"div"> {
  value: string;
  text: string;
  icon: IconType;
  isDangerItem?: boolean;
}

const Button = (props: ButtonProps) => {
  return (
    <Flex
      cursor="pointer"
      fontSize="sm"
      alignItems="center"
      justifyContent="space-between"
      p="7px"
      rounded="sm"
      _hover={{
        bg: props.isDangerItem ? "red.subtle" : "bg.muted",
      }}
      color={props.isDangerItem ? "red" : ""}
      w="full"
      {...props}
      userSelect="none"
    >
      {props.text}
      <props.icon
        color={
          props.isDangerItem
            ? "var(--chakra-colors-red"
            : "var(--chakra-colors-fg-muted)"
        }
        size={props.isDangerItem ? 22 : 19}
      />
    </Flex>
  );
};

const MarkUnreadIcon = () => (
  <svg
    aria-hidden="true"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="19"
    fill="none"
    viewBox="0 0 24 24"
    color="var(--chakra-colors-fg-muted)"
  >
    <path
      d="M12.93 21.96c.25-.03.43-.23.47-.47a3 3 0 0 1 .08-.35.66.66 0 0 0-.24-.71A3 3 0 0 1 12 18v-3a3 3 0 0 1 4.35-2.68c.14.07.3.09.44.04a7 7 0 0 1 4.58.05c.3.1.63-.1.63-.41a10 10 0 1 0-18.45 5.36c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12c.32 0 .63-.01.93-.04Z"
      fill="currentColor"
    />
    <path
      d="M18 17h-1.24a3 3 0 1 1 .26 4.25 1 1 0 1 0-1.33 1.5A4.98 4.98 0 0 0 24 19a5 5 0 0 0-8-4 1 1 0 0 0-2 0v3a1 1 0 0 0 1 1h3a1 1 0 1 0 0-2Z"
      fill="currentColor"
    />
  </svg>
);

const MessageItemContextMenu = (props: MessageItemContextMenuProps) => {
  const randomFavouriteReaction = [
    { emoji: "👍", value: "thumbs_up" },
    { emoji: "❤️", value: "heart" },
    { emoji: "🔥", value: "fire" },
    { emoji: "✅", value: "check" },
  ];

  const { message, x, y } = props.data;

  if (!message) return null;

  const hasText = Boolean(
    message.type === "default" && message.text?.trim().length,
  );

  const { t } = useTranslation(["chat"]);

  const translations = t(
    "messageActions",
  ) as unknown as MessageActionTranslations;

  const menuRef = useRef<HTMLDivElement>(null);

  type placement = {
    canShow: boolean;
    top: number;
    left: number;
  };

  const [placement, setPlacement] = useState<placement>({
    canShow: false,
    left: 0,
    top: 0,
  });

  const calculatePlacement = () => {
    if (!menuRef.current) return;

    const wrapper = document.getElementById("message-wrapper");
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();

    const MENU_WIDTH = 185;
    const MENU_HEIGHT = 300;

    let left = x;
    let top = y;

    if (x + MENU_WIDTH > wrapperRect.right) {
      left = x - MENU_WIDTH;
    }

    if (left < wrapperRect.left) {
      left = wrapperRect.left;
    }

    if (y + MENU_HEIGHT > wrapperRect.bottom) {
      top = y - MENU_HEIGHT;
    }

    if (top < wrapperRect.top) {
      top = wrapperRect.top;
    }

    const viewportLeft = left;
    const viewportTop = top;

    setPlacement({
      canShow: true,
      left: viewportLeft,
      top: viewportTop,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        props.setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    calculatePlacement();
  }, [x, y]);

  const handleShowReactToMessagePicker = (
    e: ReactMouseEvent<HTMLDivElement>,
  ) => {
    const boundingRect = e.currentTarget.getBoundingClientRect();

    const message = props.data.message;
    props.handleShowReactToMessagePicker({
      conversationId: message.conversationId,
      messageId: message._id,
      domRect: boundingRect,
      closeMenuFirst: true,
    });

    props.setContextMenu(null);
  };

  const handleInitiateReply = () => {
    props.handleInitiateReply(props.data.index, true);
  };

  return (
    <Flex
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      opacity={placement.canShow ? 100 : 0}
      pointerEvents={placement.canShow ? "auto" : "none"}
      ref={menuRef}
      w="185px"
      pos="fixed"
      top={placement.top}
      left={placement.left}
      bg="bg"
      boxShadow="md"
      rounded="md"
      p="5px"
      flexDir="column"
      alignItems="center"
      gap="5px"
      pt="10px"
    >
      <Flex gap="5px" alignItems="center">
        {randomFavouriteReaction.map((emoji) => {
          return (
            <div
              key={emoji.value}
              className="MessageItemContextMenuEmoji"
              style={{
                backgroundImage: `url(${getEmojiUrl(emoji.emoji)})`,
              }}
            ></div>
          );
        })}
      </Flex>

      <Button
        onClick={handleShowReactToMessagePicker}
        icon={FaSmile}
        text={translations.addReaction}
        value="addReaction"
      />

      <Separator w="full" />
      {hasText && message.status === "sent" && (
        <>
          <Button
            onClick={() => props.handleTriggerEditMode(props.data.index, true)}
            text={translations.editMessage}
            value="editMessage"
            icon={MdModeEdit}
          />
          <Button
            text={translations.copyText}
            onClick={() => props.handleCopyText(props.data.index, true)}
            value="copyText"
            icon={IoCopy}
          />
        </>
      )}
      <Button
        onClick={handleInitiateReply}
        text={translations.replyMessage}
        value="replyMessage"
        icon={HiReply}
      />

      <Button
        onClick={() => props.handleShowForwardUI(props.data.index, true)}
        text={translations.forwardMessage}
        value="forwardMessage"
        icon={() => (
          <HiReply
            style={{ transform: "scaleX(-1)" }}
            size={20}
            color="var(--chakra-colors-fg-muted)"
          />
        )}
      />
      <Separator w="full" />
      <Button
        text="Mark Unread"
        value="markUnread"
        icon={() => <MarkUnreadIcon />}
      />

      <Button
        onClick={() => props.handlePromptForDelete(props.data.index, true)}
        isDangerItem
        text={translations.deleteMessage}
        value="deleteMessage"
        icon={MdDelete}
      />
    </Flex>
  );
};

export default MessageItemContextMenu;

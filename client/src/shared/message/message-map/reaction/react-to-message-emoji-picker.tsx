import EmojiMappingUI from "@/shared/emoji-and-reactions/emojis-mapping";
import userAuthStore from "@/core/store/user-auth-store";
import userChatStore from "@/core/store/user-chat-store";
import { Flex } from "@chakra-ui/react/flex";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

// This component will be used to render emoji when clicked it will
// react to a message what do you think

type ShowReactToMessagePicker = {
  isShow: boolean;
  messageId: string;
  domRect: DOMRect | null;
  conversationId: string;
};

type ReactToMessageEmojiPickerProps = {
  messageId: string;
  domRect: DOMRect;
  conversationId: string;
  setShowReactToMessagePicker: Dispatch<
    SetStateAction<ShowReactToMessagePicker>
  >;
};

const ReactToMessageEmojiPicker = (props: ReactToMessageEmojiPickerProps) => {
  const { domRect, setShowReactToMessagePicker, conversationId, messageId } =
    props;
  const pickerRef = useRef<HTMLDivElement>(null);
  const addOrRemoveP2PMessageReaction = userChatStore(
    (state) => state.addOrRemoveP2PMessageReaction,
  );
  const authUser = userAuthStore((state) => state.authUser);

  const placement = domRect.toJSON();

  const width = {
    base: "95dvw",
    sm: "350px",
    md: "350px",
    lg: "380px",
  };
  const height = {
    base: "65dvh",
  };

  const handleOnEmojiSelect = (emoji: string) => {
    if (!authUser) return;
    addOrRemoveP2PMessageReaction({
      conversationId,
      messageId,
      emoji,
      userId: authUser._id,
      username: authUser.username,
    });

    setShowReactToMessagePicker({
      conversationId: "",
      messageId: "",
      domRect: null,
      isShow: false,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowReactToMessagePicker({
          conversationId: "",
          messageId: "",
          domRect: null,
          isShow: false,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (pickerRef.current) {
      pickerRef.current.focus();
    }
  }, []);

  const left = `${placement.left - 380}px`;

  return (
    <Flex
      ref={pickerRef}
      left={{ base: "50%", sm: left, md: left, lg: left }}
      transform={{
        base: "translateX(-50%)",
        sm: "none",
        md: "none",
        lg: "none",
      }}
      py="5px"
      rounded="md"
      boxShadow="sm"
      bg="bg"
      zIndex={99}
      pos="fixed"
      height={height}
      maxWidth={width}
      
      width={width}
    >
      <EmojiMappingUI onEmojiSelect={handleOnEmojiSelect} />
    </Flex>
  );
};

export default ReactToMessageEmojiPicker;






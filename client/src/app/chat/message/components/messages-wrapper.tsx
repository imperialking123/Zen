import { Flex } from "@chakra-ui/react";
import MessageStartUI from "./message-start-ui";
import { useTranslation } from "react-i18next";
import {
  Fragment,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import userChatStore from "@/store/user-chat-store";
import userAuthStore from "@/store/user-auth-store";
import type { MessageActionTranslations } from "@/types";
import type { Attachment, IMessage, IUser } from "@/types/schema";
import { createDialog } from "@/app/dialog/create-dialog";
import { initiateReplyTo } from "@/utils/chatFunctions";
import useConversationMessages from "@/hooks/use-conversation-messages";
import MessageSeparator from "./message-separator";
import MessageItemContainer from "@/app/shared/message/message-map/message-item-container";

const AttachmentFullScreenUI = lazy(
  () =>
    import("@/app/dialog/ui/attachment-preview/attachment-fullscreen-renderer"),
);

const ForwardMessageUI = lazy(
  () => import("@/app/dialog/ui/message/forward-message-ui"),
);

const GifFullScreenPreviewUI = lazy(
  () => import("@/app/dialog/ui/gif-fullscreen-preview"),
);

const DeleteMessageUI = lazy(
  () => import("@/app/dialog/ui/message/delete-message-ui"),
);

const MessagesWrapper = () => {
  const selectedConversation = userChatStore(
    (state) => state.selectedConversation,
  );
  const displayMessages = useConversationMessages(selectedConversation?._id);
  const authUser = userAuthStore((state) => state.authUser);
  const addOrRemoveP2PMessageReaction =
    userChatStore.getState().addOrRemoveP2PMessageReaction;

  const { t: translate } = useTranslation(["chat"]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const beginningOfChatText = translate("beginningOfChatText");
  const messageActions = translate(
    "messageActions",
  ) as unknown as MessageActionTranslations;

  const forwardText = translate("forwardText");

  const getUploadingFilesText = useCallback(
    (attachments: Attachment[]): string => {
      if (attachments.length === 1) {
        return attachments[0].name;
      } else if (attachments.length > 1) {
        translate("UploadingFiles", { number: attachments.length });
      }

      return "uploading";
    },
    [],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayMessages]);

  const disPlayGifFullScreen = useCallback(
    (message: IMessage, senderProfile: IUser) => {
      if (message.type === "gif") {
        const id = "showGifFullScreenId";
        createDialog.open(id, {
          contentWidth: "100%",
          contentRounded: "0px",
          dialogSize: "full",
          showCloseButton: false,
          showBackDrop: true,
          contentHeight: "100%",
          bodyPadding: "0px",

          contentBg: "transparent",
          content: (
            <Suspense>
              <GifFullScreenPreviewUI
                createdAt={message.createdAt}
                gifData={message.gif}
                senderProfile={senderProfile}
              />
            </Suspense>
          ),
        });
      }
    },
    [],
  );

  const handleInitiateReply = useCallback((message: IMessage) => {
    if (message.status === "sending") return;

    initiateReplyTo({
      conversationId: message.conversationId,
      messageId: message._id,
    });
  }, []);

  const openAttFullScreen = useCallback(
    ({
      fileId,
      message,
      senderProfile,
    }: {
      fileId: string;
      message: IMessage;
      senderProfile: IUser;
    }) => {
      if (
        message.type === "default" &&
        message.attachments &&
        message.attachments.length > 0
      ) {
        const visualAttachments = message.attachments.filter(
          (p) => p.type === "video" || p.type === "image",
        );

        const findAttachmentClicked = visualAttachments.find(
          (p) => p.fileId === fileId,
        );

        const arrangedArray = findAttachmentClicked
          ? [
            findAttachmentClicked,
            ...visualAttachments.filter((p) => p.fileId !== fileId),
          ]
          : visualAttachments;

        const id = "showAttachmentId";

        createDialog.open(id, {
          contentWidth: "100%",
          contentRounded: "0px",
          dialogSize: "full",
          showCloseButton: false,
          showBackDrop: true,
          contentHeight: "100%",
          bodyPadding: "0px",

          contentBg: "transparent",
          content: (
            <Suspense>
              <AttachmentFullScreenUI
                attachments={arrangedArray}
                createdAt={message.createdAt}
                senderProfile={senderProfile}
              />
            </Suspense>
          ),
        });
      }
    },
    [],
  );

  const handleShowForwardUI = useCallback((message: IMessage) => {
    const forwardToId = "forwardToUI";

    createDialog.open(forwardToId, {
      showCloseButton: false,
      bodyPadding: "0px",
      showBackDrop: true,
      contentRounded: { base: "0px", md: "sm", lg: "sm" },
      contentWidth: "100%",
      contentHeight: { base: "100%", lg: "75dvh", md: "75dvh" },

      content: (
        <Suspense>
          <ForwardMessageUI message={message} />
        </Suspense>
      ),
    });
  }, []);

  const handleShowDeleteUI = useCallback(
    (message: IMessage) => {
      if (!authUser || !selectedConversation) return;

      const senderProfile =
        message.senderId !== authUser._id
          ? selectedConversation.otherUser
          : authUser;

      if (message.status === "sending") return;

      const id = "DeleteMesageUI";
      createDialog.open(id, {
        showCloseButton: false,
        bodyPadding: "0px",
        showBackDrop: true,
        contentRounded: { base: "0px", md: "sm", lg: "sm" },
        contentWidth: "100%",

        content: (
          <Suspense>
            <DeleteMessageUI senderProfile={senderProfile} message={message} />
          </Suspense>
        ),
      });
    },
    [authUser, selectedConversation],
  );

  const handleCopyText = useCallback((message: IMessage) => {
    if (message.type !== "default") return;
    const text = message.text;

    if (text && text.length > 0) {
      if (navigator.clipboard) {
        try {
          navigator.clipboard.writeText(text);
        } catch (error) {
          console.log(
            "Failed To Log Text Error --->",
            (error as Error).message,
          );
        }
      }
    }
  }, []);

  interface handleReactionAddOrRemoveProps {
    messageId: string;
    conversationId: string;
    emoji: string;
  }

  const handleReact = useCallback(
    (props: handleReactionAddOrRemoveProps) => {
      const { messageId, conversationId, emoji } = props;
      if (!authUser) return;
      addOrRemoveP2PMessageReaction({
        messageId,
        conversationId,
        userId: authUser._id,
        emoji,
        username: authUser.username,
      });
    },
    [addOrRemoveP2PMessageReaction, authUser?._id],
  );

  const { currentUserProfile, otherUserProfile } = useMemo(() => ({
    currentUserProfile: authUser ?? undefined,
    otherUserProfile: selectedConversation?.otherUser ?? undefined,
  }), [authUser, selectedConversation?.otherUser]);

  return (
    <Flex
      flex={1}
      pt="1.5"
      pr={{ base: "0px", lg: "8px" }}
      overflowY="auto"
      direction="column"
      // Add smooth scrolling
      css={{
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "fg.muted",
          borderRadius: "full",
        },
      }}
      w="full"
    >
      <MessageStartUI
        beginningOfChatText={beginningOfChatText}
        otherUser={selectedConversation?.otherUser}
      />

      {/* Provide translated message action labels once to avoid repeated lookups. */}
      {displayMessages.map((message, i) => {
        const currentDay = new Date(message.createdAt).setHours(0, 0, 0, 0);
        const prevDay =
          i > 0
            ? new Date(displayMessages[i - 1].createdAt).setHours(0, 0, 0, 0)
            : null;
        const showSeparator = i === 0 || currentDay !== prevDay;
        const prevMessage = i > 0 ? displayMessages[i - 1] : null;

        const showSimpleStyle = prevMessage
          ? Math.abs(
            new Date(message.createdAt).getTime() -
            new Date(prevMessage.createdAt).getTime(),
          ) <
          60 * 1000 && prevMessage.senderId === message.senderId
          : false;

        const isMine = message.senderId === authUser?._id;
        const senderProfile = isMine ? currentUserProfile : otherUserProfile;
        return (
          <Fragment key={message._id} >
            {showSeparator && (
              <MessageSeparator
                createdAt={message.createdAt}
              />
            )}
            <MessageItemContainer
              senderProfile={senderProfile}
              showSimpleStyle={showSimpleStyle}
              message={message}
            />
          </Fragment>
        );
      })}

      <Flex ref={scrollRef} minH="5px" p="1px" w="full" />
    </Flex>
  );
};

export default MessagesWrapper;

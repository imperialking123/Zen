import { CloseButton, Flex, Image, Text } from "@chakra-ui/react";
import { lazy, useEffect, useRef, useState, type ChangeEvent } from "react";
import { LuPlus, LuX } from "react-icons/lu";
import { FaFilePdf, FaFilePowerpoint } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoDocumentText } from "react-icons/io5";
import { BiSolidFileTxt } from "react-icons/bi";
import type { Attachment, DocumentMimeType } from "@/types/schema";
import { FaFileAudio, FaMicrophone } from "react-icons/fa";
import userChatStore from "@/store/user-chat-store";
import userAuthStore from "@/store/user-auth-store";
import { createDialog } from "@/app/dialog/create-dialog";
import AttachmentLimitUI from "@/app/dialog/ui/max-attachment-ui";
import { removeInitiatedReply } from "@/utils/chatFunctions";
import FileTooLargeUI from "@/app/dialog/ui/file-too-large";
import FileInvalidUI from "@/app/dialog/ui/file-invalid-ui";
import { useTranslation } from "react-i18next";
import FileDragUI from "@/app/dialog/ui/file-drag-ui";
import { P2PChatIndicator } from "../activity-indicator";
import type { GifData } from "@/types";
import { MdCancel } from "react-icons/md";
import { getImageBlurHash, getVideoBlurHash } from "@/utils";

export const DOCUMENT_MIME_TYPES: string[] = [
  "application/pdf", // PDF
  "application/msword", // Word DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word DOCX
  "application/vnd.ms-excel", // Excel XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel XLSX
  "application/vnd.ms-powerpoint", // PowerPoint PPT
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PowerPoint PPTX
  "text/plain", // TXT
];

export const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/aac",
  "audio/mp4",
];

export const IMAGE_MIME_TYPES: string[] = [
  "image/jpeg", // JPG / JPEG
  "image/png", // PNG
  "image/webp", // WebP
  "image/gif", // GIF
  "image/avif", // AVIF
];

export const VIDEO_MIME_TYPES: string[] = [
  "video/mp4", // MP4
  "video/webm", // WebM
  "video/ogg", // OGG
  "video/quicktime", // MOV
];

const getAttachmentType = (type: string) => {
  if (VIDEO_MIME_TYPES.includes(type)) return "video";
  if (IMAGE_MIME_TYPES.includes(type)) return "image";
  if (AUDIO_MIME_TYPES.includes(type)) return "audio";
  if (DOCUMENT_MIME_TYPES.includes(type)) return "document";
  return null;
};

export function getDocumentIcon(arg: DocumentMimeType, size: number) {
  switch (arg) {
    case "application/pdf":
      return <FaFilePdf size={size} />;
    case "application/msword":
      return <IoDocumentText size={size} />;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return <IoDocumentText size={size} />;
    case "application/vnd.ms-excel":
      return <PiMicrosoftExcelLogoFill size={size} />;
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return <IoDocumentText size={size} />;
    case "application/vnd.ms-powerpoint":
      return <FaFilePowerpoint size={size} />;
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return <FaFilePowerpoint size={size} />;
    case "text/plain":
      return <BiSolidFileTxt size={size} />;
  }
}

const EmojiGifPicker = lazy(
  () => import("@/app/shared/emoji-and-reactions/emoji-gif-picker"),
);

const AttachmentPreview = ({
  attachment,
  handleRemoveAttachment,
}: {
  attachment: Attachment;
  handleRemoveAttachment: (fileId: string) => void;
}) => {
  const handleClick = () => {
    handleRemoveAttachment(attachment.fileId);
  };

  return (
    <Flex
      minW="165px"
      maxW="165px"
      minH="165px"
      maxH="165px"
      key={attachment.fileId}
      pos="relative"
      direction="column"
      border="1px solid"
      borderColor="bg.emphasized"
      userSelect="none"
      rounded="md"
      alignItems="center"
      justifyContent="center"
      zIndex={5}
    >
      <CloseButton
        onClick={handleClick}
        size="xs"
        rounded="full"
        pos="absolute"
        top="-2"
        zIndex={20}
        right="0"
        variant="surface"
      >
        <LuX style={{ width: "18px", height: "18px" }} />
      </CloseButton>

      <Flex h="75%" justifyContent="center" alignItems="center" w="80%">
        {attachment.type === "image" && (
          <Image
            draggable={false}
            pointerEvents="none"
            maxH="full"
            maxW="full"
            objectFit="contain"
            rounded="10px"
            src={attachment.previewUrl}
          />
        )}
        {attachment.type === "video" && (
          <video
            src={attachment.previewUrl}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              borderRadius: "10px"
            }}
            muted
          />
        )}
        {attachment.type === "document" && (
          <Flex alignItems="center" justifyContent="center" color="fg.muted">
            {getDocumentIcon(attachment.mimeType, 80)}
          </Flex>
        )}
        {attachment.type === "audio" && (
          <Flex alignItems="center" justifyContent="center" color="fg.muted">
            <FaFileAudio size={80} />
          </Flex>
        )}
      </Flex>

      <Text
        textAlign="center"
        px="2"
        py="2"
        overflow="hidden"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
        fontSize="xs"
        w="full"
      >
        {attachment.name}
      </Text>
    </Flex>
  );
};

const IniatedReplyUI = ({
  conversationId,
  replyingToText,
  replyingToUser,
  messageId,
}: {
  replyingToText: string;
  conversationId: string;
  replyingToUser: string;
  messageId: string;
}) => {
  const replyToClick = () => {
    const el = document.getElementById(messageId);

    if (el) {
      el.scrollIntoView();
      el.classList.remove("message-blink");
      void el.offsetHeight;
      el.classList.add("message-blink");
    }
  };

  return (
    <Flex
      w="full"
      p="5px"
      px="8px"
      pr="15px"
      borderBottom="1px solid"
      borderColor="bg.emphasized"
      justifyContent="space-between"
      alignItems="center"
      userSelect="none"
    >
      <Flex
        onClick={replyToClick}
        cursor="pointer"
        fontSize="sm"
        alignItems="center"
        gap="5px"
      >
        <Text>{replyingToText}</Text>{" "}
        <Text fontWeight="600">{replyingToUser}</Text>
      </Flex>

      <Flex
        color="fg.muted"
        transition="0.3s ease"
        _hover={{
          color: "fg",
        }}
        onClick={() => removeInitiatedReply({ conversationId, messageId })}
      >
        <MdCancel />
      </Flex>
    </Flex>
  );
};

const MessageInputUI = ({ inputPlaceHolder }: { inputPlaceHolder: string }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const MIN_HEIGHT = 45;
  const [fileInputKey, setFileInputKey] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const selectedConversation = userChatStore(
    (state) => state.selectedConversation,
  );

  const replyInitiated = userChatStore(
    (state) => state.p2pInitiatedReply[selectedConversation?._id || ""],
  );
  const MAX_SIZE = 15 * 1024 * 1024;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_MESSAGE_LENGTH = 2000;
  const socket = userAuthStore((state) => state.socket);
  const [isTyping, setIsTyping] = useState(false);
  const MAX_ATTACHMENT = 10;
  const TYPING_SEND_INTERVAL_MS = 3000;

  const sendTypingEvent = () => {
    if (isTyping) return;
    setIsTyping(true);
    if (socket && selectedConversation?.otherUser) {
      socket.emit("typingevent", { to: selectedConversation.otherUser._id });

      setTimeout(() => {
        setIsTyping(false);
      }, TYPING_SEND_INTERVAL_MS);
    }
  };
  const authUser = userAuthStore((state) => state.authUser);

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleOnchange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;

    if (value.length > MAX_MESSAGE_LENGTH) return;
    setInputValue(value);

    if (!isTyping) {
      sendTypingEvent();
    }
  };

  const handleOnFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    const dialogId = "fileChangeDialog";

    if (!files) return;
    if (files.length < 1) return;

    const iterableFiles = Array.from(files);

    if (attachments.length + files.length > MAX_ATTACHMENT) {
      createDialog.open(dialogId, {
        contentWidth: "sm",
        bodyPadding: "15px",
        showBackDrop: true,
        showCloseButton: false,
        content: <AttachmentLimitUI max={MAX_ATTACHMENT} />,
      });
      return;
    }

    if (iterableFiles.length > 0) {
      setFileInputKey((p) => p + 1);
      for (const file of iterableFiles) {
        if (file.size > MAX_SIZE) {
          // So big file with createDialog
          createDialog.open(dialogId, {
            contentWidth: "md",
            bodyPadding: "15px",
            showBackDrop: true,
            showCloseButton: true,
            closeButtonText: translate("IunderstandText"),
            content: <FileTooLargeUI />,
          });
          return;
        }

        if (
          !DOCUMENT_MIME_TYPES.includes(file.type) &&
          !AUDIO_MIME_TYPES.includes(file.type) &&
          !IMAGE_MIME_TYPES.includes(file.type) &&
          !VIDEO_MIME_TYPES.includes(file.type)
        ) {
          // Unsupported file type with createDialog
          createDialog.open(dialogId, {
            contentWidth: "md",
            bodyPadding: "15px",
            showBackDrop: true,
            showCloseButton: true,
            closeButtonText: translate("IunderstandText"),
            content: <FileInvalidUI />,
          });
          return;
        }

        if (
          VIDEO_MIME_TYPES.includes(file.type) ||
          AUDIO_MIME_TYPES.includes(file.type) ||
          IMAGE_MIME_TYPES.includes(file.type) ||
          DOCUMENT_MIME_TYPES.includes(file.type)
        ) {
          addAttachment(file);
        }
      }
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }
  };

  const isSendingRef = useRef<boolean>(false);

  const handleSendMessage = () => {
    if (isSendingRef.current) return;

    const input = inputValue.trim(); // Capture and trim once
    const atts = attachments;

    // 1. Strict check before clearing anything
    if (input.length < 1 && atts.length < 1) return;

    isSendingRef.current = true;

    // 2. Clear UI state
    setInputValue("");
    if (textAreaRef.current) {
      textAreaRef.current.value = "";
    }
    setAttachments([]);


    if (!authUser) return
    if (!selectedConversation) return
    if (!selectedConversation.connectionId) return
    void userChatStore.getState().sendP2PDefaultMessage({
      attachments: atts,
      textInput: input,
      senderId: authUser._id,
      receiverId: selectedConversation.otherUser._id,
      connectionId: selectedConversation.connectionId,
      conversationId: selectedConversation._id
    })




    setTimeout(() => (isSendingRef.current = false), 500);
  };

  const { t: translate } = useTranslation(["chat"]);

  const addAttachment = async (file: File) => {
    const type = getAttachmentType(file.type);
    if (!type) return;

    const url = URL.createObjectURL(file);

    if (type === "video") {
      const tempId = crypto.randomUUID().slice(0, 15);
      const videoBlurHash = await getVideoBlurHash(file)


      const newAttachment: Attachment = {
        type: "video",
        previewUrl: url,
        fileId: tempId,
        mimeType: file.type as "video/mp4",
        name: file.name,
        size: file.size,
        file: file,
        _id: tempId,
        blurHash: videoBlurHash
      };
      setAttachments((p) => [...p, newAttachment]);
    }

    if (type === "audio") {
      const tempId = crypto.randomUUID().slice(0, 15);
      const newAttachment: Attachment = {
        type: "audio",
        previewUrl: url,
        fileId: tempId,
        mimeType: file.type as "audio/mp4",
        name: file.name,
        size: file.size,
        file: file,
        _id: tempId,
      };

      setAttachments((p) => [...p, newAttachment]);
    }

    if (type === "document") {
      const tempId = crypto.randomUUID().slice(0, 15);
      const newAttachment: Attachment = {
        type: "document",
        previewUrl: url,
        fileId: tempId,
        mimeType: file.type as "application/pdf",
        name: file.name,
        size: file.size,
        file: file,
        _id: tempId,
      };

      setAttachments((p) => [...p, newAttachment]);
    }

    if (type === "image") {
      const imageBlurHash = await getImageBlurHash(file)

      const tempId = crypto.randomUUID().slice(0, 15);
      const newAttachment: Attachment = {
        type: "image",
        previewUrl: url,
        blurHash: imageBlurHash,
        fileId: tempId,
        mimeType: file.type as "image/jpeg",
        name: file.name,
        size: file.size,
        file: file,
        _id: tempId,
      };

      setAttachments((p) => [...p, newAttachment]);
    }
  };

  const scrollYCss = {
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
  };

  const scrollXCss = {
    scrollBehavior: "smooth",
    "&::-webkit-scrollbar": {
      height: "5px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "fg.muted",
      borderRadius: "full",
    },
  };

  const insertEmoji = (emoji: string) => { 
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = inputValue.slice(0, start);
    const after = inputValue.slice(end);

    const newValue = before + emoji + after;

    setInputValue(newValue);

    const newCursorPos = start + emoji.length;

    requestAnimationFrame(() => {
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
    });
  };

  useEffect(() => {
    let dragCounter = 0;
    const dialogId = "dragDialogId";

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();

      // ONLY react if files are being dragged
      if (!e.dataTransfer?.types.includes("Files")) return;

      dragCounter++;
      createDialog.open(dialogId, {
        contentWidth: "300px",
        contentHeight: "180px",
        bodyPadding: "15px",
        showBackDrop: true,
        content: (
          <FileDragUI receiver={selectedConversation?.otherUser.username!} />
        ),
      });
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        createDialog.close(dialogId);
      }
    };

    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      createDialog.close(dialogId);

      const files = e.dataTransfer?.files;

      if (!files) return;
      if (Array.isArray(files) && files.length < 1) return;

      const iterableFiles = Array.from(files);

      if (attachments.length + files.length > MAX_ATTACHMENT) {
        createDialog.open(dialogId, {
          contentWidth: "md",
          bodyPadding: "15px",
          showBackDrop: true,
          showCloseButton: true,
          closeButtonText: translate("IunderstandText"),
          content: <AttachmentLimitUI max={MAX_ATTACHMENT} />,
        });
        return;
      }

      iterableFiles.forEach((file) => {
        if (file.size > MAX_SIZE) {
          // So big file with createDialog
          createDialog.open(dialogId, {
            contentWidth: "md",
            bodyPadding: "15px",
            showBackDrop: true,
            showCloseButton: true,
            closeButtonText: translate("IunderstandText"),
            content: <FileTooLargeUI />,
          });
          return;
        }

        if (
          !DOCUMENT_MIME_TYPES.includes(file.type) &&
          !AUDIO_MIME_TYPES.includes(file.type) &&
          !IMAGE_MIME_TYPES.includes(file.type) &&
          !VIDEO_MIME_TYPES.includes(file.type)
        ) {
          // Unsupported file type with createDialog
          createDialog.open(dialogId, {
            contentWidth: "md",
            bodyPadding: "15px",
            showBackDrop: true,
            showCloseButton: true,
            closeButtonText: translate("IunderstandText"),
            content: <FileInvalidUI />,
          });
          return;
        }

        addAttachment(file);
      });

      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);

    return () => {
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
    };
  }, [attachments]);

  useEffect(() => {
    const dialogId = "pasteDialogId";

    const handleOnPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files = Array.from(items)
        .filter((p) => p.kind === "file")
        .map((p) => p.getAsFile())
        .filter(Boolean) as File[];

      if (Array.isArray(files) && files.length > 0) {
        e.preventDefault();

        if (attachments.length + files.length > MAX_ATTACHMENT) {
          createDialog.open(dialogId, {
            contentWidth: "sm",
            bodyPadding: "15px",
            showBackDrop: true,
            showCloseButton: false,
            content: <AttachmentLimitUI max={MAX_ATTACHMENT} />,
          });
          return;
        }

        for (const file of files) {
          if (file.size > MAX_SIZE) {
            // So big file with createDialog
            createDialog.open(dialogId, {
              contentWidth: "md",
              bodyPadding: "15px",
              showBackDrop: true,
              showCloseButton: true,
              closeButtonText: translate("IunderstandText"),
              content: <FileTooLargeUI />,
            });
            return;
          }

          if (
            !DOCUMENT_MIME_TYPES.includes(file.type) &&
            !AUDIO_MIME_TYPES.includes(file.type) &&
            !IMAGE_MIME_TYPES.includes(file.type) &&
            !VIDEO_MIME_TYPES.includes(file.type)
          ) {
            // Unsupported file type with createDialog
            createDialog.open(dialogId, {
              contentWidth: "md",
              bodyPadding: "15px",
              showBackDrop: true,
              showCloseButton: true,
              closeButtonText: translate("IunderstandText"),
              content: <FileInvalidUI />,
            });
            return;
          }

          if (
            VIDEO_MIME_TYPES.includes(file.type) ||
            AUDIO_MIME_TYPES.includes(file.type) ||
            IMAGE_MIME_TYPES.includes(file.type) ||
            DOCUMENT_MIME_TYPES.includes(file.type)
          ) {
            addAttachment(file);
          }
        }

        if (textAreaRef.current) {
          textAreaRef.current.focus();
        }
      }
    };

    window.addEventListener("paste", handleOnPaste);
    return () => window.removeEventListener("paste", handleOnPaste);
  }, [attachments]);

  const handleRemoveAttachment = (fileId: string) => {
    setAttachments((p) => p.filter((att) => att.fileId !== fileId));
  };

  const handleOnEmojiSelect = (emoji: string) => {
    if (emoji) {
      insertEmoji(emoji);
    }
  };

  const handleOnGifSelect = ({ gifData }: { gifData: GifData }) => {
    if (!selectedConversation || !selectedConversation.connectionId || !authUser) return;

    void userChatStore.getState().sendP2PGifMessage({
      gifData,
      connectionId: selectedConversation.connectionId,
      senderId: authUser._id,
      conversationId: selectedConversation._id,
      receiverId: selectedConversation.otherUser._id
    })

    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const isReplyIniated = !!replyInitiated;

  return (
    <Flex
      alignItems="center"
      minW="full"
      maxW="full"
      pb="10px"
      direction="column"
      px="1.5"
    >
      <P2PChatIndicator
        displayName={selectedConversation?.otherUser.displayName}
        userId={selectedConversation?.otherUser._id}
      />

      <Flex
        alignItems="flex-end"
        rounded={{ base: "xl", md: "lg", lg: "lg" }}
        boxShadow={{ base: "inner", lg: "none", md: "none" }}
        border="1px solid"
        borderColor="bg.emphasized"
        minW="full"
        maxW="full"
        maxH="17lh"
        overflowY="auto"
        flexDir="column"
        css={scrollYCss}
      >
        <input
          onChange={handleOnFileChange}
          type="file"
          hidden
          multiple
          key={fileInputKey}
          ref={fileInputRef}
        />

        {isReplyIniated &&
          selectedConversation &&
          selectedConversation.otherUser && (
            <IniatedReplyUI
              messageId={replyInitiated}
              conversationId={selectedConversation._id}
              replyingToText={translate("replyingToText")}
              replyingToUser={selectedConversation.otherUser.displayName}
            />
          )}

        {/*Attachment Container */}
        {attachments.length > 0 && (
          <Flex
            maxW="full"
            overflow="auto"
            css={scrollXCss}
            p="10px"
            w="full"
            minH="205px"
            gap="10px"
          >
            {attachments.map((attachment) => (
              <AttachmentPreview
                handleRemoveAttachment={handleRemoveAttachment}
                key={attachment.fileId}
                attachment={attachment}
              />
            ))}
          </Flex>
        )}
        {/*Attachment Container */}

        <Flex gap="1" pb="10px" pr="5px" alignItems="flex-end" w="full">
          <Flex minW={{ base: "16%", lg: "65px" }}
            maxW={{ base: "16%", lg: "65px" }} justifyContent="center">
            <Flex
              onClick={() => fileInputRef.current?.click()}
              alignItems="center"
              justifyContent="center"
              h="35px"
              w="35px"
              rounded="lg"
              _hover={{ bg: "bg.emphasized" }}
              style={{ cursor: "pointer" }}
            >
              <LuPlus size={25} />
            </Flex>
          </Flex>

          <Flex flex={1}>
            <textarea
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              ref={textAreaRef}
              style={{
                minHeight: `${MIN_HEIGHT}px`,
                paddingTop: "16px",
                fieldSizing: "content",
                resize: "none",
                width: "100%",
                lineHeight: "1.5",
                background: "none",
                fontSize: "15px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              className="no-focus"
              onChange={handleOnchange}
              placeholder={inputPlaceHolder}
            />
          </Flex>

          <Flex gap="5px" alignItems="flex-end">
            <Flex
              alignItems="center"
              justifyContent="center"
              h="35px"
              w="35px"
              rounded="lg"
              _hover={{ bg: "bg.emphasized" }}
            >
              <FaMicrophone />
            </Flex>

            <EmojiGifPicker
              onGifSelect={handleOnGifSelect}
              onEmojiSelect={handleOnEmojiSelect}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MessageInputUI;

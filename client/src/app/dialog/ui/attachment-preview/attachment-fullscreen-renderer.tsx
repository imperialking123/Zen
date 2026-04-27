import { Tooltip } from "@/components/ui/tooltip";
import {
  Avatar,
  Badge,
  Flex,
  FormatByte,
  LocaleProvider,
  Menu,
  Text,
  type MenuSelectionDetails,
} from "@chakra-ui/react";
import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaX } from "react-icons/fa6";
import { HiDownload } from "react-icons/hi";
import { IoIosMore } from "react-icons/io";
import { LuExternalLink, LuLink } from "react-icons/lu";
import useSlideAction from "@/hooks/use-slide-action";
import { generateCDN_URL } from "@/utils/generalFunctions";
import { formatDateForTooltip } from "@/utils/chatFunctions";
import AttachmentPreviewItem from "./ui/attachment-preview-item";
import { GoArrowLeft } from "react-icons/go";
import { GoArrowRight } from "react-icons/go";
import type { Attachment, IUser } from "@/types/schema";
import { createDialog } from "../../create-dialog";
import { BsRobot } from "react-icons/bs";
import { IoCopyOutline } from "react-icons/io5";
import { getSource } from "@/app/shared/message/message-map/attachment/message-attachment-render";
import { toast } from "sonner";

type AttachmentFullScreenPreviewTranslations = {
  openInBrowser: string;
  openFullScreen: string;
  more: string;
  close: string;
  copyLink: string;
  viewDetails: {
    filename: string;
    size: string;
    text: string;
  };
  copyAttachmentId: string;
  id: string;
  downloadText: string;
  copyImageText: string;
  somethingWentWrongText: string;
  imageCopiedText: string;
  copiedText: string;
};

function Button({
  children,
  content,
  caseText,
  clickHander,
}: {
  children: React.ReactNode;
  content: string;
  caseText: "copyImage" | "openInBrowser" | "saveVideo";
  clickHander: (caseText: "copyImage" | "openInBrowser" | "saveVideo") => void;
}) {
  return (
    <Tooltip
      showArrow
      contentProps={{
        padding: "8px",
        rounded: "lg",
        css: {
          "--tooltip-bg": "colors.gray.900",
          color: "white",
        },
      }}
      content={content}
    >
      <Flex
        onClick={() => clickHander(caseText)}
        boxSize="33px"
        alignItems="center"
        justifyContent="center"
        transition="0.5s ease"
        bg="transparent"
        borderColor="gray.600"
        border="1px solid transparent"
        _hover={{
          bg: "gray.700",
          borderColor: "gray.600",
        }}
        rounded="lg"
      >
        {children}
      </Flex>
    </Tooltip>
  );
}

function AttachmentMenu({
  triggerId,
  more,
  copyLink,
  copyAttachmentId,
  id,
  viewDetails,
  attachmentFileName,
  attachmentSize,
  lang,
  currentAttachment,
  copiedText,
}: {
  triggerId: string;
  more: string;
  copyLink: string;
  copyAttachmentId: string;
  id: string;
  viewDetails: {
    filename: string;
    size: string;
    text: string;
  };
  attachmentFileName: string;
  lang: string;
  attachmentSize: number;
  currentAttachment: Extract<Attachment, { type: "image" | "video" }>;
  copiedText: string;
}) {
  const handleOnMenuSelect = (e: MenuSelectionDetails) => {
    const text = e.value[0];

    switch (text) {
      case "copyLink":
        if (currentAttachment.filePath) {
          navigator.clipboard.writeText(
            generateCDN_URL(
              currentAttachment.filePath,
              currentAttachment.mimeType || "",
              true,
            ),
          );
        }
        break;
      case "filename":
        navigator.clipboard.writeText(attachmentFileName);
        break;
      case "size":
        navigator.clipboard.writeText(attachmentSize.toString());
        break;
      case "copyAttachmentId":
        navigator.clipboard.writeText(id);
        break;
    }

    toast.success(copiedText);
  };

  return (
    <Menu.Root
      onSelect={handleOnMenuSelect}
      size="md"
      ids={{ trigger: triggerId }}
    >
      <Tooltip
        showArrow
        contentProps={{
          padding: "8px",
          rounded: "lg",
          css: {
            "--tooltip-bg": "colors.gray.900",
            color: "white",
          },
        }}
        ids={{ trigger: triggerId }}
        content={more}
      >
        <Menu.Trigger asChild>
          <Flex
            boxSize="33px"
            alignItems="center"
            justifyContent="center"
            transition="0.5s ease"
            bg="transparent"
            borderColor="gray.600"
            border="1px solid transparent"
            _hover={{
              bg: "gray.700",
              borderColor: "gray.600",
            }}
            rounded="lg"
          >
            <IoIosMore size={19} />
          </Flex>
        </Menu.Trigger>
      </Tooltip>

      <Menu.Positioner>
        <Menu.Content
          maxW={{ base: "250px", lg: "250px" }}
          bg="gray.900"
          rounded="lg"
        >
          <Menu.Item
            _highlighted={{
              bg: "gray.800",
            }}
            color="white"
            display="flex"
            rounded="md"
            p="8px"
            justifyContent="space-between"
            value="copyLink"
          >
            {copyLink} <LuLink />
          </Menu.Item>

          <Menu.Item
            _highlighted={{
              bg: "gray.800",
            }}
            color="white"
            display="flex"
            rounded="md"
            p="8px"
            value="filename"
            flexDir="column"
            alignItems="flex-start"
            minW="full"
            gap="0px"
          >
            <Text
              maxW="100%"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {viewDetails.filename}
            </Text>

            <Text
              maxW="100%"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              color="fg.muted"
              fontSize="sm"
            >
              {attachmentFileName}
            </Text>
          </Menu.Item>

          <Menu.Item
            _highlighted={{
              bg: "gray.800",
            }}
            color="white"
            display="flex"
            rounded="md"
            p="8px"
            value="size"
            flexDir="column"
            alignItems="flex-start"
            minW="full"
            gap="0px"
          >
            <Text
              maxW="100%"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {viewDetails.size}
            </Text>

            <Text
              maxW="100%"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              color="fg.muted"
              fontSize="sm"
            >
              <LocaleProvider locale={lang}>
                <FormatByte value={attachmentSize} />
              </LocaleProvider>
            </Text>
          </Menu.Item>
          <Menu.Item
            _highlighted={{
              bg: "gray.800",
            }}
            color="white"
            rounded="lg"
            p="8px"
            value="copyAttachmentId"
            justifyContent="space-between"
          >
            {copyAttachmentId}{" "}
            <Badge size="xs" fontWeight="bold" color="gray.800" bg="white">
              {id}
            </Badge>
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}

const AttachmentFullScreenUI = ({
  attachments,
  senderProfile,
  createdAt,
}: {
  attachments: Extract<Attachment, { type: "image" | "video" }>[];
  senderProfile?: IUser;
  createdAt: string;
}) => {
  const triggerId = useId();
  const { t: translate, i18n } = useTranslation(["chat"]);

  const {
    more,
    openInBrowser,
    close,
    copyLink,
    copyAttachmentId,
    id,
    viewDetails,
    copiedText,
    openFullScreen,
    somethingWentWrongText,
    downloadText,
    copyImageText,
    imageCopiedText,
  } = translate(
    "selectedVisualAttachmentsText",
  ) as unknown as AttachmentFullScreenPreviewTranslations;

  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAttachment = attachments[currentIndex];
  const attachmentSize = currentAttachment.size;
  const attachmentFileName = currentAttachment.name;

  const handleNextAttachment = () => {
    if (attachments.length === 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % attachments.length);
  };

  const handlePrevAttachment = () => {
    if (attachments.length === 1) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? attachments.length - 1 : prevIndex - 1,
    );
  };

  useSlideAction({
    containerRef: containerRef,
    slideLeftFunction: handlePrevAttachment,
    slideRightFunction: handleNextAttachment,
  });

  const handleDownload = () => {
    if (!currentAttachment) return;

    if (!currentAttachment.filePath) return;
    const url = generateCDN_URL(
      currentAttachment.filePath,
      currentAttachment.mimeType,
      true,
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = currentAttachment.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  const handleOpenInBrowser = () => {
    if (!currentAttachment) return;

    if (!currentAttachment.filePath) return;
    const url = generateCDN_URL(
      currentAttachment.filePath,
      currentAttachment.mimeType,
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = currentAttachment.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  const handleCopyImage = async () => {
    const url = getSource(
      currentAttachment.filePath,
      currentAttachment.previewUrl,
      currentAttachment.mimeType,
    );

    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // 1. Check if it's already a PNG. If not, convert it.
      let pngBlob = blob;
      if (blob.type !== "image/png") {
        pngBlob = await convertToPng(blob);
      }

      // 2. Write the PNG blob to the clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob }),
      ]);

      toast.success(imageCopiedText);
    } catch (error) {
      toast.error(somethingWentWrongText);
      console.error(
        "Error while trying to copy image:",
        (error as Error).message,
      );
    }
  };

  
  const convertToPng = (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Canvas conversion failed"));
        }, "image/png");
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };

  const clickHandler = (
    caseText: "forward" | "openInBrowser" | "saveVideo" | "copyImage",
  ) => {
    switch (caseText) {
      case "copyImage":
        handleCopyImage();
        break;
      case "openInBrowser":
        handleOpenInBrowser();
        break;
      case "saveVideo":
        handleDownload();
    }
  };

  const handleExit = () => {
    const id = "showAttachmentId";
    createDialog.close(id);
  };

  if (!currentAttachment) return;

  return (
    <Flex ref={containerRef} pos="relative" zIndex={5} w="full" minH="full">
      <Flex
        zIndex={80}
        color="white"
        w="full"
        h="70px"
        alignItems="center"
        px="15px"
        pos="absolute"
        left="0"
        right="0"
        top="5"
        justifyContent="space-between"
      >
        {senderProfile && (
          <Flex gap="10px">
            <Avatar.Root>
              <Avatar.Fallback>
                <BsRobot />
              </Avatar.Fallback>
              <Avatar.Image src={senderProfile.profile?.profilePic} />
            </Avatar.Root>

            <Flex
              color="white"
              display={{ lg: "flex", base: "none" }}
              direction="column"
            >
              <Text>{senderProfile.displayName}</Text>
              <Text>{formatDateForTooltip(createdAt)}</Text>
            </Flex>
          </Flex>
        )}

        <Flex alignItems="center" gap="10px">
          <Flex
            border="1px solid"
            borderColor="gray.700"
            gap="2px"
            p="3px"
            rounded="xl"
            bg="gray.800"
          >
            {currentAttachment.type === "image" && (
              <Button
                caseText="copyImage"
                clickHander={clickHandler}
                content={copyImageText}
              >
                <IoCopyOutline size={17} fontWeight={12} />
              </Button>
            )}

            <Button
              clickHander={clickHandler}
              caseText="saveVideo"
              content={downloadText}
            >
              <HiDownload style={{ width: "20px", height: "20px" }} />
            </Button>

            <Button
              clickHander={clickHandler}
              caseText="openInBrowser"
              content={openInBrowser}
            >
              <LuExternalLink size={19} />
            </Button>

            <AttachmentMenu
              copiedText={copiedText}
              attachmentSize={attachmentSize}
              attachmentFileName={attachmentFileName}
              viewDetails={viewDetails}
              copyAttachmentId={copyAttachmentId}
              copyLink={copyLink}
              id={id}
              more={more}
              triggerId={triggerId}
              lang={i18n.language}
              currentAttachment={currentAttachment}
            />
          </Flex>

          <Tooltip
            showArrow
            contentProps={{
              padding: "8px",
              rounded: "lg",
              css: {
                "--tooltip-bg": "colors.gray.900",
                color: "white",
              },
            }}
            content={close}
          >
            <Flex
              onClick={handleExit}
              border="1px solid"
              borderColor="gray.700"
              boxSize="40px"
              alignItems="center"
              justifyContent="center"
              transition="0.5s ease"
              bg="gray.800"
              _hover={{
                bg: "gray.700",
                border: "1px solid",
                borderColor: "gray.500",
              }}
              rounded="xl"
            >
              <FaX />
            </Flex>
          </Tooltip>
        </Flex>
      </Flex>

      <Flex
        justifyContent="center"
        alignItems="center"
        minH="full"
        maxH="full"
        minW="full"
        maxW="full"
        pos="relative"
        onClick={handleExit}
      >
        {currentAttachment && (
          <AttachmentPreviewItem
            openFullScreenText={openFullScreen}
            attachment={currentAttachment}
          />
        )}

        {attachments.length > 1 && (
          <Flex
            display={{ base: "none", lg: "flex", md: "flex" }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handlePrevAttachment();
            }}
            pos="absolute"
            boxSize="40px"
            alignItems="center"
            justifyContent="center"
            transition="0.5s ease"
            bg="gray.900"
            borderColor="gray.600"
            border="1px solid transparent"
            _hover={{
              bg: "gray.800",
              borderColor: "gray.600",
            }}
            left="20px"
            rounded="lg"
            fontSize="22px"
            color="gray.300"
          >
            <GoArrowLeft />
          </Flex>
        )}

        {attachments.length > 1 && (
          <Flex
            display={{ base: "none", lg: "flex", md: "flex" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNextAttachment();
            }}
            pos="absolute"
            boxSize="40px"
            alignItems="center"
            justifyContent="center"
            transition="0.5s ease"
            bg="gray.900"
            borderColor="gray.600"
            border="1px solid transparent"
            _hover={{
              bg: "gray.800",
              borderColor: "gray.600",
            }}
            rounded="lg"
            fontSize="22px"
            color="gray.300"
            right="20px"
          >
            <GoArrowRight />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default AttachmentFullScreenUI;

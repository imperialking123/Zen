import BlurhashCanvas from "@/shared/blur-hash-render";
import MediaLoadErrorUI from "@/shared/message/media-load-error-ui";
import { getDocumentIcon } from "@/shared/message/message-input-ui";
import { getSource } from "@/shared/message/message-map/attachment/message-attachment-render";
import ShowFullTimeStampTooltip from "@/shared/message/show-full-createdAt-tooltip";
import type { Attachment, GifData, IMessage, IUser } from "@/core/types/schema";
import { formatMessageTimestamp, getEmojiUrl } from "@/core/utils/chat-functions";
import { Avatar, Box, Flex, FormatByte, LocaleProvider, Text } from "@chakra-ui/react";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { BsRobot } from "react-icons/bs";
import { FaFileAudio, FaPlay } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";


const MessageTextRenderer = ({ text }: { text: string }) => {
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
      fontSize="15px"
      lineHeight="1.5"
      whiteSpace="pre-wrap"
      overflowWrap="anywhere"
      color="gray.700"
      _dark={{
        color: "gray.100",
      }}
      letterSpacing="0.01em"
      pb="5px"
      userSelect="none"
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

const AudioAttachment = ({
  attachment,
  language,
}: {
  attachment: Attachment;
  language: string;
}) => {

  return (
    <Flex
      h="100px"
      border="1px solid"
      borderColor="bg.emphasized"
      px="10px"
      justifyContent="center"
      w="100%"
      rounded="md"
      direction="column"
      userSelect="none"
      pos="relative"
      className="group"
    >
      <Flex alignItems="center" gap="10px">
        <FaFileAudio size={30} />
        <Flex
          direction="column"
          maxW="100%"
          minW={0}
          color="fg.muted"
          fontSize="sm"
        >
          <Text
            maxW="100%"
            minW={0}
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            {attachment.name}
          </Text>

          <Flex maxW="100%" minW={0} overflow="hidden">
            <Text overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
              <LocaleProvider locale={language}>
                <FormatByte value={attachment.size} />
              </LocaleProvider>
            </Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        rounded="md"
        bg="bg.emphasized"
        p="2px"
        w="full"
        alignItems="center"
        gap="5px"
      >
        <Flex
          boxSize="25px"
          alignItems="center"
          justifyContent="center"
          color="whiteAlpha.800"
          _hover={{
            color: "white",
          }}
        >
          <FaPlay />
        </Flex>

        <Flex flex={1} gap="3px" color="fg.muted" alignItems="center" fontSize={{ base: "xs", lg: "sm", md: "sm" }}>
          <Text>-:-- / -:--</Text>
        </Flex>

        <input
          type="range"
          value={0}
          style={{ flex: 1, accentColor: "black" }}
        />

        <Flex
          tabIndex={0}
          focusRing="none"
          color="whiteAlpha.800"
          boxSize="25px"
          alignItems="center"
          justifyContent="center"
          pos="relative"
          className="group">
          <HiSpeakerWave style={{ width: "20px", height: "20px" }} />
        </Flex>
      </Flex>

    </Flex>
  );
};


const VideoAttachment = ({
  attachment,
}: {
  attachment: Extract<Attachment, { type: "video" }>;
}) => {
  const url = getSource(
    attachment.filePath,
    attachment.previewUrl,
    attachment.mimeType,
  );

  const [videoDetails, setVideoDetails] = useState({
    isLoaded: false,
    isLoadError: false,
  });

  return (
    <Flex
      w="100%"
      overflow="hidden"
      rounded="5px"
      pos="relative"
      data-video-container

      className={videoDetails.isLoaded ? "" : "isLoading"}
    >
      {videoDetails.isLoadError ? (
        <MediaLoadErrorUI />
      ) : (
        <>
          <video
            preload="metadata"
            style={{
              visibility: videoDetails.isLoaded ? "visible" : "hidden",
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              objectFit: "cover",

            }}
            onLoadedData={() => {
              setVideoDetails((p) => ({
                ...p,
                isLoaded: true,
                isLoadError: false,
              }));
            }}
            src={url}
            onError={() =>
              setVideoDetails((p) => ({ ...p, isLoadError: true }))
            }

          />





          {!videoDetails.isLoaded && (
            <Flex
              bg="rgba(26, 26, 26, 0.4)"
              color="white"
              top="10px"
              right="10px"
              pos="absolute"
              boxSize="25px"
              justifyContent="center"
              rounded="full"
            >
              <Flex
                animation="spin"
                alignItems="center"
                animationDuration="slower"
              >
                <AiOutlineLoading size={18} />
              </Flex>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};

const ImageAttachment = ({
  attachment,
}: {
  attachment: Extract<Attachment, { type: "image" }>;
}) => {

  const src = getSource(
    attachment.filePath,
    attachment.previewUrl,
    attachment.mimeType,
  );

  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)

  const hasPreview = Boolean(attachment.previewUrl)

  return (
    <Flex
      w="100%"
      rounded="5px"
      overflow="hidden"
      pos="relative"
    >
      {!hasPreview && <>
        <img
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoadError(true)}
          style={{ display: isLoaded ? "block" : "none", height: "100%", width: "100%", objectFit: "cover" }}
          src={src}
        />
        {!isLoaded && <BlurhashCanvas hash={attachment.blurHash} />}
        {isLoadError && <MediaLoadErrorUI />}
      </>}

      {hasPreview && <BlurhashCanvas hash={attachment.blurHash} />}

    </Flex>
  );
};

const DocumentAttachment = ({
  attachment,
  lang,
}: {
  attachment: Extract<Attachment, { type: "document" }>;
  lang: string;
}) => {


  return (
    <Flex
      h="70px"
      border="1px solid"
      borderColor="bg.emphasized"
      px="10px"
      justifyContent="center"
      w="100%"
      rounded="md"
      userSelect="none"
      gap="10px"
      alignItems="center"
      className="group"
      pos="relative"
    >
      {getDocumentIcon(attachment.mimeType, 40)}

      <Flex fontSize="sm" direction="column" flex="1" minW="0">
        <Text

          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          textAlign="left"
        >
          {attachment.name}
        </Text>

        <Text
          color="fg.muted"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          textAlign="left"
        >
          <LocaleProvider locale={lang}>
            <FormatByte value={attachment.size} />
          </LocaleProvider>
        </Text>
      </Flex>

    </Flex>
  );
};



const MessageAttachmentsRender = ({ attachments, language }: { attachments: Attachment[], language: string }) => {

  const visualAttachments = attachments.filter(
    (att) => att.type === "video" || att.type === "image",
  );
  // Get audioAttachments
  const audioAttachments = attachments.filter((att) => att.type === "audio");
  // Get documentAttachments
  const documentAttachments = attachments.filter(
    (att) => att.type === "document",
  );

  return (
    <Flex w="100%" direction="column" gap="4px" pointerEvents="none">
      {Array.isArray(visualAttachments) && visualAttachments.length > 0 && (
        <Box w="full" className={`galleryDeleteUI count-${visualAttachments.length}`}>
          {visualAttachments.map((att) => {
            if (att.type === "image") {
              return (
                <ImageAttachment
                  key={att.fileId}
                  attachment={att}
                />
              );
            }

            if (att.type === "video") {
              return (
                <VideoAttachment
                  key={att.fileId}
                  attachment={att}
                />
              );
            }
          })}
        </Box>
      )}
      {Array.isArray(audioAttachments) && audioAttachments.length > 0 && (
        <Flex w="full" direction="column" gap="10px">
          {audioAttachments.map((att) => (
            <AudioAttachment
              language={language}
              key={att.fileId}
              attachment={att}
            />
          ))}
        </Flex>
      )}
      {Array.isArray(documentAttachments) && documentAttachments.length > 0 && (
        <Flex direction="column">
          {documentAttachments.map((att) => (
            <DocumentAttachment
              key={att.fileId}
              lang={language}
              attachment={att}
            />
          ))}
        </Flex>
      )}
    </Flex>
  )
}

const MessageGifRender = ({
  gifData,
}: {
  gifData: GifData;
}) => {
  const { preview } = gifData;

  const [isError, setIsError] = useState(false);

  return (
    <Flex
      userSelect="none"
      w="100%"
      direction="column"
      pos="relative"
      overflow="hidden"
    >
      {!isError ? (
        <>
          <Box
            h={{ base: "140px", lg: "180px", md: "160px" }}
            w="100%"
            pos="relative"
            overflow="hidden"
            borderRadius="md"
            flexShrink={0}
          >
            <video
              onError={() => setIsError(true)}
              autoPlay
              loop
              muted
              playsInline
              src={preview}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "5px",
                pointerEvents: "none",
              }}
            />
          </Box>

          <Text color="fg.muted" fontSize="xs" py="2px" flexShrink={0}>
            GIF
          </Text>
        </>
      ) : (
        <MediaLoadErrorUI />
      )}
    </Flex>
  );
};


const MessageItemPreview = ({
  message,
  senderProfile,
  language
}: {
  message: IMessage;
  senderProfile: IUser;
  language: string
}) => {
  return (
    <Flex boxShadow="sm" px="5px" py="10px" rounded="sm" w="full">
      <Flex justifyContent="center" minW={{ base: "16%", lg: "65px" }} maxW={{ base: "16%", lg: "65px" }} >
        <Avatar.Root>
          <Avatar.Fallback>
            <BsRobot size={20} />
          </Avatar.Fallback>
        </Avatar.Root>
      </Flex>

      <Flex
        w={{ base: "calc(100% - 16%)", lg: "calc(100% - 65px)" }}
        direction="column"
      >
        <Flex gap="5px" alignItems="center">
          <Text color="fg.muted" fontWeight="600" userSelect="none">
            {senderProfile?.displayName || "Deleted User"}
          </Text>

          <ShowFullTimeStampTooltip createdAt={message.createdAt}>
            <Text
              color="gray.fg"
              fontWeight="normal"
              cursor="pointer"
              fontSize="xs"
            >
              {formatMessageTimestamp(message.createdAt)}
            </Text>
          </ShowFullTimeStampTooltip>
        </Flex>

        <Flex
          w="full"
          maxW="full"
          direction="column"
          pointerEvents="none"
          userSelect="none"
        >
          {message.type === "default" && message.text && message.text.length > 0 && <MessageTextRenderer text={message.text} />}
          {message.type === "default" && message.attachments && message.attachments.length > 0 && <MessageAttachmentsRender language={language} attachments={message.attachments} />}
          {message.type === "gif" && message.gif && <MessageGifRender gifData={message.gif} />}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MessageItemPreview;






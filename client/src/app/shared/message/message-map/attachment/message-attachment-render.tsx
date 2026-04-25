import {
  Box,
  Flex,
} from "@chakra-ui/react";
import type { Attachment } from "../../../../../types/schema";
import { generateCDN_URL } from "../../../../../utils/generalFunctions";
import { useTranslation } from "react-i18next";
import VideoAttachment from "./video-attachment";
import ImageAttachment from "./image-attachment";
import AudioAttachment from "./audio-attachment";
import DocumentAttachment from "./document-attachment";

export const getSource = (
  filePath: string | undefined,
  previewUrl: string,
  mimeType: string,
) => {
  if (previewUrl && typeof previewUrl === "string") {
    return previewUrl;
  } else {
    if (!filePath) return;
    return generateCDN_URL(filePath, mimeType);
  }
};



const MessageAttachmentRenderer = ({
  attachments,
  displayAttachmentFullscreen,
}: {
  attachments: Attachment[];
  displayAttachmentFullscreen: (fileId: string) => void;
}) => {
  // Get attachments that can be rendered and viewed directly
  const visualAttachments = attachments.filter(
    (att) => att.type === "video" || att.type === "image",
  );
  // Get audioAttachments
  const audioAttachments = attachments.filter((att) => att.type === "audio");
  // Get documentAttachments
  const documentAttachments = attachments.filter(
    (att) => att.type === "document",
  );

  const { t: translate, i18n } = useTranslation(["chat"]);
  const openFullScreenText = translate("openFullScreenText");
  const downloadText = translate("downloadText");




  return (
    <Flex mb="5px" maxW={{ lg: "60%", base: "95%" }} direction="column" gap="5px" textAlign="center">
      {Array.isArray(visualAttachments) && visualAttachments.length > 0 && (
        <Box w="full" className={`gallery count-${visualAttachments.length}`}>
          {visualAttachments.map((att) => {
            if (att.type === "image") {
              return (
                <ImageAttachment
                  isAlone={visualAttachments.length === 1}
                  displayAttachmentFullscreen={displayAttachmentFullscreen}
                  key={att.fileId}
                  attachment={att}
                />
              );
            }

            if (att.type === "video") {
              return (
                <VideoAttachment
                  displayAttachmentFullscreen={displayAttachmentFullscreen}
                  isAlone={visualAttachments.length === 1}
                  openFullScreenText={openFullScreenText}
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
              downloadText={downloadText}
              language={i18n.language}
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
              downloadText={downloadText}
              key={att.fileId}
              lang={i18n.language}
              attachment={att}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default MessageAttachmentRenderer;

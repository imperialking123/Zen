import { Button, Flex, Group } from "@chakra-ui/react";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { getSource } from "./message-attachment-render";
import type { Attachment } from "@/core/types/schema";
import BlurhashCanvas from "@/shared/blur-hash-render";
import MediaLoadErrorUI from "../../media-load-error-ui";

const ImageAttachment = ({
    msgIndex,
    attachment,
    isAlone,
    displayAttachmentFullscreen,
    handleRemoveAttachment
}: {
    attachment: Extract<Attachment, { type: "image" }>;
    displayAttachmentFullscreen: (fileId: string) => void;
    isAlone: boolean
    handleRemoveAttachment: (msgIndex: number, fileId: string) => void
    msgIndex: number
}) => {

    const src = getSource(
        attachment.filePath,
        attachment.previewUrl,
        attachment.mimeType,
    );

    const [isLoaded, setIsLoaded] = useState(false)
    const [isLoadError, setIsLoadError] = useState(false)

    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        
        handleRemoveAttachment(msgIndex, attachment.fileId)
    }

    const hasPreview = Boolean(attachment.previewUrl)

    return (
        <Flex
            onClick={() => displayAttachmentFullscreen(attachment.fileId)}
            rounded="5px"
            overflow="hidden"
            pos="relative"
            className="group"
            style={{ aspectRatio: "auto" }}
        >
            {!hasPreview && <>
                {!isAlone && <Group opacity={0} pointerEvents="none" _groupHover={{
                    opacity: 1,
                    pointerEvents: "auto"
                }} pos="absolute" top="2" right="2" attached >
                    <Button rounded="md" bg="bg.subtle" color="fg.muted" _hover={{
                        bg: "red.500",
                        color: "white"
                    }} h="32px" w="32px" size="xs" onClick={handleDeleteClick} >
                        <MdDelete style={{
                            width: "20px",
                            height: "20px"
                        }} />
                    </Button>
                </Group>}


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

export default ImageAttachment





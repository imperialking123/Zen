import type { Attachment } from "@/core/types/schema";
import { useState } from "react";
import { getSource } from "./message-attachment-render";
import { Button, Flex, Group } from "@chakra-ui/react";
import { FaPlay } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TfiDownload } from "react-icons/tfi";
import MediaLoadErrorUI from "../../media-load-error-ui";
import BlurhashCanvas from "@/shared/blur-hash-render";
import { generateCDN_URL } from "@/core/utils/general-functions";


const VideoAttachment = (props: {
    attachment: Extract<Attachment, { type: "video" }>;
    openFullScreenText: string;
    displayAttachmentFullscreen: (fileId: string) => void;
    handleRemoveAttachment: (msgIndex: number, fileId: string) => void
    msgIndex: number
}) => {


    const [mediaState, setMediaState] = useState({
        isLoaded: false,
        isLoadError: false,
    });
    const { attachment: att, displayAttachmentFullscreen: displayAtt } = props
    const { filePath, mimeType, name, width, height } = att
    const aspectRatio = width && height ? `${width} / ${height}` : "auto";

    const hasPreview = Boolean(att["previewUrl"])
    const src = getSource(att.filePath ?? "", att.previewUrl, att.mimeType)






    const handlePlayBtnClick = () => {
        displayAtt(att.fileId)
    }



    const handleDownloadClick = () => {
        if (!filePath || filePath === "") return;

        const downloadUrl = generateCDN_URL(filePath, mimeType, true);
        const url = downloadUrl;
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.target = "_blank";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }



    return (
        <Flex onClick={handlePlayBtnClick} className="group" overflow="hidden" rounded="5px" pos="relative" style={{ aspectRatio }}>

            {hasPreview && <BlurhashCanvas hash={att.blurHash} />}

            {!hasPreview && <>
                {!mediaState.isLoaded && !mediaState.isLoadError && (
                    <BlurhashCanvas hash={att.blurHash} />
                )}

                {mediaState.isLoadError && <MediaLoadErrorUI />}

                <video
                    preload="metadata"
                    src={src}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "5px",
                        backgroundColor: "black",
                        display: mediaState.isLoaded && !mediaState.isLoadError ? "block" : "none", // hide until ready and hide on error
                    }}
                    onLoadedMetadata={() => setMediaState((m) => ({ ...m, isLoaded: true }))}
                    onError={() => setMediaState((m) => ({ ...m, isLoadError: true }))}
                />

                <Button

                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    borderRadius="full"
                    h="40px"
                    w="20px"
                    color="white/75"
                    _groupHover={{
                        color: "white"
                    }}
                    transition="opacity 0.2s"
                >
                    <FaPlay />
                </Button>

                <Group opacity={0} pointerEvents="none" _groupHover={{
                    opacity: 1,
                    pointerEvents: "auto"
                }} pos="absolute" top="2" right="2" attached >
                    <Button rounded="md" bg="bg.subtle" color="fg.muted" _hover={{
                        bg: "red.500",
                        color: "white"
                    }} h="32px" w="32px" size="xs" onClick={(e) => {
                        e.stopPropagation()
                        props.handleRemoveAttachment(props.msgIndex, att.fileId);
                    }} >
                        <MdDelete style={{
                            width: "20px",
                            height: "20px"
                        }} />
                    </Button>

                    <Button rounded="md" bg="bg.subtle" color="fg.muted" _hover={{
                        bg: "bg.muted",
                        color: "fg",
                        fontWeight: "bold"
                    }} h="32px" w="32px" size="xs" onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadClick()
                    }} >
                        <TfiDownload strokeWidth={1.3} style={{
                            width: "16px",
                            height: "16px"
                        }} />

                    </Button>
                </Group>
            </>}

        </Flex>
    );
};


export default VideoAttachment





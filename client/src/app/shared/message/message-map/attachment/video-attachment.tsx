import type { Attachment } from "@/types/schema";
import { useRef, useState } from "react";
import { getSource } from "./message-attachment-render";
import { Button, Flex, Group } from "@chakra-ui/react";
import { FaPause, FaPlay } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TfiDownload } from "react-icons/tfi";
import MediaLoadErrorUI from "../../media-load-error-ui";
import BlurhashCanvas from "@/app/shared/blur-hash-render";
import { HiSpeakerWave } from "react-icons/hi2";
import { RiFullscreenExitLine, RiFullscreenFill } from "react-icons/ri";


type VideoAttachmentPlayerPropsT = {
    attachment: Extract<Attachment, { type: "video" }>
}

const VideoAttachmentPlayer = (props: VideoAttachmentPlayerPropsT) => {


    const { attachment: att } = props

    const [mediaState, setMediaState] = useState({
        isLoaded: false,
        isLoadError: false,
    });

    const [videoPlayerState, setVideoPlayerState] = useState({
        isPlaying: false,
        showControls: false,
        isFullScreenOpen: false,
        hideControlsTimeout: false,
    });

    const [isSeeking, setIsSeeking] = useState(false);
    const [seekTime, setSeekTime] = useState(0);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const src = getSource(att.filePath ?? "", att.previewUrl, att.mimeType)
    const hasPreview = Boolean(att.previewUrl)


    const handlePlayBtnClick = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()



        if (!videoRef.current) return

        if (videoPlayerState.isPlaying) {
            videoRef.current.pause()

            setVideoPlayerState({
                ...videoPlayerState, isPlaying: false,
                hideControlsTimeout: true
            })

            return
        }


        videoRef.current.play()

        setVideoPlayerState({
            ...videoPlayerState, isPlaying: true,
            hideControlsTimeout: false
        })

        startControlsTimeout()
    }

    const containerId = `${att.fileId}-container`

    const handleShowFullScreen = () => {
        const container = document.getElementById(containerId) as HTMLDivElement
        if (!container) return

        if (videoPlayerState.isFullScreenOpen) {
            // Remove event listener before exiting fullscreen
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.exitFullscreen().catch((r) => {
                console.log("Couldn't exit full screen reason -->", r)
            })
            return
        }

        // Add event listener before entering fullscreen
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        container.requestFullscreen().catch((e) => {
            console.log("Error enabling full screen: ", e)
            // Remove listener if fullscreen failed
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        })
    }

    const handleFullscreenChange = () => {
        const isFullscreen = !!document.fullscreenElement
        setVideoPlayerState(prev => ({
            ...prev,
            isFullScreenOpen: isFullscreen
        }))

        // Remove listener when exiting fullscreen
        if (!isFullscreen) {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }

    const handleSeekStart = () => {
        setIsSeeking(true)
    }

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value)
        setSeekTime(newTime)
    }

    const handleSeekEnd = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime
        }
        setIsSeeking(false)
    }

    const handleTimeUpdate = () => {
        if (!isSeeking && videoRef.current) {
            setSeekTime(videoRef.current.currentTime)
        }
    }

    const handleVideoEnded = () => {
        setSeekTime(0)
        setVideoPlayerState(prev => ({
            ...prev,
            isPlaying: false,
            hideControlsTimeout: false
        }))
    }


    const startControlsTimeout = () => {
        setTimeout(() => {
            setVideoPlayerState(prev => ({
                ...prev,
                hideControlsTimeout: true
            }))
        }, 500)
    }

    const handleMouseEnter = () => {
        setVideoPlayerState(prev => ({
            ...prev,
            hideControlsTimeout: false
        }))
    }

    const handleMouseLeave = () => {
        // Only hide if video is playing
        if (videoPlayerState.isPlaying) {
            setVideoPlayerState(prev => ({
                ...prev,
                hideControlsTimeout: true
            }))
        }
    }


    return (
        <Flex

            id={containerId}
            className="group"
            overflow="hidden"
            rounded="5px"
            pos="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >

            {hasPreview && <BlurhashCanvas hash={att.blurHash} />}

            {!hasPreview && <>
                {!mediaState.isLoaded && !mediaState.isLoadError && (
                    <BlurhashCanvas hash={att.blurHash} />
                )}

                {mediaState.isLoadError && <MediaLoadErrorUI />}

                <video
                    onClick={handlePlayBtnClick}
                    ref={videoRef}
                    preload="metadata"
                    src={src}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: videoPlayerState.isFullScreenOpen ? "contain" : "cover",
                        borderRadius: videoPlayerState.isFullScreenOpen ? "0" : "5px",
                        backgroundColor: "black",
                        display: mediaState.isLoaded && !mediaState.isLoadError ? "block" : "none", // hide until ready and hide on error
                    }}
                    onLoadedMetadata={() => setMediaState((m) => ({ ...m, isLoaded: true }))}
                    onError={() => setMediaState((m) => ({ ...m, isLoadError: true }))}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                />

                <Button
                    onClick={handlePlayBtnClick}
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    borderRadius="full"
                    h="40px"
                    w="20px"
                    display={videoPlayerState.isPlaying ? "none" : videoPlayerState.hideControlsTimeout ? "none" : "flex"}


                    transition="opacity 0.2s"
                >
                    <FaPlay />
                </Button>


            </>}


            <Flex
                bg="blackAlpha.800"
                color="white/60"
                alignItems="center"
                gap="8px"
                w="full"
                p="5px"
                pos="absolute"
                bottom="0"
                left="0"
                transform={videoPlayerState.isPlaying ? (videoPlayerState.hideControlsTimeout ? "translateY(100%)" : "translateY(0%)") : "translateY(100%)"}
                transition="transform 0.3s ease-in-out"
            >

                <Flex alignItems="center" justifyContent="center" flexShrink={0} _hover={{ color: "white" }} cursor="pointer" onClick={handlePlayBtnClick}>
                    {videoPlayerState.isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                </Flex>

                <input
                    type="range"
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                    className="bw-range"
                    min="0"
                    max={videoRef.current?.duration || 100}
                    value={isSeeking ? seekTime : seekTime}
                    onMouseDown={handleSeekStart}
                    onTouchStart={handleSeekStart}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekEnd}
                    onTouchEnd={handleSeekEnd}
                />
                <Flex alignItems="center" justifyContent="center" flexShrink={0} _hover={{ color: "white" }} cursor="pointer">
                    <HiSpeakerWave size={23} />
                </Flex>

                <Flex onClick={(e) => {
                    e.stopPropagation()
                    handleShowFullScreen()
                }} alignItems="center" justifyContent="center" flexShrink={0} _hover={{ color: "white" }} cursor="pointer">
                    {videoPlayerState.isFullScreenOpen ? <RiFullscreenExitLine size={22} /> : <RiFullscreenFill size={22} />}
                </Flex>

            </Flex>

        </Flex>
    );
}


const VideoAttachment = (props: {
    attachment: Extract<Attachment, { type: "video" }>;
    openFullScreenText: string;
    isAlone: boolean;
    displayAttachmentFullscreen: (fileId: string) => void;
}) => {


    const [mediaState, setMediaState] = useState({
        isLoaded: false,
        isLoadError: false,
    });
    const { attachment: att, isAlone, displayAttachmentFullscreen: displayAtt } = props

    const hasPreview = Boolean(att["previewUrl"])
    const src = getSource(att.filePath ?? "", att.previewUrl, att.mimeType)


    if (isAlone) {
        return <VideoAttachmentPlayer attachment={att} />
    }


    const handlePlayBtnClick = () => {
        displayAtt(att.fileId)
    }

    const handleDeleteClick = () => {

    }

    const handleDownloadClick = () => {

    }



    return (
        <Flex className="group" overflow="hidden" rounded="5px" pos="relative">

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
                    onClick={handlePlayBtnClick}
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
                    }} h="32px" w="32px" size="xs" onClick={handleDeleteClick} >
                        <MdDelete style={{
                            width: "20px",
                            height: "20px"
                        }} />
                    </Button>

                    <Button rounded="md" bg="bg.subtle" color="fg.muted" _hover={{
                        bg: "bg.muted",
                        color: "fg",
                        fontWeight: "bold"
                    }} h="32px" w="32px" size="xs" onClick={handleDownloadClick} >
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
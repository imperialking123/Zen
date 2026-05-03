import MediaLoadErrorUI from "@/app/shared/message/media-load-error-ui";
import { getSource } from "@/app/shared/message/message-map/attachment/message-attachment-render";
import type { Attachment } from "@/types/schema";
import { Flex, Image, Button, Box } from "@chakra-ui/react";
import { forwardRef, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { RiFullscreenExitLine, RiFullscreenFill } from "react-icons/ri";
import BlurhashCanvas from "@/app/shared/blur-hash-render";


const VideoPlayerButton = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>((props, ref) => {
  const { children, ...rest } = props;

  return (
    <Flex
      color="whiteAlpha.600"
      _hover={{
        color: "white",
      }}
      justifyContent="center"
      p="5px"
      alignItems="center"
      fontSize="22px"
      ref={ref}
      {...rest}
    >
      {children}
    </Flex>
  );
});

VideoPlayerButton.displayName = "VideoPlayerButton";

const ImagePreview = ({ source, blurHash }: { source: string | undefined; blurHash: string }) => {
  const [isImageError, setIsImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (isImageError) {
    return (
      <Flex w="270px" h="280px">
        <MediaLoadErrorUI />
      </Flex>
    );
  }

  return (
    <Flex pos="relative" alignItems="center" justifyContent="center">
      {!isLoaded && (
        <Flex w="270px" h="280px" pos="absolute">
          <BlurhashCanvas hash={blurHash} />
        </Flex>
      )}
      <Image
        src={source || ""}
        onClick={(e) => e.stopPropagation()}
        onError={() => setIsImageError(true)}
        onLoad={() => setIsLoaded(true)}
        maxH={{ base: "75dvh", }}
        maxW={{ base: "98dvw", lg: "90dvw" }}
        w="auto"
        h="auto"
        objectFit="contain"
        style={{ display: isLoaded ? "block" : "none" }}
      />
    </Flex>
  );
};

const VideoPreview = ({
  blurHash,
  source,

}: {
  source: string | undefined;
  blurHash: string
}) => {
  const [mediaState, setMediaState] = useState({
    isLoaded: false,
    isLoadError: false,
  });

  const [videoPlayerState, setVideoPlayerState] = useState({
    isPlaying: false,
    isFullScreenOpen: false,
    hideControlsTimeout: false,
  });

  const [isVolOpen, setIsVolOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerId = `video-preview-container`;

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const startHideTimeout = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setVideoPlayerState(prev => ({ ...prev, hideControlsTimeout: true }));
    }, 3000);
  };

  const handlePlayBtnClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;

    if (videoPlayerState.isPlaying) {
      videoRef.current.pause();
      clearHideTimeout();
      setVideoPlayerState(prev => ({ ...prev, isPlaying: false, hideControlsTimeout: false }));
      setIsVolOpen(false);
      return;
    }

    videoRef.current.play();
    setVideoPlayerState(prev => ({ ...prev, isPlaying: true, hideControlsTimeout: false }));
    startHideTimeout();
  };

  const handleMouseEnter = () => {
    if (!videoPlayerState.isPlaying) return;
    clearHideTimeout();
    setVideoPlayerState(prev => ({ ...prev, hideControlsTimeout: false }));
  };

  const handleMouseLeave = () => {
    // Don't hide if volume popover is open — user may be interacting with it
    if (!videoPlayerState.isPlaying || isVolOpen) return;
    startHideTimeout();
  };

  const handleMouseMove = () => {
    if (!videoPlayerState.isPlaying) return;
    if (isVolOpen) return;
    clearHideTimeout();
    setVideoPlayerState(prev => ({ ...prev, hideControlsTimeout: false }));
    startHideTimeout();
  };

  const handleFullscreenChange = () => {
    const isFullscreen = !!document.fullscreenElement;
    setVideoPlayerState(prev => ({ ...prev, isFullScreenOpen: isFullscreen }));
    if (!isFullscreen) {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
  };

  const handleShowFullScreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (videoPlayerState.isFullScreenOpen) {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.exitFullscreen().catch(console.error);
      return;
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    container.requestFullscreen().catch((e) => {
      console.error("Error enabling full screen:", e);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    });
  };

  const handleSeekStart = () => setIsSeeking(true);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekTime(Number(e.target.value));
  };

  const handleSeekEnd = () => {
    if (videoRef.current) videoRef.current.currentTime = seekTime;
    setIsSeeking(false);
  };

  const handleTimeUpdate = () => {
    if (!isSeeking && videoRef.current) {
      setSeekTime(videoRef.current.currentTime);
    }
  };

  const handleVideoEnded = () => {
    clearHideTimeout();
    setSeekTime(0);
    setIsVolOpen(false);
    setVideoPlayerState(prev => ({ ...prev, isPlaying: false, hideControlsTimeout: false }));
  };

  const handleVolumeChange = (newVolume: number) => {
    const v = Math.max(0, Math.min(1, newVolume));
    setVolume(v);
    setIsMuted(v === 0);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const controlsVisible = videoPlayerState.isPlaying && !videoPlayerState.hideControlsTimeout;


  return (
    <Flex
      id={containerId}
      className="group"
      overflow="hidden"
      rounded="5px"
      pos="relative"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      maxH={{ base: "85dvh", }}
      maxW={{ base: "98dvw", lg: "90dvw" }}
      alignItems="center"
      justifyContent="center"
    >
      {mediaState.isLoadError && (
        <Flex w="270px" h="280px">
          <MediaLoadErrorUI />
        </Flex>
      )}

      {!mediaState.isLoaded && !mediaState.isLoadError && (
        <Flex w="270px" h="280px">
          <BlurhashCanvas hash={blurHash} />
        </Flex>
      )}

      <video
        onClick={handlePlayBtnClick}
        ref={videoRef}
        preload="metadata"
        src={source}
        style={{
          width: "100%",
          height: "100%",
          objectFit: videoPlayerState.isFullScreenOpen ? "contain" : "contain",
          borderRadius: videoPlayerState.isFullScreenOpen ? "0" : "5px",
          backgroundColor: "black",
          display: mediaState.isLoaded && !mediaState.isLoadError ? "block" : "none",
        }}
        onLoadedMetadata={() => setMediaState(m => ({ ...m, isLoaded: true }))}
        onError={() => setMediaState(m => ({ ...m, isLoadError: true }))}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      />

      {mediaState.isLoaded && !mediaState.isLoadError && (
        <>
          <Button
            onClick={handlePlayBtnClick}
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            borderRadius="full"
            h="40px"
            w="20px"
            display={videoPlayerState.isPlaying ? "none" : "flex"}
            transition="opacity 0.2s"
          >
            <FaPlay />
          </Button>

          {/* Controls bar */}
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
            zIndex={10}
            overflow="visible"
            transform={controlsVisible ? "translateY(0%)" : "translateY(100%)"}
            transition="transform 0.3s ease-in-out"
          >
        {/* Play/Pause */}
        <Flex alignItems="center" justifyContent="center" flexShrink={0} _hover={{ color: "white" }} cursor="pointer" onClick={handlePlayBtnClick}>
          {videoPlayerState.isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
        </Flex>

        {/* Seek bar */}
        <input
          type="range"
          style={{ flex: 1, minWidth: 0 }}
          className="bw-range"
          min="0"
          max={videoRef.current?.duration || 100}
          value={seekTime}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onChange={handleSeekChange}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
        />

        {/* Volume */}
        <Flex pos="relative" alignItems="center" justifyContent="center" flexShrink={0}>
          {/* Volume popover */}
          <Flex
            pos="absolute"
            bottom="calc(100% + 10px)"
            left="50%"
            transform={isVolOpen ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(4px)"}
            opacity={isVolOpen ? 1 : 0}
            pointerEvents={isVolOpen ? "all" : "none"}
            transition="opacity 0.15s, transform 0.15s"
            flexDir="column"
            alignItems="center"
            gap="8px"
            bg="rgba(20,20,20,0.95)"
            border="0.5px solid rgba(255,255,255,0.12)"
            borderRadius="10px"
            px="10px"
            py="10px"
            zIndex={20}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Box fontSize="10px" fontWeight="500" color="whiteAlpha.500" fontFamily="mono" userSelect="none">
              {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
            </Box>

            <Box
              pos="relative"
              h="70px"
              w="4px"
              bg="whiteAlpha.200"
              borderRadius="full"
              cursor="pointer"
              onMouseDown={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const calc = (clientY: number) => {
                  const ratio = 1 - (clientY - rect.top) / rect.height;
                  handleVolumeChange(ratio);
                };
                calc(e.clientY);
                const onMove = (ev: MouseEvent) => calc(ev.clientY);
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
            >
              <Box
                pos="absolute"
                bottom="0" left="0" right="0"
                h={`${isMuted ? 0 : Math.round(volume * 100)}%`}
                bg="white"
                borderRadius="full"
                transition="height 0.05s"
              />
              <Box
                pos="absolute"
                left="50%"
                bottom={`calc(${isMuted ? 0 : Math.round(volume * 100)}% - 6px)`}
                transform="translateX(-50%)"
                w="12px"
                h="12px"
                borderRadius="full"
                bg="white"
                cursor="grab"
                transition="bottom 0.05s"
                _active={{ transform: "translateX(-50%) scale(1.25)" }}
              />
            </Box>

            <Box
              w="0" h="0"
              borderLeft="5px solid transparent"
              borderRight="5px solid transparent"
              borderTop="5px solid rgba(20,20,20,0.95)"
            />
          </Flex>

          {/* Speaker icon */}
          <Flex
            alignItems="center"
            justifyContent="center"
            _hover={{ color: "white", bg: "whiteAlpha.100" }}
            borderRadius="6px"
            p="4px"
            cursor="pointer"
            transition="color 0.15s, background 0.15s"
            onClick={(e) => {
              e.stopPropagation();
              setIsVolOpen(prev => !prev);
            }}
          >
            {isMuted ? <HiSpeakerXMark size={20} /> : <HiSpeakerWave size={20} />}
          </Flex>
        </Flex>

        {/* Fullscreen */}
        <Flex
          onClick={(e) => { e.stopPropagation(); handleShowFullScreen(); }}
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          _hover={{ color: "white" }}
          cursor="pointer"
        >
          {videoPlayerState.isFullScreenOpen ? <RiFullscreenExitLine size={22} /> : <RiFullscreenFill size={22} />}
        </Flex>
      </Flex>
        </>
      )}
    </Flex>
  );
};

const AttachmentPreviewItem = ({
  attachment,
}: {
  attachment: Extract<Attachment, { type: "image" | "video" }>;
}) => {
  const url = getSource(
    attachment.filePath,
    attachment.previewUrl,
    attachment.mimeType,
  );

  return (
    <Flex
      w="100%"
      h="100%"
      maxH={{ base: "100%", lg: "75%", md: "75%" }}
      maxW={{ base: "100%", lg: "80%", md: "76%" }}
      p="0px"
      alignItems="center"
      justifyContent="center"
    >
      {attachment.type === "image" && <ImagePreview source={url} blurHash={attachment.blurHash} />}
      {attachment.type === "video" && (
        <VideoPreview blurHash={attachment.blurHash} source={url} />
      )}
    </Flex>
  );
};

export default AttachmentPreviewItem;

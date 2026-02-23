import MediaLoadErrorUI from "@/app/shared/message/media-load-error-ui";
import { getSource } from "@/app/shared/message/message-map/message-attachment-render";
import { Tooltip } from "@/components/ui/tooltip";
import type { Attachment } from "@/types/schema";
import { Flex, Image, Text } from "@chakra-ui/react";
import { forwardRef, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";
import { RiFullscreenExitLine, RiFullscreenFill } from "react-icons/ri";

function formatTime(timeInSeconds: number) {
  const totalSeconds = Math.floor(timeInSeconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

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

const ImagePreview = ({ source }: { source: string | undefined }) => {
  const [isImageError, setIsImageError] = useState(false);

  if (isImageError) {
    return <MediaLoadErrorUI />;
  }

  return (
    <Image
      src={source || ""}
      onClick={(e) => e.stopPropagation()}
      onError={() => setIsImageError(true)}
      maxH={{ base: "85dvh", }}
      maxW={{ base: "98dvw", lg: "90dvw" }}
      w="auto"
      h="auto"
      objectFit="contain"
    />
  );
};

const VideoPreview = ({
  source,
  openFullScreenText,
}: {
  source: string | undefined;
  openFullScreenText: string;
}) => {
  const [videoDetails, setVideoDetails] = useState({
    isLoad: false,
    videoError: false,
    isBuffering: false,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    isMuted: false,
    volume: 1.0,
    isFullScreen: false,
    buttonFocused: false,
    showControls: true,
  });

  const [showControlTimer, setShowControlTimer] = useState<number | null>(null);



  const videoRef = useRef<HTMLVideoElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLInputElement>(null);
  const isMobile = !window.matchMedia("(hover: hover)").matches;

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoDetails.isPlaying) {
        setVideoDetails((p) => ({ ...p, isPlaying: false }));
        videoRef.current.pause();
      } else {
        setVideoDetails((p) => ({ ...p, isPlaying: true }));
        videoRef.current.play();
      }
    }
  };

  const handleToggleFullscreen = () => {
    const el = containerRef.current;

    if (!el) return;
    if (document.fullscreenElement) {
      setVideoDetails((p) => ({ ...p, isFullScreen: false }));
      document.exitFullscreen();
      return;
    }

    el.requestFullscreen().catch((e) =>
      console.log("Error enabling full screen: ", e.message),
    );
    setVideoDetails((p) => ({ ...p, isFullScreen: true }));
  };

  const handleToggleMute = (event: React.MouseEvent<HTMLDivElement>) => {
    const currentTarget = event.currentTarget;

    if (isMobile) {
      if (!videoDetails.buttonFocused) {
        currentTarget.focus();
        return;
      }

      if (videoRef.current) {
        if (videoDetails.isMuted) {
          videoRef.current.volume = 1.0;
          setVideoDetails((p) => ({ ...p, isMuted: false, volume: 100 }));
        } else {
          videoRef.current.volume = 0.0;
          setVideoDetails((p) => ({ ...p, isMuted: true, volume: 0 }));
        }
      }
    } else {
      if (videoRef.current) {
        if (videoDetails.isMuted) {
          videoRef.current.volume = 1.0;
          setVideoDetails((p) => ({ ...p, isMuted: false, volume: 100 }));
          if (volumeSliderRef.current) {
            volumeSliderRef.current.value = "100";
          }
        } else {
          videoRef.current.volume = 0.0;
          setVideoDetails((p) => ({ ...p, isMuted: true, volume: 0 }));
          if (volumeSliderRef.current) {
            volumeSliderRef.current.value = "0";
          }
        }
      }
    }
  };

  const handleMouseEnter = () => {
    if (showControlTimer && typeof showControlTimer === "number") {
      clearTimeout(showControlTimer);
      setVideoDetails((p) => ({ ...p, showControls: true }));
      const timer = setTimeout(() => {
        setVideoDetails((p) => ({ ...p, showControls: false }));
      }, 2000);
      setShowControlTimer(timer);
    } else {
      setVideoDetails((p) => ({ ...p, showControls: true }));
      const timer = setTimeout(() => {
        setVideoDetails((p) => ({ ...p, showControls: false }));
      }, 2000);
      setShowControlTimer(timer);
    }
  };

  const handleMouseLeave = () => {
    if (showControlTimer && typeof showControlTimer === "number") {
      clearTimeout(showControlTimer);
    }
    setVideoDetails((p) => ({ ...p, showControls: false }));
  };

  return (
    <Flex
      onClick={(e) => {
        e.stopPropagation();
        handleMouseEnter();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
      maxH={{ base: "85dvh", }}
      maxW={{ base: "98dvw", lg: "90dvw" }}
      alignItems="center"
      justifyContent="center"
      pos="relative"
      rounded="md"
      overflow="hidden"
    >
      {videoDetails.videoError ? (
        <MediaLoadErrorUI />
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            onLoadedMetadata={(e) => {
              const duration = e.currentTarget.duration;
              setVideoDetails((p) => ({ ...p, duration: duration }));
            }}
            onEnded={() => {
              setVideoDetails((p) => ({ ...p, currentTime: 0 }));
              if (sliderRef.current) {
                sliderRef.current.value = "0";
              }
            }}
            onWaiting={() => {
              setVideoDetails((p) => ({ ...p, isBuffering: true }));
            }}
            onCanPlay={() => {
              setVideoDetails((p) => ({
                ...p,
                isBuffering: false,
                isLoad: true,
              }));
            }}
            onPlaying={() => {
              setVideoDetails((p) => ({ ...p, isBuffering: false }));
            }}
            onError={() => {
              setVideoDetails((p) => ({
                ...p,
                videoError: true,
                isBuffering: false,
              }));
            }}
            onPlay={() => {
              setVideoDetails((p) => ({ ...p, isPlaying: true }));
            }}
            onPause={() => {
              setVideoDetails((p) => ({ ...p, isPlaying: false }));
            }}
            onTimeUpdate={(e) => {
              if (sliderRef.current) {
                const currentTime = e.currentTarget.currentTime;
                sliderRef.current.value = currentTime.toString();
                setVideoDetails((p) => ({ ...p, currentTime }));
              }
            }}
            src={source}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />

          <Flex
            gap="5px"
            bg="blackAlpha.800"
            pos="absolute"
            transition="0.5s ease"
            bottom={videoDetails.showControls ? "0px" : "-50px"}
            minW="100%"
          >
            <VideoPlayerButton onClick={handleTogglePlay}>
              {videoDetails.isPlaying ? <FaPause /> : <FaPlay />}
            </VideoPlayerButton>

            <Flex
              gap="3px"
              alignItems="center"
              fontSize="sm"
              color="whiteAlpha.700"
            >
              <Text>{formatTime(videoDetails.currentTime)}</Text> /
              <Text>{formatTime(videoDetails.duration)}</Text>
            </Flex>
            <input
              onChange={(e) => {
                if (videoRef.current) {
                  const value = e.currentTarget.value;
                  videoRef.current.currentTime = Number(value);
                }
              }}
              ref={sliderRef}
              max={videoDetails.duration}
              type="range"
              className="no-focus"
              style={{ flex: 1 }}
            />

            {videoDetails.showControls && (
              <VideoPlayerButton
                onFocus={(e) => {
                  e.stopPropagation();
                  setVideoDetails((p) => ({ ...p, buttonFocused: true }));
                }}
                onBlur={() => {
                  setVideoDetails((p) => ({ ...p, buttonFocused: false }));
                }}
                onClick={handleToggleMute}
                style={{ position: "relative" }}
                data-volume-change
              >
                {!videoDetails.isMuted ? (
                  <HiMiniSpeakerWave />
                ) : (
                  <HiMiniSpeakerXMark />
                )}

                <Flex
                  pos="absolute"
                  bottom="65px"
                  opacity={0}
                  transform="rotate(-90deg)"
                  transformOrigin="center"
                  css={{
                    "[data-volume-change]:hover &": {
                      opacity: { lg: "100" },
                    },
                  }}
                >
                  <input
                    onClick={(e) => e.stopPropagation()}
                    ref={volumeSliderRef}
                    className="no-focus"
                    type="range"
                    style={{
                      height: "15px",
                      width: "75px",
                    }}
                    defaultValue={100}
                    onChange={(e) => {
                      const volume = Number(e.currentTarget.value);

                      setVideoDetails((p) => ({
                        ...p,
                        volume,
                        isMuted: volume === 0 ? true : false,
                      }));

                      if (videoRef.current) {
                        videoRef.current.volume = volume / 100;

                        if (volume === 0) {
                          videoRef.current.muted = true;
                        } else if (volume > 0) {
                          videoRef.current.muted = false;
                        }
                      }
                    }}
                    max={100}
                  />
                </Flex>
              </VideoPlayerButton>
            )}

            {videoDetails.isFullScreen ? (
              <VideoPlayerButton onClick={handleToggleFullscreen}>
                <RiFullscreenExitLine />
              </VideoPlayerButton>
            ) : (
              <Tooltip
                positioning={{ placement: "top" }}
                showArrow
                contentProps={{
                  padding: "8px",
                  rounded: "lg",
                  border: "1px solid",
                  borderColor: "whiteAlpha.100",
                  css: {
                    "--tooltip-bg": "colors.gray.900",
                    color: "white",
                  },
                }}
                content={openFullScreenText}
              >
                <VideoPlayerButton onClick={handleToggleFullscreen}>
                  <RiFullscreenFill />
                </VideoPlayerButton>
              </Tooltip>
            )}
          </Flex>
        </>
      )}
    </Flex>
  );
};

const AttachmentPreviewItem = ({
  attachment,
  openFullScreenText,
}: {
  attachment: Extract<Attachment, { type: "image" | "video" }>;
  openFullScreenText: string;
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
      {attachment.type === "image" && <ImagePreview source={url} />}
      {attachment.type === "video" && (
        <VideoPreview openFullScreenText={openFullScreenText} source={url} />
      )}
    </Flex>
  );
};

export default AttachmentPreviewItem;

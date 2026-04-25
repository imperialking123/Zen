import { generateCDN_URL } from "@/utils/generalFunctions";
import { Tooltip } from "@/components/ui/tooltip";
import { Flex, Float, FormatByte, IconButton, LocaleProvider, Text } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaFileAudio, FaPause, FaPlay } from "react-icons/fa";
import { getSource } from "./message-attachment-render";
import type { Attachment } from "@/types/schema";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { HiDownload } from "react-icons/hi";

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

const DownloadButton = ({
    filePath,
    downloadText,
    mimeType,
    name,
}: {
    filePath: string;
    mimeType: string;
    downloadText: string;
    name: string;
}) => {
    const handleDownload = () => {
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
    };

    return (
        <Float
            opacity={0}
            _groupHover={{
                opacity: 100,
            }}
            bg="bg"
            rounded="3px"
            p="1px"
        >
            <Tooltip
                showArrow
                positioning={{
                    placement: "top",
                }}
                contentProps={{
                    padding: "8px",
                    boxShadow: "xs",
                    css: { "--tooltip-bg": "colors.bg", color: "fg.muted" },
                }}
                content={downloadText}
            >
                <IconButton
                    unstyled
                    onClick={handleDownload}
                    boxSize="30px"
                    justifyContent="center"
                    alignItems="center"
                    rounded="3px"
                    display="flex"
                    _hover={{
                        bg: "bg.muted",
                    }}
                    fontSize="18px"
                >
                    <HiDownload />
                </IconButton>
            </Tooltip>
        </Float>
    );
};

const AudioAttachment = ({
    attachment,
    language,
    downloadText,
}: {
    attachment: Extract<Attachment, { type: "audio" }>;
    language: string;
    downloadText: string;
}) => {
    const url = getSource(
        attachment.filePath,
        attachment.previewUrl,
        attachment.mimeType,
    );

    const [audioDetails, setAudioDetails] = useState({
        duration: 0,
        isPlaying: false,
        currentTime: 0,
        isMuted: false,
        volume: 100,
        buttonFocused: false,
        shouldRenderAudio: false,
    });

    const audioRef = useRef<HTMLAudioElement>(null);
    const sliderRef = useRef<HTMLInputElement>(null);
    const isMobile = !window.matchMedia("(hover: hover)").matches;

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const time = Number(value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const handleTogglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audioDetails.isPlaying) {
            audio.pause();
            setAudioDetails((p) => ({ ...p, isPlaying: false }));
        } else {
            audio.play();
            setAudioDetails((p) => ({ ...p, isPlaying: true }));
        }
    };

    const handleDownload = () => {
        if (!attachment.filePath || attachment.filePath === "") return;

        const downloadUrl = generateCDN_URL(
            attachment.filePath!,
            attachment.mimeType,
            true,
        );
        const url = downloadUrl;
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.name;
        link.target = "_blank";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleToggleMute = (event: React.MouseEvent<HTMLDivElement>) => {
        const currentTarget = event.currentTarget;

        if (isMobile) {
            if (!audioDetails.buttonFocused) {
                currentTarget.focus();
                return;
            }

            if (audioRef.current) {
                if (audioDetails.isMuted) {
                    audioRef.current.volume = 1.0;
                    setAudioDetails((p) => ({ ...p, isMuted: false, volume: 100 }));
                } else {
                    audioRef.current.volume = 0.0;
                    setAudioDetails((p) => ({ ...p, isMuted: true, volume: 0 }));
                }
            }
        } else {
            if (audioRef.current) {
                if (audioDetails.isMuted) {
                    audioRef.current.volume = 1.0;
                    setAudioDetails((p) => ({ ...p, isMuted: false, volume: 100 }));
                } else {
                    audioRef.current.volume = 0.0;
                    setAudioDetails((p) => ({ ...p, isMuted: true, volume: 0 }));
                }
            }
        }
    };

    const handleMouseEnter = () => {
        if (!audioDetails.shouldRenderAudio) {
            setAudioDetails((p) => ({ ...p, shouldRenderAudio: true }));
        }
    };

    return (
        <Flex
            h="100px"
            border="1px solid"
            borderColor="bg.emphasized"
            px="10px"
            justifyContent="center"
            minW="300px"
            maxW="300px"
            rounded="md"
            direction="column"
            userSelect="none"
            pos="relative"
            className="group"
            onMouseEnter={handleMouseEnter}
        >
            {audioDetails.shouldRenderAudio && (
                <audio
                    onTimeUpdate={(e) => {
                        const currentTime = e.currentTarget.currentTime;
                        setAudioDetails((p) => ({ ...p, currentTime }));
                        if (sliderRef.current) {
                            sliderRef.current.value = currentTime.toString();
                        }
                    }}
                    onLoadedMetadata={(e) => {
                        const duration = e.currentTarget.duration;
                        setAudioDetails((p) => ({ ...p, duration: duration }));
                    }}
                    onEnded={() => {
                        setAudioDetails((p) => ({ ...p, isPlaying: false, currentTime: 0 }));
                        if (sliderRef.current) {
                            sliderRef.current.value = "0";
                        }
                    }}
                    ref={audioRef}
                    src={url}
                />
            )}
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
                        onClick={handleDownload}
                        _hover={{
                            textDecoration: attachment.filePath ? "underline" : "none",
                        }}
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
                    onClick={handleTogglePlay}
                    boxSize="25px"
                    alignItems="center"
                    justifyContent="center"
                    color="whiteAlpha.800"
                    _hover={{
                        color: "white",
                    }}
                >
                    {audioDetails.isPlaying ? <FaPause /> : <FaPlay />}
                </Flex>

                <Flex gap="3px" color="fg.muted" alignItems="center" fontSize="sm">
                    <Text>{audioDetails.shouldRenderAudio ? formatTime(audioDetails.currentTime) : "-:--"}</Text>/
                    <Text>{audioDetails.shouldRenderAudio ? formatTime(audioDetails.duration) : "-:--"}</Text>
                </Flex>

                <input
                    ref={sliderRef}
                    type="range"
                    min={0}
                    max={audioDetails.duration}
                    step={1}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleSliderChange}
                    style={{ flex: 1, accentColor: "black" }}
                />

                <Flex
                    tabIndex={0}
                    focusRing="none"
                    color="whiteAlpha.800"
                    _hover={{
                        color: "white",
                    }}
                    boxSize="25px"
                    alignItems="center"
                    justifyContent="center"
                    pos="relative"
                    data-audio-speaker
                    className="group"
                    onClick={handleToggleMute}
                    onFocus={(e) => {
                        e.stopPropagation();
                        setAudioDetails((p) => ({ ...p, buttonFocused: true }));
                    }}
                    onBlur={() => {
                        setAudioDetails((p) => ({ ...p, buttonFocused: false }));
                    }}
                >
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioDetails.volume}
                        onChange={(e) => {
                            const volume = Number(e.target.value);
                            if (audioRef.current) {
                                audioRef.current.volume = volume / 100;
                            }
                            setAudioDetails((p) => ({ 
                                ...p, 
                                volume,
                                isMuted: volume === 0
                            }));
                        }}
                        style={{
                            position: "absolute",
                            bottom: "100%",
                            left: "50%",
                            transform: audioDetails.buttonFocused 
                                ? "translateX(-50%) translateY(0) rotate(-90deg)"
                                : "translateX(-50%) translateY(40px) rotate(-90deg)",
                            transformOrigin: "center",
                            width: "80px",
                            height: "4px",
                            opacity: audioDetails.buttonFocused ? 1 : 0,
                            transition: "opacity 0.1s ease, transform 0.1s ease",
                            cursor: "pointer",
                            pointerEvents: audioDetails.buttonFocused ? "auto" : "none"
                        }}
                        className="volume-slider"
                    />
                    {audioDetails.isMuted ? (
                        <HiSpeakerXMark style={{ width: "20px", height: "20px" }} />
                    ) : (
                        <HiSpeakerWave style={{ width: "20px", height: "20px" }} />
                    )}
                </Flex>
            </Flex>

            {attachment.filePath && (
                <DownloadButton
                    downloadText={downloadText}
                    filePath={attachment.filePath}
                    name={attachment.name}
                    mimeType={attachment.mimeType}
                />
            )}
        </Flex>
    );
};

export default AudioAttachment
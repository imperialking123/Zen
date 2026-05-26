import { generateCDN_URL } from "@/core/utils/general-functions";
import { Tooltip } from "@/components/ui/tooltip";
import { Flex, Float, FormatByte, IconButton, LocaleProvider, Text, Box } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaFileAudio, FaPause, FaPlay } from "react-icons/fa";
import { getSource } from "./message-attachment-render";
import type { Attachment } from "@/core/types/schema";
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

    const [isVolOpen, setIsVolOpen] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const sliderRef = useRef<HTMLInputElement>(null);

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
                bg="blackAlpha.800"
                color="white/60"
                alignItems="center"
                gap="8px"
                w="full"
                p="5px"
                rounded="md"
            >
                {/* Play/Pause */}
                <Flex alignItems="center" justifyContent="center" flexShrink={0} _hover={{ color: "white" }} cursor="pointer" onClick={handleTogglePlay}>
                    {audioDetails.isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                </Flex>

                {/* Time display */}
                <Flex gap="3px" color="whiteAlpha.600" alignItems="center" fontSize="12px" flexShrink={0}>
                    <Text>{audioDetails.shouldRenderAudio ? formatTime(audioDetails.currentTime) : "-:--"}</Text>
                    <Text>/</Text>
                    <Text>{audioDetails.shouldRenderAudio ? formatTime(audioDetails.duration) : "-:--"}</Text>
                </Flex>

                {/* Seek bar */}
                <input
                    ref={sliderRef}
                    type="range"
                    min={0}
                    defaultValue={0}
                    max={audioDetails.duration || 100}
                    step={1}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleSliderChange}
                    style={{ flex: 1, minWidth: 0 }}
                    className="bw-range"
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
                                    const newVolume = Math.max(0, Math.min(1, ratio));
                                    setVolume(newVolume);
                                    setIsMuted(newVolume === 0);
                                    if (audioRef.current) {
                                        audioRef.current.volume = newVolume;
                                    }
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





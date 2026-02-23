import { Tooltip } from "@/components/ui/tooltip";
import { Box, Flex, Popover, Portal } from "@chakra-ui/react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSmile } from "react-icons/fa";
import EmojiMapping from "./emojis-mapping";
import GifsUI from "./gif-ui";
import type { GifData } from "@/types";

const EmojiGifPicker = ({
  onEmojiSelect,
  onGifSelect,
}: {
  onEmojiSelect: (emoji: string) => void;
  onGifSelect: ({ gifData }: { gifData: GifData }) => void;
}) => {
  const [selectedTab, setSelectedTab] = useState<"emoji" | "gif">("emoji");
  const [showPopOver, setShowPopOver] = useState(false)

  const id = useId();

  const { t: translate } = useTranslation(["chat"]);

  const { toolTipContent, GifsText, EmojisText } = translate(
    "EmojiGifPickerTranslate",
  ) as unknown as {
    toolTipContent: string;
    GifsText: string;
    EmojisText: string;
  };

  const handleGifSelect = ({ gifData }: { gifData: GifData }) => {
    // Close immediately before heavy operations to improve perceived performance
    setShowPopOver(false);
    // Defer heavy operations to prevent blocking the UI
    setTimeout(() => onGifSelect({ gifData }), 0);
  }

  return (
    <Popover.Root
      open={showPopOver}
      onOpenChange={(e) => setShowPopOver(e.open)}
      unmountOnExit
      ids={{ trigger: id }}
      positioning={{ offset: { crossAxis: 0, mainAxis: 20 } }}

      size="xs"
      modal
    >
      <Tooltip
        positioning={{ offset: { mainAxis: 15, crossAxis: 4 } }}
        contentProps={{
          padding: "8px",
          rounded: "5px",
          color: "fg",
          css: {
            "--tooltip-bg": "colors.bg",
          },
        }}
        ids={{ trigger: id }}
        content={toolTipContent}
      >
        <Popover.Trigger asChild>
          <Flex
            alignItems="center"
            justifyContent="center"
            h="35px"
            w="35px"
            rounded="lg"
            _hover={{ bg: "bg.emphasized" }}
          >
            <FaSmile />
          </Flex>
        </Popover.Trigger>
      </Tooltip>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            padding="0px"
            h={{ base: "65dvh", lg: "70dvh", md: "70dvh" }}
            w={{ base: "98dvw", lg: "35dvw", md: "50dvw" }}
            rounded="10px"
          >
            <Flex px="10px" alignItems="center" gap="5px" w="full" h="50px">
              <Flex
                userSelect="none"
                fontWeight="600"
                rounded="md"
                bg={selectedTab === "gif" ? "bg.emphasized" : "bg"}
                px="15px"
                py="3px"
                _hover={{
                  bg: "bg.emphasized",
                }}
                onClick={() => setSelectedTab("gif")}
                transition="0.3s ease"
              >
                {GifsText}
              </Flex>

              <Flex
                userSelect="none"
                fontWeight="600"
                rounded="md"
                bg={selectedTab === "emoji" ? "bg.emphasized" : "bg"}
                px="10px"
                py="3px"
                _hover={{
                  bg: "bg.emphasized",
                }}
                onClick={() => setSelectedTab("emoji")}
                transition="0.3s ease"
              >
                {EmojisText}
              </Flex>
            </Flex>

            <Box
              overflow="auto"
              minH="calc(100% - 50px)"
              maxH="calc(100% - 50px)"
            >
              {selectedTab === "emoji" && (
                <EmojiMapping onEmojiSelect={onEmojiSelect} />
              )}
              {selectedTab === "gif" && <GifsUI onGifSelect={handleGifSelect} />}
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default EmojiGifPicker;

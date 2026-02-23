import type { GifData } from "@/types";
import type { IUser } from "@/types/schema";
import { formatDateForTooltip } from "@/utils/chatFunctions";
import { Avatar, Flex, Text } from "@chakra-ui/react";
import { FaX } from "react-icons/fa6";
import { createDialog } from "../create-dialog";
import { useState } from "react";
import MediaLoadErrorUI from "@/app/shared/message/media-load-error-ui";

const GifVideoPlayer = ({ gifData }: { gifData: GifData }) => {
  const [isError, setIsError] = useState(false);

  if (isError) {
    return <MediaLoadErrorUI />;
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      src={gifData.full}
      onError={() => setIsError(true)}
      style={{
        maxWidth: "80vw",
        maxHeight: "70vh",
        width: "auto",
        height: "auto",
        objectFit: "contain",
        borderRadius: "8px",
        pointerEvents: "none",
      }}
    />
  );
};

const GifFullScreenPreviewUI = ({
  senderProfile,
  gifData,
  createdAt,
}: {
  senderProfile: IUser | undefined;
  gifData: GifData;
  createdAt: string;
}) => {
  const handleExit = () => {
    const id = "showGifFullScreenId";
    createDialog.close(id);
  };


  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      pos="relative"
      zIndex={5}
      w="full"
      h="100vh"
    >
      <Flex
        zIndex={80}
        color="white"
        w="full"
        h="70px"
        alignItems="center"
        px="15px"
        pos="absolute"
        left="0"
        right="0"
        top="5"
        justifyContent="space-between"
      >
        {senderProfile && (
          <Flex gap="10px">
            <Avatar.Root>
              <Avatar.Fallback name={senderProfile.displayName} />
              <Avatar.Image src={senderProfile.profile?.profilePic} />
            </Avatar.Root>

            <Flex
              color="white"
              display={{ lg: "flex", base: "none" }}
              direction="column"
            >
              <Text>{senderProfile.displayName}</Text>
              <Text>{formatDateForTooltip(createdAt)}</Text>
            </Flex>
          </Flex>
        )}

        <Flex alignItems="center" gap="10px">
          <Flex
            onClick={handleExit}
            border="1px solid"
            borderColor="gray.700"
            boxSize="40px"
            alignItems="center"
            justifyContent="center"
            transition="0.5s ease"
            bg="gray.800"
            _hover={{
              bg: "gray.700",
              border: "1px solid",
              borderColor: "gray.500",
            }}
            rounded="xl"
          >
            <FaX />
          </Flex>
        </Flex>
      </Flex>

      <Flex
        justifyContent="center"
        alignItems="center"
        onClick={() => {
          handleExit();
        }}
        w="full"
        h="full"
      >
        <GifVideoPlayer gifData={gifData} />
      </Flex>
    </Flex>
  );
};

export default GifFullScreenPreviewUI;

import { Flex, Float, Text } from "@chakra-ui/react";
import { FaFileAudio, FaFileImage, FaFileWord } from "react-icons/fa6";

const FileDragUI = ({ receiver }: { receiver: string }) => {
  return (
    <Flex
      minW="full"
      minH="full"
      border="2px dashed"
      rounded="md"
      borderColor="bg.emphasized"
      justifyContent="flex-end"
      direction="column"
      pb="18px"
    >
      <Flex alignItems="center" direction="column">
        <Float offsetY="6" placement="top-center">
          <Flex
            justifyContent="center"
            color="fg.muted"
            alignItems="center"
            w="280px"
            position="relative"
          >
            <FaFileAudio
              style={{
                transform: "rotate(-30deg)",
                marginRight: "-25px",
                zIndex: 1,
              }}
              size={80}
            />
            <FaFileImage size={80} style={{ zIndex: 999 }} />
            <FaFileWord
              style={{
                transform: "rotate(30deg)",
                marginLeft: "-25px",
                zIndex: 1,
              }}
              size={80}
            />
          </Flex>
        </Float>

        <Text fontSize="md" fontWeight="600">
          Upload to @{receiver}
        </Text>
        <Text textAlign="center">
          You can add Comments before uploading. Hold shift to upload directly.
        </Text>
      </Flex>
    </Flex>
  );
};

export default FileDragUI;






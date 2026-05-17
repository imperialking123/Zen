import { Flex, Progress, Text } from "@chakra-ui/react";
import { FaFile } from "react-icons/fa6";

const UploadingFilesUI = ({ text }: { text: string }) => {
  return (
    <Flex
      minH="55px"
      maxH="55px"
      minW={{ base: "260px", lg: "320px", md: "320px" }}
      maxW={{ base: "260px", lg: "320px", md: "320px" }}
      border="1px solid"
      borderColor="bg.emphasized"
      rounded="md"
      gap="2"
      userSelect="none"
      overflow="hidden"
      mb="5px"
    >
      <Flex
        color="fg.muted"
        h="55px"
        minW="50px"
        alignItems="center"
        justifyContent="center "
      >
        <FaFile size={30} />
      </Flex>

      <Flex
        pr="10px"
        gap="1"
        justifyContent="center"
        flex={1}
        direction="column"
      >
        <Text
          maxW="200px"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          fontSize="sm"
        >
          {text}
        </Text>
        <Progress.Root variant="subtle" size="sm" rounded="full" value={null}>
          <Progress.Track h="5px">
            <Progress.Range
              css={{
                animationDuration: "0.8s",
              }}
            />
          </Progress.Track>
        </Progress.Root>
      </Flex>
    </Flex>
  );
};

export default UploadingFilesUI;






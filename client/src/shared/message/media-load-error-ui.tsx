import { Flex, Image } from "@chakra-ui/react";
import facedownsvg from "@/assets/facedown.svg";

const MediaLoadErrorUI = () => {
  return (
    <Flex
      bg="bg.emphasized"
      flex={1}
      alignItems="center"
      justifyContent="center"
      rounded="sm"
      w="100%"
      minH="100%"
      onDrag={(e) => e.preventDefault()}
    >
      <Image draggable={false} width="90px" h="80px" src={facedownsvg} />
    </Flex>
  );
};

export default MediaLoadErrorUI;






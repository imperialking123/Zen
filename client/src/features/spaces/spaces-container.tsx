import { Flex } from "@chakra-ui/react";
import NoContentPlaceHolder from "@/components/ui/no-content-placeholder";

const SpacesContainer = () => {
  return (
    <Flex w="full" h="full" p="5px" roundedTopLeft={{ lg: "15px", md: "15px" }} >
      <NoContentPlaceHolder />
    </Flex>
  )
};
export default SpacesContainer;






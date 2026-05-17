import { Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const RouteNotFound = () => {
  const navigate = useNavigate();

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      direction="column"
      h="100dvh"
      w="full"
      flex={1}
    >
      <Text>Umm what are you doing here</Text>

      <Button onClick={() => navigate("/app")}>Go to Home</Button>
    </Flex>
  );
};

export default RouteNotFound;






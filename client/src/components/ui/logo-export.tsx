import { Flex, Image } from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";

const AuthLogo = () => {
  return (
    <Flex>
      <Image width="40px" src={useColorModeValue("/black.svg", "/white.svg")} />
    </Flex>
  );
};

export default AuthLogo;






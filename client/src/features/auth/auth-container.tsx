import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import AuthSideUI from "./ui/auth-side-ui";

const AuthContainer = () => {
  return (
    <Flex
      className="satoshi-bold"
      pos="relative"
      minH="100dvh"
      w="full"
      maxH="100dvh"
    >
      <Flex display={{ lg: "flex", base: "none", md: "none" }} flex={1}>
        <AuthSideUI />
      </Flex>

      <Flex
        direction="column"
        backdropBlur="4xl"
        w={{ base: "100%", lg: "50%" }}
      >
        <Outlet />
      </Flex>
    </Flex>
  );
};

export default AuthContainer;

// w={{ base: "100%", md: "70%", lg: "35%" }}

// flex={{ base: 1, lg: 0, md: 0 }}
//  border={{ base: "none", lg: { _dark: "1px solid gray" } }}
//     boxShadow={{ base: "none", lg: { _light: "md" } }}






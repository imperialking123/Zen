import { Flex, Image } from "@chakra-ui/react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useIdleTimer } from "react-idle-timer/legacy";
import { useColorModeValue } from "@/components/ui/color-mode";
import userAuthStore from "@/core/store/user-auth-store";
import AppNavigatorBig, {
  AppNavigatorSmall,
} from "@/components/ui/app-navigator";
import { createDialog } from "@/shared/create-dialog";
import { useEffect } from "react";

const AppTopRibbon = () => {
  const source = useColorModeValue("/black.svg", "/white.svg");

  // Alert Add Electron close minimize, maximize buttons here later

  return (
    <Flex alignItems="center" w="full" h="full">
      <Flex
        pointerEvents="none"
        userSelect="none"
        ml="5"
        alignItems="center"
        gap="5px"
      >
        <Image width="30px" height="30px" src={source} objectFit="contain" />
      </Flex>
    </Flex>
  );
};

const AppContainer = () => {
  const shelfColor = useColorModeValue("#fbfbfcff", "gray.900");
  const contentBg = useColorModeValue("white", "gray.950");

  const socket = userAuthStore((state) => state.socket);

  const handleOnIdle = () => {
    if (socket) {
      socket.emit("idlePresenseChange", "idle");
    }
  };

  const handleOnActive = () => {
    if (socket) {
      socket.emit("idlePresenseChange", "online");
    }
  };

  useIdleTimer({
    timeout: 1000 * 60 * 5,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
  });


  const location = useLocation();
  const isInMainSection = ["/chat", "/moments", "/spaces", "/connections"].some(s => location.pathname.includes(s));
  const navigate = useNavigate()

  useEffect(() => {
    if (!isInMainSection) {
      navigate("chat")
    }
  }, [isInMainSection])

  return (
    <Flex bg={shelfColor} direction="column" minH="100dvh" h="100dvh">
      <Flex
        w="full"
        display={{ base: "none", md: "flex", lg: "flex" }}
        minH="6%"
      >
        <AppTopRibbon />
      </Flex>
      <Flex
        direction={{ base: "column", lg: "row", md: " row" }}
        w="full"
        h={{ base: "100dvh", lg: "calc(100% - 6%)", md: "calc(100% - 6%)" }}
      >
        {/*Navigation Side Bar for Large screens */}
        <Flex
          display={{ base: "none", md: "flex", lg: "flex", "2xl": "flex" }}
          pt="10px"
          minH="full"
          w={{ base: "0%", md: "10%", lg: "5%" }}
        >
          <AppNavigatorBig />
        </Flex>

        {/*DisplayedContent from Router */}
        <Flex
          border={{ base: "none", md: "1px solid", lg: "1px solid" }}
          borderColor={{
            base: "none",
            md: "colorPalette.muted",
            lg: "colorPalette.muted",
          }}
          w={{ base: "full", md: "90%", lg: "95%" }}
          minH={{ base: "92%", md: "full", lg: "full" }}
          maxH="full"
          bg={{ base: "bg", md: contentBg, lg: contentBg }}
          roundedTopLeft={{ base: "none", lg: "20px", md: "20px" }}
        >
          <Outlet />
        </Flex>

        {/*Navigation Bottom Bar for mobile Screens*/}

        <createDialog.Viewport />
        <AppNavigatorSmall />
      </Flex>
    </Flex>
  );
};

export default AppContainer;






import { Flex, Float, Text } from "@chakra-ui/react";
import { FiLayers, FiMessageCircle, FiZap } from "react-icons/fi";
import { HiOutlineShare } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { GrSettingsOption } from "react-icons/gr";
import userCallStore from "@/store/user-call-store";
import userConnectionStore from "@/store/user-connections-store";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Tooltip } from "@/components/ui/tooltip";
import { type IconType } from "react-icons/lib";

const NavigationItem = ({
  item,
  isActive,
  hasIncomingRequests,
  notifyHasConnectionEl,
  handleNavigation
}: {
  item: { text: string; url: string; icon: IconType };
  isActive: boolean;
  hasIncomingRequests: boolean;
  notifyHasConnectionEl: React.ReactNode;
  handleNavigation: (url: string) => void;
}) => {
  const isConnections = item.url === "connections";

  return (
    <Flex
      pos="relative"
      justifyContent="center"
      alignItems="center"
      key={item.url}
      onClick={() => handleNavigation(item.url)}
      flexDir="column"
    >
      <Flex
        rounded="full"
        w="45px"
        pos="relative"
        minH="95%"
        bg={isActive ? "bg.emphasized" : ""}
        cursor="pointer"
        _hover={{
          bg: "bg.emphasized",
        }}
        justifyContent="center"
        alignItems="center"
      >


        <Flex p="4px" >
          <item.icon size={22} />
        </Flex>



      </Flex>
      {isConnections && hasIncomingRequests && notifyHasConnectionEl}
      <Text fontSize="xs" >
        {item.text}
      </Text>
    </Flex>
  );
};

const AppNavigatorBig = () => {
  const { isCalling } = userCallStore();

  const { receivedConnectionPings } = userConnectionStore();

  const sideBarLinksArray = [
    {
      text: "Chats",
      url: "chat",
      icon: <FiMessageCircle size={22} />,
    },
    {
      text: "Spaces",
      url: "spaces",
      icon: <FiLayers size={22} />,
    },

    {
      text: "Connections",
      url: "connections",
      icon: <HiOutlineShare size={22} />,
    },
    {
      text: "Moments",
      url: "moments",
      icon: <FiZap size={22} />,
    },
  ];

  const hoverBg = useColorModeValue("gray.200", "gray.700");
  const navigate = useNavigate();

  const location = useLocation();

  const handleNavigation = (url: string) => {
    if (isCalling) {
      ///NOTICE Show alert that user is in call
      return;
    } else {
      navigate(url);
    }
  };

  const hasIncomingRequests =
    Array.isArray(receivedConnectionPings) &&
    receivedConnectionPings.length > 0;

  const notifyHasConnectionEl = (
    <Float offset="1.5">
      <Flex
        ml="2"
        bg="red"
        color="white"
        p="5px"
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        fontSize="xs"
      ></Flex>
    </Float>
  );

  return (
    <Flex
      pt="10px"
      rounded="full"
      w="full"
      minH="full"
      alignItems="center"
      direction="column"
      gap="15px"
      transition="0.5s all ease-in-out"
    >
      {sideBarLinksArray.map((item) => {
        const isActive = location.pathname.includes(item.url);

        const isConnections = item.url === "connections";

        return (
          <Flex
            w="full"
            pos="relative"
            justifyContent="center"
            alignItems="center"
            key={item.url}
          >
            <Tooltip
              positioning={{
                placement: "right",
              }}
              content={item.text}
              showArrow
            >
              <Flex
                onClick={() => handleNavigation(item.url)}
                rounded="lg"
                w="40px"
                pos="relative"
                h="40px"
                bg={isActive ? hoverBg : ""}
                cursor="pointer"
                _hover={{
                  bg: hoverBg,
                }}
                justifyContent="center"
                alignItems="center"
              >
                {item.icon}

                {isConnections && hasIncomingRequests && notifyHasConnectionEl}
              </Flex>
            </Tooltip>

            <Flex
              minH={isActive ? "35px" : "15px"}
              p="2px"
              bg={{ _light: "black", _dark: "white" }}
              roundedTopRight="full"
              roundedBottomRight="full"
              pos="absolute"
              left="-2%"
              transition="0.2s all ease-in-out"
            />
          </Flex>
        );
      })}
    </Flex>
  );
};

export const AppNavigatorSmall = () => {
  const { isCalling } = userCallStore();

  const sideBarLinksArray = [
    {
      text: "Chats",
      url: "chat",
      icon: FiMessageCircle
    },
    {
      text: "Spaces",
      url: "spaces",
      icon: FiLayers,
    },

    {
      text: "Connections",
      url: "connections",
      icon: HiOutlineShare,
    },
    {
      text: "Moments",
      url: "moments",
      icon: FiZap,
    },
    {
      text: "Settings",
      url: "settings",
      icon: GrSettingsOption,
    },
  ];

  const { receivedConnectionPings } = userConnectionStore();

  const navigate = useNavigate();

  const location = useLocation();

  const handleNavigation = (url: string) => {
    if (isCalling) {
      ///NOTICE Show alert that user is in call
      return;
    } else {
      navigate(url);
    }
  };

  const hasIncomingRequests =
    Array.isArray(receivedConnectionPings) &&
    receivedConnectionPings.length > 0;

  const notifyHasConnectionEl = (
    <Float offset="1.5">
      <Flex
        ml="2"
        bg="red"
        color="white"
        p="5px"
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        fontSize="xs"
      ></Flex>
    </Float>
  );

  return (
    <Flex
      bg="bg"
      display={{ base: "flex", md: "none", lg: "none" }}
      justifyContent="space-evenly"
      alignItems="center"
      w="full"
      p="5px"
      minH="8%"
      borderTop="0.5px solid"
      borderColor="bg.emphasized"
    >
      {sideBarLinksArray.map((item) => {
        const isActive = location.pathname.includes(item.url);

        return (
          <NavigationItem
            key={item.url}
            item={item}
            isActive={isActive}
            hasIncomingRequests={hasIncomingRequests}
            notifyHasConnectionEl={notifyHasConnectionEl}
            handleNavigation={handleNavigation}
          />
        );
      })}
    </Flex>
  );
};

export default AppNavigatorBig;

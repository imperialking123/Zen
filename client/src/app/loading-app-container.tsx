import {
  AbsoluteCenter,
  Flex,
  Image,
  Link,
  Progress,
  Text,
} from "@chakra-ui/react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useColorModeValue } from "../components/ui/color-mode";
import { LuExternalLink } from "react-icons/lu";

const LoadingAppUI = () => {
  const Links = [
    {
      icon: <FaGithub />,
      text: "Jacob Messiah",
      url: "https://github.com/jacobmessiah",
    },
    {
      icon: <FaLinkedin />,
      text: "Jacob Messiah",
      url: "https://www.linkedin.com/in/jacob-messiah/",
    },
  ];

  const imageSrc = useColorModeValue("/black.svg", "/white.svg");

  return (
    <Flex
      pos="relative"
      alignItems="flex-end"
      minW="100dvw"
      minH="100dvh"
      maxH="100dvh"
      maxW="100dvw"
    >
      <AbsoluteCenter flexDir="column" gap="5">
        <Image
          draggable={false}
          onDrag={(e) => e.preventDefault()}
          userSelect="none"
          pointerEvents="none"
          onClick={(e) => e.preventDefault()}
          width="40px"
          src={imageSrc}
        />

        <Progress.Root w="150px" variant="subtle" rounded="full" value={null}>
          <Progress.Track h="2px">
            <Progress.Range
              css={{
                animationDuration: "0.8s",
              }}
            />
          </Progress.Track>
        </Progress.Root>
      </AbsoluteCenter>

      <Flex
        w="full"
        justifyContent="center"
        alignItems="center"
        direction="column"
        userSelect="none"
        pb="5"
        gap="5"
      >
        <Text fontSize="lg">
          Created by{" "}
          <Text fontWeight="600" as="span">
            Imperial
          </Text>{" "}
        </Text>

        <Flex gap="10px" justifyContent="center" alignItems="center">
          {Links.map((link, i) => (
            <Link
              fontSize="sm"
              className="no-focus group "
              target="_blank"
              key={i}
              href={link.url}
            >
              {link.icon} {link.text}
              <Flex
                opacity={0}
                _groupHover={{
                  opacity: 100,
                }}
                transition="0.5s ease"
              >
                <LuExternalLink />
              </Flex>
            </Link>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LoadingAppUI;

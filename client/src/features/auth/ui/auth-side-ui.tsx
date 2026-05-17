import { Flex, Heading, Image, Text } from "@chakra-ui/react";
import Iridescence from "@/components/ui/iridescene";

export const AuthSideUI2 = () => {
  return (
    <Flex w="full" h="full" alignItems="center" justifyContent="center">
      <Image src="/white.svg" width="50%" objectFit="contain" />
    </Flex>
  );
};

const AuthSideUI = () => {
  return (
    <Flex pos="relative" w="full" h="100dvh">
      <Iridescence
        color={[0.15, 0.15, 0.15]}
        mouseReact={false}
        amplitude={0.1}
        speed={1.0}
      />

      <Flex direction="column" pos="absolute" bottom="10" left="10" maxW="full">
        <Heading className="gradient-text" size="3xl" fontWeight="semibold">
          Communicate your way. <br />
          Stories, connections, privacy all in Zen.
        </Heading>
        <Text
          fontWeight="500"
          mt={2}
          fontSize="md"
          maxW="80%"
          color="white"
          lineHeight="tall"
        >
          Share stories, connect with friends, and hang out over voice or video
          all in a private, focused space.
        </Text>
      </Flex>
    </Flex>
  );
};

export default AuthSideUI;






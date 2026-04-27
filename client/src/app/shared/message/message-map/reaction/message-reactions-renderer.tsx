import { getEmojiUrl } from "@/utils/chatFunctions";
import { Flex, Text } from "@chakra-ui/react";

// P2P

interface P2PMessageReactionsRendererProps {
  reactions: Record<string, { _id: string; username: string }[]>;
  handleReaction: (emoji: string) => void;
}
const P2PMessageReactionsRenderer = (
  props: P2PMessageReactionsRendererProps,
) => {
  const { reactions, handleReaction } = props;

  return (
    <Flex w="full" maxW="full" flexWrap="wrap" gap="5px">
      {Object.entries(reactions).map((reaction, index) => {
        return (
          <Flex
            cursor="pointer"
            h="33px"
            pr="5px"
            maxH="33px"
            minW="55px"
            maxW="65px"
            justifyContent="space-evenly"
            alignItems="center"
            border="1px solid"
            borderColor="bg.emphasized"
            key={index}
            rounded="8px"
            _hover={{
              bg: "bg.emphasized"
            }}
            onClick={() => handleReaction(reaction[0])}
          >
            <div
              style={{ backgroundImage: `url(${getEmojiUrl(reaction[0])})` }}
              className="reactionEmojiItem"
            ></div>
            <Text color="fg.muted" fontWeight="600">
              {reaction[1].length}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

export { P2PMessageReactionsRenderer };

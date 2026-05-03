import { ConversationActivityIndicator } from "@/app/shared/activity-indicator";
import type { IConversation } from "@/types/schema";
import { Avatar, Flex, Text } from "@chakra-ui/react";
import { BsRobot } from "react-icons/bs";
import { Link } from "react-router-dom";

const ConversationItem = ({
  convoItem,
  isSelected,
}: {
  convoItem: IConversation;
  isSelected: boolean;
}) => {
  const otherUser = convoItem.otherUser;

  return (
    <Link
      to={`${convoItem._id}`}
      style={{ textDecoration: 'none', width: '100%' }}
    >
      <Flex
        rounded="xl"
        _hover={{
          bg: "bg.emphasized",
        }}
        bg={isSelected ? "bg.emphasized" : ""}
        p="5px"
        transition="all"
        w="full"
        userSelect="none"
      >
        <Flex gap="10px" alignItems="center">
          <Avatar.Root size="md" colorPalette="bg" variant="subtle">
            <Avatar.Fallback>
              <BsRobot size={20} />
            </Avatar.Fallback>
            <ConversationActivityIndicator userId={otherUser._id} />
          </Avatar.Root>

          <Text fontWeight="600">{otherUser.displayName}</Text>
        </Flex>
      </Flex>
    </Link>
  );
};

export default ConversationItem;

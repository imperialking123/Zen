import { ConversationActivityIndicator } from "@/shared/activity-indicator";
import type { IConversation } from "@/core/types/schema";
import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { BsRobot } from "react-icons/bs";
import { Link } from "react-router-dom";

const UnreadsBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <Flex
      minW="20px"
      h="20px"
      px="5px"
      rounded="full"
      bg="colorPalette.solid"
      color="white"
      fontSize="11px"
      fontWeight="700"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      {count > 99 ? "99+" : count}
    </Flex>
  );
};

const ConversationItem = ({
  convoItem,
  isSelected,
  currentUserId, // ✅ needed to resolve unreadCount from the Record
}: {
  convoItem: IConversation;
  isSelected: boolean;
  currentUserId: string;
}) => {
  const otherUser = convoItem.otherUser;

  
  const unread = convoItem.unreadCount?.[currentUserId] ?? 0;
  const profilePic = otherUser.profile?.profilePic;

  return (
    <Link
      to={`${convoItem._id}`}
      style={{ textDecoration: "none", width: "100%" }}
    >
      <Flex
        rounded="xl"
        _hover={{ bg: "bg.emphasized" }}
        bg={isSelected ? "bg.emphasized" : "transparent"}
        p="8px"
        transitionProperty="background"
        transitionDuration="fast"
        w="full"
        userSelect="none"
        alignItems="center"
        justifyContent="space-between"
        gap="8px"
      >
        {/* Left: Avatar + name */}
        <Flex gap="10px" alignItems="center" minW={0}>
          <Box position="relative" flexShrink={0}>
            <Avatar.Root size="md" colorPalette="bg" variant="subtle">
              {profilePic
                ? <Avatar.Image src={profilePic} alt={otherUser.displayName} /> // ✅ real pic
                : <Avatar.Fallback><BsRobot size={20} /></Avatar.Fallback>
              }
            </Avatar.Root>
            <ConversationActivityIndicator userId={otherUser._id} />
          </Box>

          <Flex direction="column" minW={0}>
            <Text fontWeight="600" fontSize="sm" truncate>
              {otherUser.displayName}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              @{otherUser.username} {/* ✅ IUser has username, good for subtitle */}
            </Text>
          </Flex>
        </Flex>

        {/* Right: unread badge — correctly resolved from Record */}
        <UnreadsBadge count={unread} />
      </Flex>
    </Link>
  );
};

export default ConversationItem;






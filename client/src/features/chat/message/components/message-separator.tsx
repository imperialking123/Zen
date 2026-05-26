import { formatSeparatorTimestamp } from "@/core/utils/chat-functions";
import { Flex, Separator, Tag } from "@chakra-ui/react";


const MessageSeparator = ({ createdAt }: { createdAt: string | Date }) => {
  const formatTimeStamp = formatSeparatorTimestamp(createdAt);

  if (formatTimeStamp === null || !formatTimeStamp) return null;
  return (
    <Flex mb="5px" userSelect="none" gap="5px" alignItems="center" w="full">
      <Separator flex={1} />
      <Tag.Root>
        <Tag.Label>{formatTimeStamp}</Tag.Label>
      </Tag.Root>

      <Separator flex={1} />
    </Flex>
  );
};

export default MessageSeparator;






import { Avatar, Flex, IconButton, Text } from "@chakra-ui/react";
import { BsRobot } from "react-icons/bs";
import type { IUser } from "@/core/types/schema";
import { useTranslation } from "react-i18next";
import { IoChevronBack } from "react-icons/io5";

type ProfileDetailItemProps = {
  title: string;
  value: string;
};

const ProfileDetailItem = ({ title, value }: ProfileDetailItemProps) => {
  return (
    <Flex flexDir="column" gap="3px" fontSize="sm">
      <Text fontWeight="semibold">{title}</Text>
      <Text>{value}</Text>
    </Flex>
  );
};

const formatDate = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

type ProfileViewProps = {
  user: IUser;
  onClose: () => void;
};

const ProfileView = ({ user, onClose }: ProfileViewProps) => {
  const { t: translate, i18n } = useTranslation(["chat"]);

  const memberSinceText = translate("ProfileView.memberSinceText");
  const bioText = translate("ProfileView.bioText");

  const formattedDate = formatDate(user.createdAt, i18n.language);



  return (
    <Flex pos="relative" w="full" h="full" direction="column">
      {/* Top UI  */}
      <Flex w="full" pos="relative" mb="50px" h="25%" bg="fg.muted">
        <Flex w="full" pos="absolute" top="0" left="0" p="10px">
          <IconButton
            aria-label="Go back"
            rounded="full"
            bg="blackAlpha.500"
            color="white"
            _hover={{ bg: "blackAlpha.600" }}
            size="sm"
            onClick={onClose}
            display={{
              base: "flex",
              md: "none",
              lg: "none",
              xl: "none",
            }}
          >
            <IoChevronBack />
          </IconButton>
        </Flex>
      </Flex>

      {/* Profile Image */}
      <Flex
        pos="absolute"
        top="25%"
        left="5%"
        transform="translateY(-50%)"
        w="100px"
        h="100px"
        p="5px"
        bg="bg"
        rounded="full"
      >
        <Avatar.Root size="full">
          <Avatar.Fallback name={user.displayName}>
            <BsRobot size={35} />
          </Avatar.Fallback>
          <Avatar.Image src={user.profile?.profilePic} />
        </Avatar.Root>
      </Flex>

      {/* User Profile Details Details */}
      <Flex userSelect="none" gap="15px" flex={1} flexDir="column" px="10px">
        <Flex w="full" flexDir="column">
          <Text
            cursor="pointer"
            _hover={{
              textDecor: "underline",
            }}
            fontSize="lg"
            fontWeight="semibold"
          >
            {user.displayName}
          </Text>

          <Text
            cursor="pointer"
            _hover={{
              textDecor: "underline",
            }}
            fontSize="sm"
          >
            {user.username}
          </Text>
        </Flex>

        <Flex
          gap="5px"
          flexDir="column"
          p="10px"
          rounded="md"
          border="1px solid"
          borderColor="bg.emphasized"
        >
          <ProfileDetailItem title={memberSinceText} value={formattedDate} />

          {user.profile?.bio && (
            <ProfileDetailItem title={bioText} value={user.profile.bio} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ProfileView;

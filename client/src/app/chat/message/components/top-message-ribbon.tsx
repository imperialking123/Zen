import { Avatar, Flex, Input, InputGroup, Text } from "@chakra-ui/react";
import type { IUser } from "../../../../types/schema";
import { FiChevronLeft, } from "react-icons/fi";
import { IoVideocam, } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
import { PiPhoneCallFill } from "react-icons/pi";
import { FaUserCircle } from "react-icons/fa";
import { ConversationActivityIndicator } from "@/app/shared/activity-indicator";
import { LuSearch } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { Tooltip, type TooltipProps } from "@/components/ui/tooltip";



type MessageTopRibbonT = {
  otherUser: IUser;
  handleUnSelectConversation: () => void;
  onToggleUserProfileSidebar: () => void;
  isUserProfileSidebarOpen: Boolean

}

const MessageTopRibbon = ({
  otherUser,
  handleUnSelectConversation,
  onToggleUserProfileSidebar,
  isUserProfileSidebarOpen
}: MessageTopRibbonT) => {


  const { t } = useTranslation(["chat"])

  const searchText = t("searchText")

  const placeHolderText = `${searchText} ${otherUser.username} `

  const messageTopRibbon = t("messageTopRibbon", { returnObjects: true }) as {
    startVideoCall: string;
    startVoiceCall: string;
    showUserProfile: string;
    hideUserProfile: string;
  }

  const tooltipProps: Partial<TooltipProps> = {
    showArrow: true,
    contentProps: {
      "rounded": "md",
      padding: "8px",
      color: "fg",
      css: { "--tooltip-bg": "colors.bg" },
    }
  }


  return (
    <Flex
      p="10px"
      h="55px"
      w="100%"
      borderBottom="1px solid var(--chakra-colors-bg-emphasized)"
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex gap="1.5" alignItems="center">
        <Flex onClick={handleUnSelectConversation} cursor="pointer" h="20px" w="20px" alignItems="center" justifyContent="center" >
          <FiChevronLeft size={18} />
        </Flex>

        <Avatar.Root size="sm">
          <Avatar.Fallback name={otherUser?.displayName}>
            <BsRobot />
          </Avatar.Fallback>
          <Avatar.Image src={otherUser?.profile?.profilePic} />
          <ConversationActivityIndicator userId={otherUser._id} />
        </Avatar.Root>

        <Text fontWeight="600" fontSize="sm" userSelect="none">
          {otherUser.displayName}
        </Text>
      </Flex>

      <Flex alignItems="center" gap="15px">
        <Tooltip {...tooltipProps} content={messageTopRibbon.startVideoCall}>
          <IoVideocam className="top-ribbon-icon video" style={{ cursor: "pointer" }} />
        </Tooltip>

        <Tooltip {...tooltipProps} content={messageTopRibbon.startVoiceCall}>
          <PiPhoneCallFill className="top-ribbon-icon" style={{ cursor: "pointer" }} />
        </Tooltip>


        <>
          <input
            onChange={onToggleUserProfileSidebar}
            type="checkbox"
            id="profile-toggle"
            className="profile-toggle-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="profile-toggle">

            <Tooltip {...tooltipProps} content={isUserProfileSidebarOpen ? messageTopRibbon.hideUserProfile : messageTopRibbon.showUserProfile}>
              <FaUserCircle className="top-ribbon-icon user-profile" style={{ cursor: "pointer" }} />
            </Tooltip>

          </label>
        </>

        <InputGroup endElement={
          <LuSearch />
        }>

          <Input placeholder={placeHolderText} rounded="md" h="9" />


        </InputGroup>


      </Flex>
    </Flex>
  );
};

export default MessageTopRibbon;

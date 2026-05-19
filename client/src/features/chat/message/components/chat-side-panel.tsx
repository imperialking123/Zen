import { Flex } from "@chakra-ui/react";
import ProfileView from "./profile-view";
import type { IUser } from "@/core/types/schema";

export type sideBarOpenT = boolean | "default";
export type ChatSidePanelUIType = "profile" | "search";

type ChatSidePanelProps = {
  isOpen: sideBarOpenT;
} & (
    | { uiToRender: "profile"; user: IUser; onClose: () => void }
    | { uiToRender: "search"; user?: IUser }
  );

const ChatSidePanel = (props: ChatSidePanelProps) => {
  const { isOpen, uiToRender } = props;
  return (
    <Flex
      bg="bg"
      display={{
        base: "flex",
        md: "none",
        lg: isOpen ? "flex" : "none",
      }}
      borderLeft={{
        base: "none",
        lg: "1px solid var(--chakra-colors-bg-emphasized)",
      }}
      position={{
        base: "fixed",
        md: "static",
        lg: "static",
      }}
      inset={{
        base: "0",
        md: "auto",
        lg: "auto",
      }}
      flex={{
        base: "none",
        md: "0",
        lg: "1",
      }}
      transform={{
        base:
          isOpen === "default"
            ? "translateX(100%)"
            : isOpen
              ? "translateX(0)"
              : "translateX(100%)",
        md: "none",
        lg: "none",
      }}
      transition={{
        base: "transform 0.3s ease-out",
        md: "none",
        lg: "none",
      }}
      zIndex={{
        base: "overlay",
        md: "auto",
        lg: "auto",
      }}
      direction="column"
    >
      {uiToRender === "profile" && (
        <ProfileView user={props.user} onClose={props.onClose} />
      )}
      {uiToRender === "search" && <Flex>Search View</Flex>}
    </Flex>
  );
};

export default ChatSidePanel;

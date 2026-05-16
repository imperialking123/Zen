import { CreateDmConnectionItem } from "@/app/connections/components/connection-item";
import { Tooltip } from "@/components/ui/tooltip";
import userAuthStore from "@/store/user-auth-store";
import userChatStore from "@/store/user-chat-store";
import userConnectionStore from "@/store/user-connections-store";
import type { ConnectionType, IConversation } from "@/types/schema";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Input,
  Portal,
  Text,
  useDialog,
} from "@chakra-ui/react";
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";


const NoConnectionsUI = ({ noConnectionsText }: { noConnectionsText: string }) => {
  const navigate = useNavigate();
  
  return (
    <Flex 
      direction="column" 
      alignItems="center" 
      justifyContent="center" 
      w="full" 
      h="full" 
      gap="4"
      p="6"
    >
      <Text textAlign="center" color="fg.muted" fontSize="md">
        {noConnectionsText}
      </Text>
      <Text
        onClick={() => navigate('/app/connections')}
        cursor="pointer"
        textDecoration="underline"
      >
        Go to Connections
      </Text>
    </Flex>
  );
}

const CreateDmUI = ({
  children,
  newChatText,
  selectConnectionsDescription,
  selectConnectionsTitle,
  searchConnectionsPlaceHolder,
  noConnectionsText
}: {
  children: ReactNode;
  newChatText: string;
  selectConnectionsDescription: string;
  selectConnectionsTitle: string;
  searchConnectionsPlaceHolder: string; noConnectionsText: string
}) => {
  const connections = userConnectionStore((state) => state.connections);

  const authUser = userAuthStore((state) => state.authUser);

  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionType | null>();

  const [allConnections, setAllConnections] =
    useState<ConnectionType[]>(connections);

  const handleOnchange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value === "") {
      setAllConnections(connections);
      return;
    }

    const filtered = connections.filter(
      (cn) =>
        cn.otherUser?.username?.toLowerCase()?.includes(value) ||
        cn.otherUser?.displayName?.toLowerCase()?.includes(value),
    );

    setAllConnections(filtered);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "") {
      event.preventDefault();
    }
  };

  const handleSelectConnection = (connectionData: ConnectionType) => {
    if (!connectionData) return;

    if (
      connectionData.otherUser.username ===
      selectedConnection?.otherUser.username
    ) {
      setSelectedConnection(null);
      return;
    }

    setSelectedConnection(connectionData);
  };

  const dialog = useDialog();

  const navigate = useNavigate();

  const handleCreateDM = () => {
    if (!selectedConnection) {
      dialog.setOpen(false);
      return;
    }

    const findConversation = userChatStore
      .getState()
      .conversations.find((p) =>
        p.participants.includes(selectedConnection.otherUser._id),
      );

    if (findConversation) {
      navigate(`${findConversation._id}`);
      dialog.setOpen(false);
      return;
    }

    const conversationOBJ: IConversation = {
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      _id: crypto.randomUUID(),
      isTemp: true,
      otherUser: selectedConnection.otherUser,
      participants: [authUser?._id || "", selectedConnection.otherUser._id],
      relation: "connection",
      connectionId: selectedConnection._id,
      showFor: [selectedConnection.otherUser._id, authUser?._id!],
    };

    navigate(`${conversationOBJ._id}`);
    userChatStore.setState((state) => {
      const conversations = [conversationOBJ, ...state.conversations];

      return {
        conversations,
      };
    });

    dialog.setOpen(false);
  };

  const handleOnExitComplete = () => {
    //reset my selected Connection
    setSelectedConnection(null);
  };

  //Update state once Connection changes
  useEffect(() => {
    setAllConnections(connections);
  }, [connections]);
  return (
    <Dialog.RootProvider
      unmountOnExit
      lazyMount
      onExitComplete={handleOnExitComplete}
      value={dialog}
      placement="center"
      size={{ mdDown: "full", md: "md" }}
    >
      <Tooltip
        showArrow
        positioning={{ placement: "top" }}
        content={newChatText}
      >
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      </Tooltip>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            display="flex"
            flexDir="column"
            h={{ base: "100dvh", md: "80dvh", lg: "70vh" }}
            maxH={{ base: "100dvh", md: "80dvh", lg: "70vh" }}
            minH={{ base: "100dvh", md: "80%", lg: "70%" }}
            rounded={{ base: "none", lg: "xl", md: "xl" }}
            overflow="hidden"
          >
            <Dialog.Header display="flex" flexDir="column" flexShrink={0}>
              <Dialog.Title fontSize="xl" userSelect="none">
                {selectConnectionsTitle}
              </Dialog.Title>

              <Dialog.Description>
                {selectConnectionsDescription}
              </Dialog.Description>

              {/*Search Bar for easy access to connections */}

              <Input
                onChange={handleOnchange}
                onKeyDown={handleOnKeyDown}
                placeholder={searchConnectionsPlaceHolder}
                rounded="lg"
              />
            </Dialog.Header>

            <Dialog.Body
              p="0px"
              px="5px"
              css={{
                "&::-webkit-scrollbar": {
                  width: "5px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "bg.emphasized",
                  borderRadius: "full",
                },
              }}
            >


              {allConnections.length === 0 && <NoConnectionsUI noConnectionsText={noConnectionsText} />}

              {allConnections.length > 0 &&
                allConnections.map((connectionItem) => {
                  const isSelected =
                    selectedConnection?.otherUser.username ===
                    connectionItem.otherUser.username;

                  return (
                    <CreateDmConnectionItem
                      handleSelectConnection={handleSelectConnection}
                      isSelected={isSelected}
                      key={connectionItem._id}
                      connectionItem={connectionItem}
                    />
                  );
                })}
            </Dialog.Body>

            {/*Footer for actions --> close Modal, create DM  */}
            <Dialog.Footer
              w="full"
              borderTop="1px solid"
              borderColor="fg.muted/30"
              flexShrink={0}
            >
              <Dialog.ActionTrigger asChild>
                <Button rounded="lg" w="50%" variant="outline">
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleCreateDM}
                disabled={!selectedConnection}
                rounded="lg"
                w="50%"
              >
                {newChatText}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton rounded="xl" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
};

export default CreateDmUI;

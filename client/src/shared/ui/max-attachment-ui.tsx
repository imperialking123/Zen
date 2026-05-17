import { Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { LuX } from "react-icons/lu";
import { createDialog } from "../create-dialog";


const AttachmentLimitUI = ({ max }: { max: number }) => {
  const { t: translate } = useTranslation(["dialog"]);

  const TOO_MANY_ATTACHMENTS_HEADER = translate("TOO_MANY_ATTACHMENTS_HEADER");
  const TOO_MANY_ATTACHMENTS_TEXT = translate("TOO_MANY_ATTACHMENTS_TEXT", {
    max: max.toString(),
  });

  const gotItText = translate("iunderstandText");

  const dialogId = "pasteDialogId";
  const handleRemoveDialog = () => {
    createDialog.close(dialogId);
  };

  return (
    <Flex color="fg.muted" direction="column" gap="1">
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold">
          {TOO_MANY_ATTACHMENTS_HEADER}
        </Text>

        <IconButton
          onClick={handleRemoveDialog}
          focusRing="none"
          size="sm"
          variant="outline"
          rounded="lg"
        >
          <LuX style={{ width: "22px", height: "22px" }} />
        </IconButton>
      </Flex>
      <Text fontSize="sm">{TOO_MANY_ATTACHMENTS_TEXT}</Text>
      <Button onClick={handleRemoveDialog} size="md" rounded="lg" mt="15px">
        {gotItText}
      </Button>
    </Flex>
  );
};

export default AttachmentLimitUI;






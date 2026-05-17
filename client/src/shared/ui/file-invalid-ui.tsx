import { Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { RiFolderWarningFill } from "react-icons/ri";

const FileInvalidUI = () => {
  const { t: translate } = useTranslation(["dialog"]);

  const INVALID_FILE_HEADER = translate("INVALID_FILE_HEADER");
  const INVALID_FILE_TEXT = translate("INVALID_FILE_TEXT");

  return (
    <Flex
      userSelect="none"
      minW="full"
      minH="full"
      direction="column"
      alignItems="center"
    >
      <RiFolderWarningFill size={120} />

      <Text textAlign="center" fontSize="xl" fontWeight="600" mt="4">
        {INVALID_FILE_HEADER}
      </Text>

      <Text textAlign="center" mt="2" px="4" color="fg.muted">
        {INVALID_FILE_TEXT}
      </Text>
    </Flex>
  );
};

export default FileInvalidUI;






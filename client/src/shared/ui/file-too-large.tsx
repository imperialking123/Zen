import { Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MdCloudDownload } from "react-icons/md";

const FileTooLargeUI = () => {
  const { t: translate } = useTranslation(["dialog"]);

  const FILE_LIMIT_HEADER = translate("FILE_LIMIT_HEADER");
  const FILE_LIMIT_TEXT = translate("FILE_LIMIT_TEXT");
  return (
    <Flex
      userSelect="none"
      minW="full"
      minH="full"
      direction="column"
      alignItems="center"
    >
      <MdCloudDownload size={120} />

      <Text fontSize="xl" fontWeight="600" mt="4">
        {FILE_LIMIT_HEADER}
      </Text>

      <Text textAlign="center" mt="2" px="4" color="fg.muted">
        {FILE_LIMIT_TEXT}
      </Text>
    </Flex>
  );
};
export default FileTooLargeUI;






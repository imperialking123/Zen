import { Flex, FormatByte, LocaleProvider, Text } from "@chakra-ui/react";
import { generateCDN_URL } from "@/utils/generalFunctions";
import { getDocumentIcon } from "../../message-input-ui";
import { HiDownload } from "react-icons/hi";
import { Tooltip } from "@/components/ui/tooltip";
import { Float, IconButton } from "@chakra-ui/react";
import type { Attachment } from "@/types/schema";

const DownloadButton = ({
    filePath,
    downloadText,
    mimeType,
    name,
}: {
    filePath: string;
    mimeType: string;
    downloadText: string;
    name: string;
}) => {
    const handleDownload = () => {
        if (!filePath || filePath === "") return;

        const downloadUrl = generateCDN_URL(filePath, mimeType, true);
        const url = downloadUrl;
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.target = "_blank";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Float
            opacity={0}
            _groupHover={{
                opacity: 100,
            }}
            bg="bg"
            rounded="3px"
            p="1px"
        >
            <Tooltip
                showArrow
                positioning={{
                    placement: "top",
                }}
                contentProps={{
                    padding: "8px",
                    boxShadow: "xs",
                    css: { "--tooltip-bg": "colors.bg", color: "fg.muted" },
                }}
                content={downloadText}
            >
                <IconButton
                    unstyled
                    onClick={handleDownload}
                    boxSize="30px"
                    justifyContent="center"
                    alignItems="center"
                    rounded="3px"
                    display="flex"
                    _hover={{
                        bg: "bg.muted",
                    }}
                    fontSize="18px"
                >
                    <HiDownload />
                </IconButton>
            </Tooltip>
        </Float>
    );
};

const DocumentAttachment = ({
    attachment,
    lang,
    downloadText,
}: {
    attachment: Extract<Attachment, { type: "document" }>;
    lang: string;
    downloadText: string;
}) => {
    const handleDownload = () => {
        if (!attachment.filePath) return;

        const link = document.createElement("a");
        const downloadUrl = generateCDN_URL(
            attachment.filePath!,
            attachment.mimeType,
            true,
        );
        link.href = downloadUrl;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Flex
            h="70px"
            border="1px solid"
            borderColor="bg.emphasized"
            px="10px"
            justifyContent="center"
            minW="300px"
            maxW="300px"
            rounded="md"
            userSelect="none"
            gap="10px"
            alignItems="center"
            className="group"
            pos="relative"
        >
            {getDocumentIcon(attachment.mimeType, 40)}

            <Flex fontSize="sm" direction="column" flex="1" minW="0">
                <Text
                    onClick={handleDownload}
                    _hover={{
                        textDecoration: attachment.filePath ? "underline" : "none",
                    }}
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    textAlign="left"
                >
                    {attachment.name}
                </Text>

                <Text
                    color="fg.muted"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    textAlign="left"
                >
                    <LocaleProvider locale={lang}>
                        <FormatByte value={attachment.size} />
                    </LocaleProvider>
                </Text>
            </Flex>

            {attachment.filePath && (
                <DownloadButton
                    downloadText={downloadText}
                    filePath={attachment.filePath}
                    name={attachment.name}
                    mimeType={attachment.mimeType}
                />
            )}
        </Flex>
    );
};

export default DocumentAttachment;

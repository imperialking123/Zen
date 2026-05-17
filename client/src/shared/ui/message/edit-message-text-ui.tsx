import { CloseButton, Flex, Heading, Text, type SystemStyleObject } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"


const EditMessageTextUI = () => {



    const scrollCSS: SystemStyleObject = {
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": {
            width: "5px",
        },
        "&::-webkit-scrollbar-track": {
            background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "fg.muted",
            borderRadius: "full",
        },
    };

    const { t: translate } = useTranslation(["chat"])

    const { headerText, descriptionText } = translate("EditMessageTextUI") as unknown as {
        headerText: string,
        descriptionText: string
    }

    const handleClose = () => {

    }

    return (
        <Flex
            display="flex"
            pb="10px"
            w="full"
            direction="column"
            h={{ base: "100dvh", md: "auto", lg: "auto" }}
            maxH={{ base: "100dvh", md: "75dvh", lg: "75dvh" }}
            overflow="hidden"
        >
            {/* Top section - fixed height */}
            <Flex direction="column" flex="0 0 auto">
                {/*Top UI */}
                <Flex direction="column">
                    <Flex px="15px" pt="10px" w="full" flexDir="column">
                        <Flex justifyContent="space-between">
                            <Heading>{headerText}</Heading>
                            <CloseButton
                                focusRing="none"
                                rounded="xl"
                                onClick={handleClose}
                            />
                        </Flex>

                        <Text>{descriptionText}</Text>
                    </Flex>
                </Flex>
                {/*Top UI */}
            </Flex>

            {/*Message Display Mappings UI */}
            <Flex
                my="10px"
                css={scrollCSS}
                overflowY="auto"
                overflowX="hidden"  // Add this to prevent horizontal scroll
                direction="column"
                gap="5px"
                px="10px"
                alignItems="center"
                py="8px"
                flex="1 1 auto"
                minH="0"
            >
            </Flex>
            {/*Message Display Mappings UI */}

            {/* Bottom section - fixed height */}
            <Flex
                pb="10px"
                justifyContent="center"
                flexDir="column"
                w="full"
                flex="0 0 auto"
            >
                <Flex px="10px" w="full" gap="10px">

                </Flex>
            </Flex>
        </Flex>
    )
}

export default EditMessageTextUI





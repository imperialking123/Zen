import AuthLogo from "@/components/ui/logo-export"
import { Button, Flex, Heading, Text } from "@chakra-ui/react"
import { BiHome } from "react-icons/bi"
import { useNavigate } from "react-router-dom"


const NoContentPlaceHolder = () => {

    const navigate = useNavigate()

    const handleNavigateToApp = () => {
        navigate("/app")
    }

    return (
        <Flex
            w="full"
            pos="relative"
            alignItems="center" justifyContent="center"
            direction="column" h="full"  >


            <Flex pos="absolute" top="15%" alignItems="center" justifyContent="center" >
                <AuthLogo />
            </Flex>

            <Heading textAlign="center" fontSize="4xl" whiteSpace="normal">
                This feature is being developed.
            </Heading>

            <Text textAlign="center" mt="5px" >
                Developers are working their best to bring this feature online.
                Thank you for you patience

            </Text>

            <Button onClick={handleNavigateToApp}  rounded="lg" mt="10px"  >
                <BiHome /> Go Home
            </Button>
        </Flex>
    )
}

export default NoContentPlaceHolder





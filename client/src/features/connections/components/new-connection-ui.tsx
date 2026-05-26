import { useColorModeValue } from "@/components/ui/color-mode";
import userAuthStore from "@/core/store/user-auth-store";
import { createNewConnectionPing } from "@/core/utils/connections-functions";
import { Button, Field, Flex, Input, InputGroup, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BeatLoader } from "react-spinners";


const NewConnectionUI = () => {
  const { t: translate } = useTranslation(["connection"]);
  const ERROR_MISSING_PING_ARG = translate(
    "NewConnectionResponses.ERROR_MISSING_PING_ARG"
  );
  const CANNOT_CONNECT_TO_YOURSELF = translate(
    "NewConnectionResponses.CANNOT_CONNECT_TO_YOURSELF"
  );

  const { authUser } = userAuthStore();

  const [inputDetails, setInputDetails] = useState({
    usernameQuery: "",
    isError: false,
    isSent: false,
    returnMessage: "",
    isSending: false,
    isSuccess: false,
  });

  useEffect(() => {
    if (inputDetails.isError) {
      setTimeout(() => {
        setInputDetails((prevDetails) => ({
          ...prevDetails,
          isError: false,
        }));
      }, 4000);
    }

    if (inputDetails.isSuccess) {
      setTimeout(() => {
        setInputDetails((prevDetails) => ({
          ...prevDetails,
          isSuccess: false,
        }));
      }, 6000);
    }
  }, [inputDetails.isError, inputDetails.isSuccess]);

  const connectionAddInstructionText = translate("ConnectionAddInstruction");
  const newConnectionButtonText = translate("NewConnectionButtonText");
  const PingConnectionButtonText = translate("PingConnectionButtonText");

  const handlePingNewConnection = async () => {
    if (inputDetails.isSending) return;

    if (inputDetails.usernameQuery.trim() === "") {
      setInputDetails((prevDetails) => ({
        ...prevDetails,
        isError: true,
        returnMessage: ERROR_MISSING_PING_ARG,
      }));
      return;
    }

    setInputDetails((prevDetails) => ({
      ...prevDetails,
      isError: false,
      returnMessage: "",
    }));

    if (inputDetails.usernameQuery.trim() === authUser?.username) {
      setInputDetails((prevDetails) => ({
        ...prevDetails,
        isError: true,
        returnMessage: CANNOT_CONNECT_TO_YOURSELF,
      }));
      return;
    }

    const username = inputDetails.usernameQuery.trim();

    setInputDetails((prevDetails) => ({
      ...prevDetails,
      isSending: true,
      usernameQuery: "",
    }));

    const resultData = await createNewConnectionPing(username);

    setInputDetails((prevDetails) => ({
      ...prevDetails,
      isSending: false,
    }));

    if (resultData.isError) {
      setInputDetails((prevDetails) => ({
        ...prevDetails,
        isError: resultData.isError,
        returnMessage: resultData.message,
      }));
    } else {
      setInputDetails((prevDetails) => ({
        ...prevDetails,
        isSuccess: true,
        returnMessage: resultData.message,
      }));
    }
  };

  const beatLoaderColor = useColorModeValue("white", "black");

  return (
    <Flex direction="column" alignItems="center" w="full" gap="15px" p="10px">
      <Flex w="full" direction="column" userSelect="none">
        <Text fontWeight="semibold">{newConnectionButtonText}</Text>
        <Text fontSize="sm" color={{ _light: "gray.600" }}>
          {connectionAddInstructionText}
        </Text>
      </Flex>

      <Field.Root invalid={inputDetails.isError}>
        <InputGroup
          endElement={
            <Button
              onClick={() => handlePingNewConnection()}
              transition="0.8s ease in "
              rounded="lg"
              size="sm"
            >
              {inputDetails.isSending ? (
                <BeatLoader color={beatLoaderColor} size={8} />
              ) : (
                PingConnectionButtonText
              )}{" "}
            </Button>
          }
        >
          <Input
            autoComplete="off"
            onChange={(e) =>
              setInputDetails((prev) => ({
                ...prev,
                usernameQuery: e.target.value.replace(" ", ""),
              }))
            }
            value={inputDetails.usernameQuery}
            onKeyDown={(key) => {
              if (key.key === " ") {
                key.preventDefault();
              }
            }}
            disabled={inputDetails.isSending}
            size="xl"
            placeholder={connectionAddInstructionText}
          />
        </InputGroup>
        {inputDetails.isError && !inputDetails.isSending && (
          <Field.ErrorText
            userSelect="none"
            fontSize="sm"
            color="red.500"
            mt="5px"
          >
            {inputDetails.returnMessage}
          </Field.ErrorText>
        )}
        {inputDetails.isSuccess && !inputDetails.isSending && (
          <Field.HelperText
            userSelect="none"
            fontSize="sm"
            ml="5px"
            color={{ _light: "green.500", _dark: "green.300" }}
          >
            {inputDetails.returnMessage}
          </Field.HelperText>
        )}
      </Field.Root>
    </Flex>
  );
};

export default NewConnectionUI;






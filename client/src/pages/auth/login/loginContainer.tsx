import {
  Button,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { IoEyeOffOutline } from "react-icons/io5";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { chakra } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import userAuthStore from "@/store/user-auth-store";
import { useColorModeValue } from "@/components/ui/color-mode";
import { handleCheckAuth, handleLogin } from "@/functions/authFunction";
import AuthLogo from "@/components/ui/logo-export";


const LoginContainer = () => {
  const { isLoginIn, authUser } = userAuthStore();
  const navigate = useNavigate();
  const { t: translate } = useTranslation(["auth"]);
  const formErrorBase = "login.form.errorTexts";

  // top-level hook for loader color
  const loaderColor = useColorModeValue("white", "black");

  const [showPassword, setShowPassword] = useState(false);
  const [loginDetails, setLoginDetails] = useState({
    handle: "",
    password: "",
  });

  const [isFormError, setIsFormError] = useState({
    password: {
      value: false,
      errorText: "",
    },
    handle: {
      value: false,
      errorText: "",
    },
  });

  const emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const usernameRegEx = /^[a-zA-Z0-9_]{3,20}$/;

  const handleSummitFunction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoginIn) return;

    if (authUser) {
      navigate("/zen");
    }

    let isError = false;
    const identifier = loginDetails.handle.trim();
    const cleanPassword = loginDetails.password.trim();

    if (!identifier) {
      isError = true;
      setIsFormError((prev) => ({
        ...prev,
        handle: {
          value: true,
          errorText: translate(`${formErrorBase}.HANDLE_REQUIRED`),
        },
      }));
    } else {
      const isEmailAttempt = identifier.includes("@");

      if (isEmailAttempt) {
        const [localPart] = identifier.split("@");

        if (localPart.length < 3 || !emailRegEx.test(identifier)) {
          isError = true;
          setIsFormError((prev) => ({
            ...prev,
            handle: {
              value: true,
              errorText: translate(`${formErrorBase}.VALID_EMAIL_REQUIRED`),
            },
          }));
        }
      } else {
        if (identifier.length < 4 || !usernameRegEx.test(identifier)) {
          isError = true;
          setIsFormError((prev) => ({
            ...prev,
            handle: {
              value: true,
              errorText: translate(`${formErrorBase}.USERNAME_NOT_COMPLETE`),
            },
          }));
        }
      }
    }

    if (!cleanPassword) {
      isError = true;
      setIsFormError((prev) => ({
        ...prev,
        password: {
          value: true,
          errorText: translate(`${formErrorBase}.PASSWORD_REQUIRED`),
        },
      }));
    } else if (cleanPassword.length < 6) {
      isError = true;
      setIsFormError((prev) => ({
        ...prev,
        password: {
          value: true,
          errorText: translate(`${formErrorBase}.PASSWORD_NOT_COMPLETE`),
        },
      }));
    }

    if (isError) return;

    const loginRes = await handleLogin(loginDetails);

    if (loginRes.isError) {
      setIsFormError((prev) => ({
        ...prev,
        handle: {
          errorText: loginRes.errorMessage,
          value: loginRes.isError,
        },
        password: {
          errorText: loginRes.errorMessage,
          value: loginRes.isError,
        },
      }));
    } else {
      await handleCheckAuth();
    }
  };

  const emailMaxLength = 54;
  const passwordMaxLength = 54;

  const handleOnChangeHandle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length > emailMaxLength) return;

    setLoginDetails((prev) => ({ ...prev, handle: value }));

    if (isFormError.handle.value) {
      setIsFormError((prev) => ({
        ...prev,
        handle: { value: false, errorText: "" },
      }));
    }
  };

  const handleOnchangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value.length > passwordMaxLength) return;

    setLoginDetails((prev) => ({ ...prev, password: value }));

    if (isFormError.password.value) {
      setIsFormError((prev) => ({
        ...prev,
        password: { value: false, errorText: "" },
      }));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const headText = translate("login.form.welcomeText.header");

  const followUpText = translate("login.form.welcomeText.followUpText");
  const passwordFieldText = translate("login.form.formText.password");
  const handleFieldText = translate("login.form.formText.handle");
  const LoginButtonText = translate("login.form.buttonText");
  const needAccountQuestion = translate("login.form.needAccountText.question");
  const needAccountInstruction = translate(
    "login.form.needAccountText.instruction",
  );

  const width = {
    base: "90%", // For small phones
    sm: "80%", // For large phones/small tablets (~480px)
    md: "60%", // This covers 927px (768px to 991px)
    lg: "50%", // Shrink it more for standard laptops
    xl: "70%", // Even smaller for big monitors
  };

  return (
    <Flex
      align="center"
      justify="center"
      direction="column"
      w="full"
      minH="100dvh"
      userSelect="none"
      py={{ base: "10px", lg: "30px", md: "20px" }}
      overflowY="auto"
    >
      <AuthLogo />

      <Flex
        alignItems="center"
        w={{ base: "95%", lg: "90%" }}
        direction="column"
        gap="3.5"
      >
        <Flex mb="15px" direction="column" gap="2" w="full" alignItems="center">
          <Heading fontSize="2xl" mt="10px">
            {headText}
          </Heading>
          <Text>{followUpText}</Text>
        </Flex>

        <chakra.form
          onSubmit={handleSummitFunction}
          w={width}
          display="flex"
          flexDir="column"
          gap="3"
        >
          <Field.Root invalid={isFormError.handle.value}>
            <Field.Label>{handleFieldText}</Field.Label>
            <Input
              size="md"
              onChange={handleOnChangeHandle}
              maxLength={emailMaxLength}
              pl="1.5"
            />
            <Field.ErrorText>{isFormError.handle.errorText}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={isFormError.password.value}>
            <Field.Label>{passwordFieldText}</Field.Label>
            <InputGroup
              endElement={
                <IconButton
                  onClick={toggleShowPassword}
                  size="xs"
                  variant="ghost"
                  rounded="full"
                >
                  {showPassword ? (
                    <IoEyeOffOutline />
                  ) : (
                    <MdOutlineRemoveRedEye />
                  )}
                </IconButton>
              }
            >
              <Input
                autoComplete="password"
                size="md"
                type={showPassword ? "text" : "password"}
                onChange={handleOnchangePassword}
                maxLength={passwordMaxLength}
                w="full"
                pl="1.5"
              />
            </InputGroup>
            <Field.ErrorText>{isFormError.password.errorText}</Field.ErrorText>
          </Field.Root>

          <Button type="submit">
            {isLoginIn ? (
              <BeatLoader color={loaderColor} size={8} loading />
            ) : (
              LoginButtonText
            )}
          </Button>
        </chakra.form>

        <Text>
          {needAccountQuestion}{" "}
          <Link
            style={{
              fontWeight: "bold",
            }}
            to={"signup"}
          >
            {needAccountInstruction}
          </Link>{" "}
        </Text>
      </Flex>
    </Flex>
  );
};

export default LoginContainer;

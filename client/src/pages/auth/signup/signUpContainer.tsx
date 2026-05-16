import { Button, Field, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";
import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useColorModeValue } from "../../../components/ui/color-mode";
import type { signupDetails } from "../../../types";
import DOBInput from "../../../components/ui/dob-input";
import {
  handleCheckAuth,
  handleCheckUsername,
  handleSignup,
} from "../../../functions/authFunction";

import { useTranslation } from "react-i18next";
import AuthLogo from "../../../components/ui/logo-export";
import debounce from "lodash.debounce";
import userAuthStore from "../../../store/user-auth-store";

type FieldError = {
  value: boolean;
  errorText: string;
};

type formError = {
  displayName?: FieldError;
  email?: FieldError;
  username?: FieldError;
  password?: FieldError;
  dob?: FieldError;
};

const SignUpContainer = () => {
  const { isSigningUp } = userAuthStore();
  const { t: translate, i18n } = useTranslation(["auth"]);


  // top-level hook for loader color
  const loaderColor = useColorModeValue("white", "black");

  const [signupDetails, setSignupDetails] = useState<signupDetails>({
    displayName: "",
    email: "",
    username: "",
    password: "",
    dob: null,
  });
  const [usernameQueryKey, setUsernameQueryKey] = useState("");
  const [usernameQueryInfo, setUsernameQueryKeyInfo] = useState({
    message: "",
    isError: false,
  });

  const [isFormError, setIsFormError] = useState<formError>({
    displayName: { value: false, errorText: "" },
    email: { value: false, errorText: "" },
    username: { value: false, errorText: "" },
    password: { value: false, errorText: "" },
    dob: { value: false, errorText: "" },
  });

  const validateForm = () => {
    let errors: formError = {
      displayName: { value: false, errorText: "" },
      email: { value: false, errorText: "" },
      username: { value: false, errorText: "" },
      password: { value: false, errorText: "" },
      dob: { value: false, errorText: "" },
    };

    let isValid = true;

    const displayName = signupDetails.displayName;
    const email = signupDetails.email; // already lowercased
    const username = signupDetails.username; // already lowercased
    const password = signupDetails.password;
    const dob = signupDetails.dob;

    /* ---------- Display Name ---------- */
    if (!displayName || !displayName.trim()) {
      errors.displayName = {
        value: true,
        errorText: translate("signup.form.errorTexts.DISPLAY_NAME_REQUIRED"),
      };
      isValid = false;
    } else {
      const nameLength = displayName.trim().length;

      if (nameLength < 4) {
        errors.displayName = {
          value: true,
          errorText: translate(
            "signup.form.errorTexts.DISPLAY_NAME_NOT_COMPLETE",
          ),
        };
        isValid = false;
      } else if (nameLength > 30) {
        errors.displayName = {
          value: true,
          errorText: translate("signup.form.errorTexts.DISPLAY_NAME_TOO_LONG"),
        };
        isValid = false;
      }
    }

    /* ---------- Email ---------- */
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!email || email.includes(" ")) {
      errors.email = {
        value: true,
        errorText: translate("signup.form.errorTexts.EMAIL_REQUIRED"),
      };
      isValid = false;
    } else if (email.length < 9 || email.length > 60) {
      errors.email = {
        value: true,
        errorText: translate("signup.form.errorTexts.EMAIL_LENGTH_INVALID"),
      };
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = {
        value: true,
        errorText: translate("signup.form.errorTexts.VALID_EMAIL_REQUIRED"),
      };
      isValid = false;
    }

    /* ---------- Username ---------- */
    const usernameRegex = /^[a-z0-9_]{4,20}$/;

    if (!username) {
      errors.username = {
        value: true,
        errorText: translate("signup.form.errorTexts.USERNAME_REQUIRED"),
      };
      isValid = false;
    } else if (!usernameRegex.test(username)) {
      errors.username = {
        value: true,
        errorText: translate("signup.form.errorTexts.USERNAME_NOT_COMPLETE"),
      };
      isValid = false;
    }

    /* ---------- Password ---------- */
    if (!password || password.length < 6 || password.length > 50) {
      errors.password = {
        value: true,
        errorText: translate("signup.form.errorTexts.PASSWORD_NOT_COMPLETE"),
      };
      isValid = false;
    }

    /* ---------- Date of Birth ---------- */
    if (!(dob instanceof Date) || isNaN(dob.getTime())) {
      errors.dob = {
        value: true,
        errorText: translate("signup.form.errorTexts.DOB_INVALID"),
      };
      isValid = false;
    } else {
      const today = new Date();

      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      if (age < 7) {
        errors.dob = {
          value: true,
          errorText: translate("signup.form.errorTexts.DOB_TOO_YOUNG"),
        };
        isValid = false;
      }
    }

    setIsFormError(errors);
    return isValid;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    let formattedValue = value;

    // ---------- Normalize & restrict ----------
    if (name === "email") {
      formattedValue = value.toLowerCase().replace(/\s/g, "").slice(0, 60);
    }

    if (name === "username") {
      formattedValue = value.toLowerCase().replace(/\s/g, "").slice(0, 20);
    }

    if (name === "displayName") {
      formattedValue = value.slice(0, 30);
    }

    if (name === "password") {
      formattedValue = value.slice(0, 50);
    }

    setSignupDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // ---------- Clear error for this field ----------
    setIsFormError((prev) => ({
      ...prev,
      [name]: { value: false, errorText: "" },
    }));
  };

  const isValidAge = (dob: Date, minAge = 7) => {
    if (!(dob instanceof Date) || isNaN(dob.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age >= minAge;
  };

  const handleDobChange = (date: Date) => {
    setSignupDetails((prev) => ({
      ...prev,
      dob: date,
    }));

    // Only clear error if DOB is actually valid
    if (isValidAge(date)) {
      setIsFormError((prev) => ({
        ...prev,
        dob: { value: false, errorText: "" },
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const readyToSubmit = validateForm();
    if (!readyToSubmit) return;

    const signupRes = await handleSignup(signupDetails);

    // Global / server error (not tied to an input)
    if (signupRes.isError && !signupRes.errorOnInput && signupRes.errorText) {
      toast.error(signupRes.errorText);
      return;
    }

    // Field-specific error
    if (
      signupRes.isError &&
      typeof signupRes.errorOnInput === "string" &&
      signupRes.errorText
    ) {
      setIsFormError((prev) => ({
        ...prev,
        [signupRes.errorOnInput as string]: {
          value: true,
          errorText: signupRes.errorText,
        },
      }));
      return;
    }

    // Success
    if (signupRes.authUser) {
      await handleCheckAuth();
    }
  };

  const debouncedCheckUsername = useCallback(
    debounce(async (value: string) => {
      if (value.length < 4) return;

      const response = await handleCheckUsername(value);

      if (response.isError) {
        if (response.errorOnInput) {
          setIsFormError((prev) => ({
            ...prev,
            username: {
              value: response.isError,
              errorText: response.message,
            },
          }));
          setUsernameQueryKeyInfo((prev) => ({
            ...prev,
            message: response.message,
            isError: response.isError,
          }));
        }
      } else {
        setSignupDetails((prev) => ({
          ...prev,
          username:
            response?.usernameQueryKey.toLowerCase() ||
            usernameQueryKey.toLocaleLowerCase(),
        }));
        setUsernameQueryKeyInfo((prev) => ({
          ...prev,
          message: response.message,
          isError: response.isError,
        }));
      }
    }, 500),
    [],
  );

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value.length && value.length > 19) return;

    const formattedValue = value.toLowerCase().replace(/\s/g, "");
    setUsernameQueryKey(formattedValue);
    setUsernameQueryKeyInfo({ message: "", isError: false });
    setIsFormError((prev) => ({
      ...prev,
      username: {
        value: false,
        errorText: "",
      },
    }));
    setSignupDetails((prev) => ({ ...prev, username: "" }));
    debouncedCheckUsername(value);
  };

  const formTBase = "signup.form";
  const formHeaderText = translate(`${formTBase}.headerText`);

  const emailLabel = translate(`${formTBase}.fields.email`);
  const displayNameLabel = translate(`${formTBase}.fields.displayName`);
  const usernameLabel = translate(`${formTBase}.fields.username`);
  const passwordLabel = translate(`${formTBase}.fields.password`);
  const dobLabel = translate(`${formTBase}.fields.dob.headerText`);
  const buttonText = translate(`${formTBase}.buttonText`);
  const haveAccountTextQ = translate(`${formTBase}.haveAccountText.question`);
  const haveAccountTextInstruction = translate(
    `${formTBase}.haveAccountText.instruction`,
  );

  const width = {
    base: "90%",
    sm: "80%",
    md: "60%",
    lg: "60%",
    xl: "60%",
  };

  return (
    <Flex
      align="center"
      justify="center"
      direction="column"
      minH="100dvh"
      userSelect="none"
      py={{ base: "40px", lg: "40px" }}
      gap="4"
      overflowY="auto"
    >
      <AuthLogo />
      <Heading textAlign="center">{formHeaderText}</Heading>

      <chakra.form
        onSubmit={handleSubmit}
        w={width}
        display="flex"
        flexDir="column"
        gap="2.5"
      >
        {/* Display Name */}

        <Field.Root invalid={isFormError.displayName?.value || false}>
          <Field.Label>{displayNameLabel}</Field.Label>
          <Input
            variant="outline"
            name="displayName"
            value={signupDetails.displayName}
            onChange={handleChange}
            pl="1"
          />
          <Field.ErrorText>
            {isFormError.displayName?.errorText || ""}
          </Field.ErrorText>
        </Field.Root>

        {/* Email */}
        <Field.Root invalid={isFormError.email?.value || false}>
          <Field.Label>{emailLabel}</Field.Label>
          <Input
            name="email"
            type="email"
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            value={signupDetails.email}
            onChange={handleChange}
            pl="1"
          />
          <Field.ErrorText>
            {isFormError.email?.errorText || ""}
          </Field.ErrorText>
        </Field.Root>

        {/* Username */}
        <Field.Root invalid={isFormError.username?.value || false}>
          <Field.Label>{usernameLabel}</Field.Label>
          <Input
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            maxLength={20}
            onChange={handleUsernameChange}
            name="username"
            value={usernameQueryKey}
            pl="1"
          />

          {!isFormError.username?.value &&
            usernameQueryInfo.message &&
            !usernameQueryInfo.isError && (
              <Text
                fontSize="12px"
                color={{
                  _dark: "green.400",
                  _light: "green.600",
                }}
              >
                {usernameQueryInfo.message}
              </Text>
            )}

          <Field.ErrorText>
            {isFormError.username?.errorText || ""}
          </Field.ErrorText>
        </Field.Root>

        {/* Password */}
        <Field.Root invalid={isFormError.password?.value || false}>
          <Field.Label>{passwordLabel}</Field.Label>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            value={signupDetails.password}
            onChange={handleChange}
            pl="1"
          />
          <Field.ErrorText>
            {isFormError.password?.errorText || ""}
          </Field.ErrorText>
        </Field.Root>

        {/* DOB */}
        <Field.Root invalid={isFormError.dob?.value || false} gap="10px">
          <Field.Label>{dobLabel}</Field.Label>
          <DOBInput lang={i18n.language} onChange={handleDobChange} />
          <Field.ErrorText>{isFormError.dob?.errorText || ""}</Field.ErrorText>
        </Field.Root>

        <Button type="submit">
          {isSigningUp ? (
            <BeatLoader color={loaderColor} size={8} loading />
          ) : (
            buttonText
          )}
        </Button>
      </chakra.form>

      <Text>
        {haveAccountTextQ}{" "}
        <Link style={{ fontWeight: "bold" }} to={".."}>
          {haveAccountTextInstruction}
        </Link>{" "}
      </Text>
    </Flex>
  );
};

export default SignUpContainer;

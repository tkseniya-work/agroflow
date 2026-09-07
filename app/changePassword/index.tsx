import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Button, Input } from "@ui-kitten/components";
import { Text } from "../../shared/ui";
import { router } from "expo-router";
import { useAuth } from "../../entities/auth/lib/useAuth";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import Colors from "../../shared/styles/Colors";
import EvaIcons from "../../src/types/eva-icon-enum";
import { useEmployeeInfo } from "../../features/localData/useLocalData";
import { useUserActions } from "../../entities/user";
import { useAlerts } from "../../shared/lib/useAlerts";

interface PasswordState {
  value: string;
  isFocused: boolean;
  isEmpty: boolean;
  showMessage: boolean;
}

const ChangePasswordScreen = () => {
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [oldPassword, setOldPassword] = useState<PasswordState>({
    value: "",
    isFocused: false,
    isEmpty: false,
    showMessage: false,
  });

  const [newPassword, setNewPassword] = useState<PasswordState>({
    value: "",
    isFocused: false,
    isEmpty: false,
    showMessage: false,
  });

  const [confirmPassword, setConfirmPassword] = useState<PasswordState>({
    value: "",
    isFocused: false,
    isEmpty: false,
    showMessage: false,
  });

  const { getValidAccessToken } = useAuth();
  const employeeInfo = useEmployeeInfo();
  const { changePassword, resetPassword } = useUserActions();
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const { showError } = useAlerts();

  const onClose = useCallback(() => {
    router.dismiss();
  }, []);

  const handlePasswordVisibility = useCallback(() => {
    setPasswordVisibility((prev) => !prev);
  }, []);

  const handlePasswordChange = useCallback(
    (text: string, field: "old" | "new" | "confirm") => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      switch (field) {
        case "old":
          setOldPassword((prev) => ({
            ...prev,
            value: text,
            isEmpty: false,
          }));
          break;

        case "new":
          const isValidNew = passwordRegex.test(text);
          setNewPassword((prev) => ({
            ...prev,
            value: text,
            isEmpty: false,
            showMessage: !isValidNew,
          }));
          break;

        case "confirm":
          const isValidConfirm = passwordRegex.test(text);
          setConfirmPassword((prev) => ({
            ...prev,
            value: text,
            isEmpty: false,
            showMessage: !isValidConfirm,
          }));
          break;
      }
    },
    []
  );

  const handleFocus = useCallback((field: "old" | "new" | "confirm") => {
    switch (field) {
      case "old":
        setOldPassword((prev) => ({ ...prev, isFocused: true }));
        break;
      case "new":
        setNewPassword((prev) => ({ ...prev, isFocused: true }));
        break;
      case "confirm":
        setConfirmPassword((prev) => ({ ...prev, isFocused: true }));
        break;
    }
  }, []);

  const handleBlur = useCallback((field: "old" | "new" | "confirm") => {
    switch (field) {
      case "old":
        setOldPassword((prev) => ({ ...prev, isFocused: false }));
        break;
      case "new":
        setNewPassword((prev) => ({ ...prev, isFocused: false }));
        break;
      case "confirm":
        setConfirmPassword((prev) => ({ ...prev, isFocused: false }));
        break;
    }
  }, []);

  useEffect(() => {
    if (passwordMessage.length > 0) {
      Alert.alert("Сообщение", passwordMessage, [{ text: "OK" }], {
        cancelable: false,
      });

      setPasswordMessage("");

      if (passwordMessage === "Пароль изменен!") {
        router.dismiss();
      }
    }
  }, [passwordMessage]);

  const onChangePassword = useCallback(async () => {
    if (isSubmittingRef.current) return;

    // Валидация
    const isEmptyOld = !oldPassword.value;
    const isEmptyNew = !newPassword.value;
    const isEmptyConfirm = !confirmPassword.value;

    setOldPassword((prev) => ({ ...prev, isEmpty: isEmptyOld }));
    setNewPassword((prev) => ({ ...prev, isEmpty: isEmptyNew }));
    setConfirmPassword((prev) => ({ ...prev, isEmpty: isEmptyConfirm }));

    if (isEmptyOld || isEmptyNew || isEmptyConfirm) return;

    if (newPassword.showMessage || confirmPassword.showMessage) {
      showError("Новый пароль не соответствует требованиям");
      return;
    }

    if (newPassword.value !== confirmPassword.value) {
      showError("Новые пароли не совпадают");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const accessToken = await getValidAccessToken();
      const message = await changePassword({
        accessToken: accessToken,
        userName: employeeInfo.employees.email,
        userId: employeeInfo.employees.user_id,
        oldPassword: oldPassword.value,
        password: newPassword.value,
        confirmPassword: confirmPassword.value,
      });
      setPasswordMessage(message);
    } catch {
      showError("Не удалось изменить пароль. Попробуйте еще раз");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    oldPassword.value,
    newPassword.value,
    newPassword.showMessage,
    confirmPassword.value,
    confirmPassword.showMessage,
    employeeInfo,
    changePassword,
    getValidAccessToken,
    showError,
  ]);

  const handleAutoResetPassword = useCallback(async () => {
    try {
      await resetPassword({
        email: employeeInfo.employees.email,
      });

      Alert.alert(
        "Запрос отправлен",
        "Инструкции по сбросу пароля отправлены на вашу почту",
        [{ text: "OK" }]
      );
    } catch {
      showError("Не удалось отправить запрос на сброс пароля");
    }
  }, [employeeInfo, resetPassword, showError]);

  const PasswordField = useCallback(
    ({
      label,
      state,
      field,
    }: {
      label: string;
      state: PasswordState;
      field: "old" | "new" | "confirm";
    }) => (
      <View style={styles.inputContainer}>
        <Text style={styles.textContainer}>{label}</Text>
        <View>
          <Input
            value={state.value}
            onFocus={() => handleFocus(field)}
            onBlur={() => handleBlur(field)}
            style={[
              styles.input,
              state.isEmpty && styles.inputEmpty,
              state.isFocused && styles.inputFocused,
            ]}
            onChangeText={(text) => handlePasswordChange(text, field)}
            secureTextEntry={passwordVisibility}
            placeholderTextColor="gray"
          />
          <Pressable
            onPress={handlePasswordVisibility}
            style={styles.iconContainer}
          >
            <Ionicons
              name={passwordVisibility ? EvaIcons.Eye : EvaIcons.EyeOff}
              size={24}
              color="gray"
            />
          </Pressable>
        </View>
        {state.showMessage && (
          <View>
            <Text style={styles.passwordTextContainer} marginTop={55}>
              Пароль должен содержать минимум 8 символов, одну заглавную букву,
              одну строчную и одну цифру
            </Text>
          </View>
        )}
      </View>
    ),
    [
      styles,
      passwordVisibility,
      handlePasswordVisibility,
      handleFocus,
      handleBlur,
      handlePasswordChange,
    ]
  );

  return (
    <View style={styles.modalContent}>
      {/* Заголовок показываем только на iOS */}
      {Platform.OS === "ios" && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Сменить пароль</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <MaterialIcons name="close" size={24} color={Colors.black} />
          </Pressable>
        </View>
      )}

      <View
        style={[
          styles.content,
          Platform.OS === "android" && styles.contentAndroid,
        ]}
      >
        <PasswordField label="Старый пароль" state={oldPassword} field="old" />

        <PasswordField label="Новый пароль" state={newPassword} field="new" />

        <PasswordField
          label="Повторите новый пароль"
          state={confirmPassword}
          field="confirm"
        />

        <Button
          style={styles.button}
          onPress={onChangePassword}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Изменяем…" : "Изменить"}
        </Button>

        <View style={styles.resetContainer}>
          <Text style={styles.resetText}>Забыли пароль? </Text>
          <Pressable onPress={handleAutoResetPassword}>
            <Text style={styles.resetLink}>Сбросить</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  titleContainer: {
    height: 60,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  contentAndroid: {
    paddingTop: 24,
  },
  inputContainer: {
    minHeight: 80,
    marginBottom: 16,
  },
  input: {
    height: 50,
    color: Colors.greenColor,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: Colors.greenColor,
    borderWidth: 2,
  },
  inputEmpty: {
    borderColor: Colors.error,
  },
  iconContainer: {
    position: "absolute",
    right: 0,
    padding: 15,
  },
  textContainer: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordTextContainer: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  resetContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  resetText: {
    color: Colors.grey600,
    fontSize: 14,
  },
  resetLink: {
    color: Colors.greenColor,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default ChangePasswordScreen;

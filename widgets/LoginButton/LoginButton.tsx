import { Button } from "@ui-kitten/components";
import React from "react";
import { StyleSheet } from "react-native";
import Colors from "styles/Colors";

interface LoginButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  text?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  onPress,
  disabled = false,
  isLoading = false,
  text = "Авторизация"
}) => {
  const buttonText = isLoading ? "Подождите..." : text;

  return (
    <Button
      onPress={onPress}
      style={styles.button}
      disabled={disabled}
    >
      {buttonText}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
});

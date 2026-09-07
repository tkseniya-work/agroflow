import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { TouchableOpacity } from "react-native";

import Colors from "../../../shared/styles/Colors";
import { styles } from "../styles";

type Props = {
  onPress: () => void;
};

const CreateTaskButtonComponent = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.fabButton}
      onPress={onPress}
    >
      <Ionicons name="add" size={30} color={Colors.white} />
    </TouchableOpacity>
  );
};

export const CreateTaskButton = memo(CreateTaskButtonComponent);

import { StyleSheet } from "react-native";

import Colors from "../../../shared/styles/Colors";

export const productionTaskFormModalStyles = StyleSheet.create({
  validationBox: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDCA",
    backgroundColor: "#FEF3F2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: "center",
  },
  validationText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.error,
  },
});

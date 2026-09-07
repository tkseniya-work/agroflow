/* global jest */

jest.mock("@ui-kitten/components", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return {
    Modal: ({ children, visible }) =>
      visible ? React.createElement(View, null, children) : null,
    Text,
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  MaterialCommunityIcons: () => null,
}));

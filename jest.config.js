module.exports = {
  preset: "jest-expo",
  watchman: false,
  testMatch: ["<rootDir>/tests/**/*.ui.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@ui-kitten/.*|@eva-design/.*|react-native-svg)",
  ],
};

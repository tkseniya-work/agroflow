import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import Colors from "../../shared/styles/Colors";

export default function ChangePasswordLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors.white,
        },
        ...(Platform.OS === "android" && {
          headerShown: true,
          headerTitle: "Сменить пароль",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: Colors.white,
            elevation: 4,
          },
          headerTitleStyle: {
            color: Colors.black,
            fontSize: 20,
            fontWeight: "600",
          },
          headerTintColor: Colors.black,
          headerShadowVisible: true,
        }),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          ...(Platform.OS === "android" && {
            headerShown: true,
            headerTitle: "Сменить пароль",
            headerBackVisible: false,
          }),
          ...(Platform.OS === "ios" && {
            presentation: "modal",
            headerShown: false,
          }),
        }}
      />
    </Stack>
  );
}
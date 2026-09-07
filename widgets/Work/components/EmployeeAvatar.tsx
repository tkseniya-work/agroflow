import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import Colors from "../../../shared/styles/Colors";

const getEmployeeEntity = (employee: any) =>
  employee?.employees ?? employee?.employee ?? employee;

export const getEmployeeAvatarUrl = (employee: any) => {
  const entity = getEmployeeEntity(employee);

  return (
    entity?.image_url ??
    entity?.imageUrl ??
    entity?.avatar_url ??
    entity?.avatarUrl ??
    employee?.image_url ??
    employee?.imageUrl ??
    employee?.avatar_url ??
    employee?.avatarUrl ??
    null
  );
};

type Props = {
  employee: any;
  style?: StyleProp<ViewStyle>;
};

function EmployeeAvatarComponent({ employee, style }: Props) {
  const imageUrl = useMemo(() => getEmployeeAvatarUrl(employee), [employee]);
  const imageSource = useMemo(
    () => (imageUrl ? { uri: imageUrl } : null),
    [imageUrl]
  );
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  const handleImageError = useCallback(() => {
    setHasImageError(true);
  }, []);

  return (
    <View style={[styles.container, style]}>
      {imageSource && !hasImageError ? (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <Ionicons
          name="person-outline"
          size={17}
          color={Colors.greenColor}
        />
      )}
    </View>
  );
}

export const EmployeeAvatar = memo(EmployeeAvatarComponent);

const styles = StyleSheet.create({
  container: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

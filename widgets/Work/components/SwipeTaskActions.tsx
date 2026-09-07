import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import Colors from "../../../shared/styles/Colors";
import { ProductionTask } from "../../../entities/productionTask";
import { styles } from "../styles";

type Props = {
  item: ProductionTask;
  children: React.ReactNode;
  onEdit: (item: ProductionTask) => void;
  onDelete: (item: ProductionTask) => void;
};

const SwipeTaskActionsComponent = ({
  item,
  children,
  onEdit,
  onDelete,
}: Props) => {
  const swipeableRef = useRef<Swipeable | null>(null);

  const handleEdit = useCallback(() => {
    swipeableRef.current?.close();
    onEdit(item);
  }, [item, onEdit]);

  const handleDelete = useCallback(() => {
    swipeableRef.current?.close();
    onDelete(item);
  }, [item, onDelete]);

  const renderRightActions = useCallback(
    () => (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.swipeCircleButton, styles.swipeCircleEdit]}
          onPress={handleEdit}
        >
          <Ionicons name="pencil" size={19} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.swipeCircleButton, styles.swipeCircleDelete]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={19} color={Colors.white} />
        </TouchableOpacity>
      </View>
    ),
    [handleDelete, handleEdit],
  );

  return (
    <Swipeable
      ref={swipeableRef}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
};

export const SwipeTaskActions = memo(SwipeTaskActionsComponent);

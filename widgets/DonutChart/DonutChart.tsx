import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import HourglassIcon from "../../assets/images/hourglass";

const DonutChart = ({ data, size }: { data: any[]; size: number }) => {
  const center = size / 2;
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;

  const validData = data.filter((item) => item.value > 0);
  const total = validData.reduce((sum, item) => sum + item.value, 0);

  if (validData.length === 0) {
    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={16}
          />
        </Svg>
        
        <View style={[styles.noDataContainer, { width: size, height: size }]}>
          <Text style={styles.noDataText}>Нет данных</Text>
        </View>
      </View>
    );
  }

  let segments = [];
  let currentOffset = 0;

  for (let i = 0; i < validData.length; i++) {
    const segmentLength = (validData[i].value / total) * circumference;
    segments.push({
      ...validData[i],
      length: segmentLength,
      offset: currentOffset,
      percentage: ((validData[i].value / total) * 100).toFixed(1),
      valueString: validData[i].valueString,
    });
    currentOffset += segmentLength;
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={16}
        />

        <G rotation="-90" origin={`${center}, ${center}`}>
          {segments.map((segment, index) => (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={16}
              strokeDasharray={`${segment.length} ${circumference}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
            />
          ))}
        </G>
      </Svg>

      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <HourglassIcon
          width={32}
          height={32}
          color="#0F7F5E"
          strokeWidth={1.8}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  noDataContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(DonutChart);

export const BaseColors = {
  primary: "#2196F3",
  secondary: "#FF9800",
  success: "#0b9444",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",

  grey50: "#FAFAFA",
  grey100: "#F5F5F5",
  grey200: "#EEEEEE",
  grey300: "#E0E0E0",
  grey400: "#BDBDBD",
  grey500: "#9E9E9E",
  grey600: "#757575",
  grey700: "#616161",
  grey800: "#424242",
  grey900: "#212121",

  white: "#FFFFFF",
  black: "#000000",

  transparent: "transparent",
} as const;

export const ComponentColors = {
  chart: {
    totalTime: "#0b9444",
    smallStops: "#FFAB00",
    longStops: "#ff0000",
    planned: "#2196F3",
    actual: "#0b9444",
  },

  icon: {
    default: "#CCCCCC",
    primary: "#2196F3",
    success: "#0b9444",
    warning: "#FF9800",
    error: "#F93913",
    info: "#2196F3",
    award: "#9C27B0",
  },

  shift: {
    day: {
      background: "rgba(255, 183, 77, 0.1)",
      icon: "#FF9800",
    },
    night: {
      background: "rgba(66, 165, 245, 0.1)",
      icon: "#2196F3",
    },
  },

  status: {
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    grey: "#9E9E9E",
  },

  weather: {
    text: "#198F4A",
  },

  pagination: {
    dot: "#0F8E45",
    activeDot: "#0ED063",
    date: "#0ED063",
  },

  activeStatusColors: {
    color1: "#feda75",
    color2: "#fa7e1e",
    color3: "#d62976",
    color4: "#962fbf",
    color5: "#4f5bd5",
  },
} as const;

export const AppColors = {
  greenColor: "#0b9444",
  greenColor2: "#00A76F",
  greenColorLight: "#e8f5e9",
  blue: "#2196F3",
  darkGrayText: "#757575",

  bonus: {
    overtime: "#FF9800",
    experience: "#9C27B0",
  },

  technical: {
    speed: "#0b9444",
    depth: "#FFAB00",
    liquid: "#2196F3",
  },
} as const;

export default {
  ...BaseColors,
  ...ComponentColors,
  ...AppColors,
};

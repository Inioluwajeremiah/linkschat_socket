import { View, ActivityIndicator } from "react-native";

const LoadingSpinner = ({ color, size }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={color} size={size} />
    </View>
  );
};

export default LoadingSpinner;

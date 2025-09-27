import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import Header from "../Components/Header";

const Profiles = () => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      <Header />
      <Text>Profiles Screen</Text>
    </SafeAreaView>
  );
};

export default Profiles;

const styles = StyleSheet.create({});

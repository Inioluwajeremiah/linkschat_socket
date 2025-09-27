// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { withdraw } from "../Store/walletSlice";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import { addGift } from "../Store/GiftsSlice";
// import profile from "../assets/profile.png";
// import love from "./love.png";
// import fire from "./fire.png";
// import horse from "./horse.png";
// import smiles from "./smiles.png";
// import aeroplane from "./aeroplane.png";
// import diamond from "./diamond.png";
// import car from "./car.png";
// import bicycle from "./bicycle.jpg";

// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   TextInput,
// } from "react-native";
// import { useSelector } from "react-redux";
// import { useNavigation } from "@react-navigation/native";
// import Toast from "react-native-toast-message";

// const GiftModal = ({ visible, setVisible, setAmount, selected, toast }) => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);
//   const [value, setValue] = useState(0);
//   const [data, setData] = useState({});
//   const [error, setError] = useState(false);
//   const [picked, setPicked] = useState(null);
//   const [select, setSelect] = useState(null);
//   const amount = useSelector((state) => state.amount.amount);

//   const handlePicked = (id) => {
//     setPicked(id);
//   };
//   const Withdraw = () => {
//     if (value > amount) {
//       setError(true);
//       Toast.show({
//         type: "error",
//         text1: "Error!",
//         text2: `Insufficient Balance`,
//       });
//       // setVisible(false)
//       return;
//       setValue(0);
//       toast();
//     }
//     dispatch(withdraw(value));
//     dispatch(
//       addGift({
//         id: Date.now(),
//         time: new Date().toLocaleTimeString(),
//         date: new Date().toLocaleDateString(),
//         amount: Number(value),
//         sender: selected?.sender,
//         image: profile,
//       })
//     );
//     Toast.show({
//       type: "success",
//       text1: "Gift!",
//       text2: `you gifted ${selected?.sender}, ${value} coins Successfully.`,
//     });
//     setTimeout(() => {
//       setVisible(false);
//     }, 1000);
//   };

//   const gifts = [
//     { id: 1, image: love, name: "love", coins: 1000 },
//     { id: 2, image: car, name: "car", coins: 200 },
//     { id: 3, image: aeroplane, name: "aeroplane", coins: 100 },
//     { id: 4, image: fire, name: "fire", coins: 80 },
//     { id: 5, image: horse, name: "horse", coins: 60 },
//     { id: 6, image: diamond, name: "diamond", coins: 500 },
//     { id: 7, image: smiles, name: "smiles", coins: 20 },
//     { id: 8, image: bicycle, name: "bicycle", coins: 10 },
//   ];

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={setVisible}
//     >
//       <Toast />
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <TouchableOpacity
//             style={{
//               position: "absolute",
//               top: -15,
//               left: 20,
//             }}
//             onPress={() => setVisible(false)}
//           >
//             <AntDesign name="closecircle" size={34} color="#5bbbdf" />
//           </TouchableOpacity>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               marginHorizontal: 20,
//               alignItems: "center",
//               gap: 10,
//               marginVertical: 10,
//             }}
//           >
//             {gifts.slice(4, 8).map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => {
//                   handlePicked(item.id);
//                   setValue(item.coins);
//                 }}
//                 style={{
//                   width: 75,
//                   height: 65,
//                   borderWidth: item.id == picked ? 2 : 1,
//                   borderColor: item.id == picked ? "dodgerblue" : "#ddd",
//                   borderRadius: 5,
//                   padding: 5,
//                 }}
//               >
//                 <Image
//                   source={item.image}
//                   style={{
//                     width: 30,
//                     height: 30,
//                   }}
//                 />
//                 <Text
//                   style={{
//                     width: 100,
//                     fontWeight: "bold",
//                     fontSize: 12,
//                   }}
//                 >
//                   {item.name}
//                 </Text>
//                 <Text
//                   style={{
//                     fontSize: 10,
//                   }}
//                 >
//                   {item.coins} coins
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               marginHorizontal: 20,
//               alignItems: "center",
//               gap: 10,
//               marginVertical: 10,
//             }}
//           >
//             {gifts.slice(0, 4).map((item) => (
//               <TouchableOpacity
//                 key={item.id}
//                 onPress={() => {
//                   handlePicked(item.id);
//                   setValue(item.coins);
//                 }}
//                 style={{
//                   width: 75,
//                   height: 65,
//                   borderWidth: item.id == picked ? 2 : 1,
//                   borderColor: item.id == picked ? "dodgerblue" : "#ddd",
//                   borderRadius: 5,
//                   padding: 5,
//                 }}
//               >
//                 <Image
//                   source={item.image}
//                   style={{
//                     width: 30,
//                     height: 30,
//                   }}
//                 />
//                 <Text
//                   style={{
//                     width: 100,
//                     fontWeight: "bold",
//                     fontSize: 12,
//                   }}
//                 >
//                   {item.name}
//                 </Text>
//                 <Text
//                   style={{
//                     width: 100,
//                     fontSize: 10,
//                   }}
//                 >
//                   {item.coins} coins
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginHorizontal: 20,
//               borderTopWidth: 0.5,
//               borderTopColor: "#ddd",
//               paddingVertical: 10,
//             }}
//           >
//             <Text
//               style={{
//                 fontWeight: "bold",
//                 color: "gray",
//               }}
//             >
//               Balance: {amount} coins
//             </Text>
//             <TouchableOpacity
//               disabled={value == 0 ? true : false}
//               style={[
//                 styles.signout,
//                 { backgroundColor: value == 0 ? "gray" : "#5bbbdf" },
//               ]}
//               onPress={() => {
//                 Withdraw();
//               }}
//             >
//               <Text style={styles.signoutText}>send</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // Add this new style to the StyleSheet
// const styles = StyleSheet.create({
//   picked: {
//     width: 100,
//   },
//   signoutText: {
//     fontFamily: "Montserrat-Bold",
//     color: "white",
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     zIndex: -2,
//   },
//   cancelText: {
//     fontFamily: "Montserrat-Bold",
//     fontWeight: "bold",
//     color: "gray",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 10,
//     height: 230,
//     width: 380,
//     marginHorizontal: 40,
//     alignSelf: "center",
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     position: "relative",
//   },
//   outText: {
//     fontFamily: "regular",
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 20,
//     marginVertical: 10,
//   },
//   signout: {
//     width: 100,
//     paddingVertical: 5,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   out: {
//     fontFamily: "Montserrat-Regular",
//     textAlign: "center",
//     color: "gray",
//     fontSize: 14,
//     marginVertical: 15,
//   },
//   modalHeader: {
//     marginTop: 20,
//     flexDirection: "row",
//     alignItems: "flex-start",
//     position: "relative",
//   },
//   cancel: {
//     paddingHorizontal: 100,
//     paddingVertical: 20,
//     backgroundColor: "white",
//     borderRadius: 10,
//     marginBottom: 10,
//     borderWidth: 0.5,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 4,
//   },
//   closeButtonContainer: {
//     position: "absolute",
//     left: 0,
//     zIndex: 1,
//   },
//   closeButton: {
//     fontSize: 24,
//   },
//   headerTextContainer: {
//     flex: 1,
//     alignItems: "center",
//     paddingHorizontal: 40,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#02275A",
//     fontFamily: "Montserrat-Bold",
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: "#737373",
//     fontWeight: "400",
//     fontFamily: "Montserrat-Regular",
//   },
//   modalScrollView: {
//     marginTop: 20,
//     padding: 16,
//   },
//   walletOption: {
//     backgroundColor: "#F5F7FF",
//     padding: 16,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   walletOptionContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   //   flagContainer: {
//   //     fontSize: 24,
//   //   },
//   flag: {
//     fontSize: 24,
//   },
//   walletDetails: {
//     flexDirection: "column",
//     gap: 4,
//   },
//   walletName: {
//     fontSize: 12,
//     fontWeight: "600",
//     fontFamily: "Montserrat-Bold",
//   },
//   walletCode: {
//     fontSize: 16,
//     color: "#02275A",
//     fontWeight: "600",
//     fontFamily: "Montserrat-Regular",
//   },
//   addWalletButton: {
//     borderWidth: 1,
//     borderColor: "#1D42FF",
//     borderRadius: 0,
//     padding: 16,

//     marginTop: 10,
//   },
//   addWalletText: {
//     color: "#02275A",
//     fontSize: 16,
//     fontWeight: "600",
//     fontFamily: "Montserrat-Regular",
//   },
//   closeIcon: {
//     width: 28,
//     height: 28,
//     resizeMode: "contain",
//   },
//   addWalletContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   plusIcon: {
//     width: 24,
//     height: 24,
//     resizeMode: "contain",
//   },
//   walletOptionActive: {
//     borderColor: "#1D42FF",
//     borderWidth: 1,
//   },
// });

// export default GiftModal;

import { View, Text } from "react-native";
import React from "react";

const GiftModal = () => {
  return (
    <View>
      <Text>GiftModal</Text>
    </View>
  );
};

export default GiftModal;

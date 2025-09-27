import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

import { useNavigation } from "@react-navigation/native";


const LogoutModal = ({
  visible,
  setVisible,
}) => {
  const navigation=useNavigation()
  const [ loading, setLoading] = useState(false)

 

  const handleLogout = ()=> {
    navigation.navigate("Login")
    setVisible(false)
  }
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={setVisible}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <Text style={styles.outText}>Sign Out</Text>
               <Text style={styles.out}>Do you want to sign out ?</Text> 
          <View style={{
            alignSelf:"center"
          }}>
            <TouchableOpacity style={styles.signout} onPress={handleLogout} >
                <Text style={styles.signoutText}>Yes, Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel}
            onPress={setVisible}
            >
                <Text style={styles.cancelText}>No, Cancel</Text>
            </TouchableOpacity>   
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Add this new style to the StyleSheet
const styles = StyleSheet.create({
    signoutText:{
        fontFamily: 'Montserrat-Bold',
        color:"white",
        fontWeight:"bold"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    
  },
  cancelText:{
    fontFamily: 'Montserrat-Bold',
    fontWeight:"bold",
    color:"gray"
    },
  modalContent: {
    backgroundColor: "white", 
    padding: 10,
    height: 260,
    width:360,
    marginHorizontal:40,
    alignSelf:"center",
    borderRadius:20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3, 

  },
   outText:{
    fontFamily: 'Montserrat-Bold',
    textAlign:"center",
    fontWeight:"bold",
    fontSize:22,
    marginVertical:5
},
  signout:{
    paddingHorizontal:100,
    paddingVertical:20,
    backgroundColor:'red',
    borderRadius:10,
    marginBottom:10,
    justifyContent:'center',
    alignItems:'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2, 

},
out:{
    fontFamily: 'Montserrat-Regular',
    textAlign:"center",
    color:"gray",
    fontSize:14,
    marginVertical:15,
    
},
  modalHeader: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  cancel:{
    paddingHorizontal:100,
    paddingVertical:20,
    backgroundColor:'white',
    borderRadius:10,
    marginBottom:10,
    borderWidth:0.5,
    justifyContent:'center',
    alignItems:'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation:4,
},
  closeButtonContainer: {
    position: "absolute",
    left: 0,
    zIndex: 1,
  },
  closeButton: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#02275A",
    fontFamily: "Montserrat-Bold",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#737373",
    fontWeight: "400",
    fontFamily: "Montserrat-Regular",
  },
  modalScrollView: {
    marginTop: 20,
    padding: 16,
  },
  walletOption: {
    backgroundColor: "#F5F7FF",
    padding: 16,
    borderRadius: 5,
    marginBottom: 10,
   
  },
  walletOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  //   flagContainer: {
  //     fontSize: 24,
  //   },
  flag: {
    fontSize: 24,
  },
  walletDetails: {
    flexDirection: "column",
    gap: 4,
  },
  walletName: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Montserrat-Bold",
  },
  walletCode: {
    fontSize: 16,
    color: "#02275A",
    fontWeight: "600",
    fontFamily: "Montserrat-Regular",
  },
  addWalletButton: {
    borderWidth: 1,
    borderColor: "#1D42FF",
    borderRadius: 0,
    padding: 16,

    marginTop: 10,
  },
  addWalletText: {
    color: "#02275A",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat-Regular",
  },
  closeIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  addWalletContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  plusIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  walletOptionActive: {
    borderColor: '#1D42FF',
    borderWidth: 1,
  },
});

export default LogoutModal;

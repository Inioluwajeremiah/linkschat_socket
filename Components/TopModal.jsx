import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';


import { useNavigation } from "@react-navigation/native";
import {useDispatch } from 'react-redux';


const TopModal = ({
  visible,
  setVisible,
  setAmount,
  amount,
  toast
}) => {

  const navigation=useNavigation()
  const [ loading, setLoading] = useState(false)
  const [value, setValue] = useState(0)
  const [coins,setCoins]=useState(10)
  const dispatch=useDispatch()

 

  const handleLogout = ()=> {
    navigation.navigate("Login")
}

const TopUp=()=>{
    const a=Number(value) * coins  
    dispatch(setAmount(a))
    setValue(0)
    setVisible(false)
    toast()
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
        <TouchableOpacity style={{
            position:"absolute",
            top:-15,
            left:20
          }}
          onPress={()=>setVisible(false)}
          >
          <AntDesign name="closecircle" size={34} color="#5bbbdf" />
          </TouchableOpacity>
            <Text style={styles.outText}>Top Up Balance</Text>
          <View style={{
              alignSelf:"center"
            }}>
              <TextInput 
                          keyboardType='numeric'
                          placeholderTextColor={'gray'}
                          placeholder='Enter Amount...'
                          style={{
                            width:280,
                            height:50,
                            borderWidth:1,
                            borderColor:"#ccc",
                            borderRadius:5,
                            fontSize:18,
                            paddingLeft:10,
                            
                            marginBottom:10,
                            fontFamily:'regular'
                            // iOS Shadow
                           }}
                           onChangeText={(text) => setValue(text)}
                           
                         
                         />
               
            <TouchableOpacity style={styles.signout} onPress={()=>{
    TopUp()
            }} >
                <Text style={styles.signoutText}>Top Up</Text>
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
    height: 190,
    width:360,
    marginHorizontal:40,
    alignSelf:"center",
    borderRadius:20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3, 
    position:"relative"

  },
   outText:{
    fontFamily: 'regular',
    textAlign:"center",
    fontWeight:"bold",
    fontSize:20,
    marginVertical:10
},
  signout:{
    paddingHorizontal:100,
    paddingVertical:10,
    backgroundColor:'#5bbbdf',
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

export default TopModal;

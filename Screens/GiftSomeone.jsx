import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React,{useState,useEffect} from 'react'
import Header from '../Components/Header'
import CallHistory from '../Components/callhistory'
import History from '../Components/History'
import Histories from '../Components/Histories'
import Call from '../Components/Call'
import Search from '../Components/Search'
import People from '../Components/People'
import Cash from '../Components/Cash'
import GiftModal from '../Components/GiftModal'
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';





const GiftSomeone = () => {
  const amount = useSelector(state => state.amount.amount);
  const [show,setShow]=useState(false)
  const [visible,setVisible]=useState(false)
  const [selected,setSelected]=useState(null)
  
    const toast=()=>{
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: `Gift Card Sent Successfully`
      });
    }
    
    
  return (
    <SafeAreaView style={{
      backgroundColor:"white",
      flex:1
    }}>
      <View style={{
        marginTop:20,
        zIndex:1
      }}>

     <Toast/>
      </View>
    
      <Cash/>
      <Text style={{
        fontSize:16,
        fontWeight:"bold",
        marginTop:20,
        marginLeft:20,
        marginBottom:10,
        color:"#243c56",
        fontFamily:"regular"

      }}>Contacts</Text>
      <People  setVisible={setVisible} setSelected={setSelected}/>
      <GiftModal visible={visible} setVisible={setVisible} selected={selected} toast={toast}/>
      
    </SafeAreaView>
  )
}

export default GiftSomeone

const styles = StyleSheet.create({})
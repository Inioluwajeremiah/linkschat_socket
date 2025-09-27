import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React,{useEffect, useState} from 'react'
import Header from './Header'

import Histories from './Histories';
import GiftHistories from './GiftHistories';
import TopModal from './TopModal';
import Search from './Search';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { addAmount } from '../Store/walletSlice';
import Entypo from '@expo/vector-icons/Entypo';
import Toast from 'react-native-toast-message';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';


const BuyGiftCard = () => {
  const [visible,setVisible]=React.useState(false)
  // const [amount,setAmount]=React.useState(1000)
  const [balance,setBalance]=useState(false)
  const [show,setShow]=React.useState(false)
  const navigation=useNavigation()
  const amount = useSelector(state => state.amount.amount);
   const toast=()=>{
    Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: `You account have been topped up!`
        });
   }
  return (
    <SafeAreaView style={{
        backgroundColor:"white",
        flex:1,
       
    }}>
      <View style={{
        marginTop:20,
        zIndex:1
      }}>
        <Toast/>
      </View>
        <View style={{
        position:"relative"
      }}>
      <Header setShow={setShow}/>
      {show ? <Search setShow={setShow}/> :null }
      </View>
        <View style={{
          backgroundColor:"aliceblue",
          borderRadius:20,
          width:300,
          paddingVertical:10,
          alignSelf:"center",
          borderWidth:1,
          borderColor:"gray",
          marginTop:20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation:4
        }}>
          <View style={{
            flexDirection:"row",
            alignSelf:"center",
            gap:10,
            alignItems:"center"
          }}>

        <Text style={{
          fontSize:20,
          fontWeight:"bold",
          marginTop:10,
          
          color:"black",
          fontFamily:"regular",
          alignSelf:"center"       
        }}>wallet</Text>
        <TouchableOpacity onPress={()=>setBalance(!balance)} style={{
          marginTop:12
        }}>
          {balance ? <Entypo name="eye" size={18} color="black" />:<Entypo name="eye-with-line" size={18} color="black" /> }
        </TouchableOpacity>
        </View>
        {balance ?
        <View style={{
          flexDirection:"row",
          alignSelf:"center",
          alignItems:"center"
        }}>

             <FontAwesome6 name="coins" size={20} color="#5bbbdf" />
            
          <Text style={{
            fontSize:16,
            fontWeight:"bold",
            marginTop:5,
          
            color:"black",
            fontFamily:"regular",
            alignSelf:"center",
            marginLeft:5    

          }}>
            
             {amount?.toFixed(2)}</Text>
             
             </View>:<Text
          style={{
            fontSize:24,
            fontWeight:"bold",
            marginTop:5,
          
            color:"black",
            alignSelf:"center"       

          }}
          >****</Text>}
        </View>

        <View style={{
          alignSelf:"center",
          marginHorizontal:20,
          flexDirection:"row",
          gap:10,
          marginTop:10
        }}>
          <TouchableOpacity 
          onPress={()=>{
            
            setVisible(true)}
          }
          
          style={{
            width:100,
             height:40,
    
            backgroundColor:"red",
            borderRadius:5,
            flexDirection:"row",
            gap:10,
            alignItems:"center",
            paddingHorizontal:10,
            shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation:4

          }}>
            <Text style={{
              color:"white",
              fontFamily:"regular"
            }}>Top Up</Text>
             <FontAwesome6 name="coins" size={20} color="white" />
          
          </TouchableOpacity>
          <TouchableOpacity
          disabled={amount==0.0 ? true : false}
            style={{
  width:180,
  height:40,
  backgroundColor: amount==0.0 ? "gray":"#5bbbdf",
  borderRadius:5,
  flexDirection:"row",
  gap:10,
  alignItems:"center",
  justifyContent:"center",
  paddingHorizontal:10,
  shadowColor: '#000',
shadowOffset: { width: 0, height: 5 },
shadowOpacity: 0.2,
shadowRadius: 5,
elevation:4

}}
onPress={()=>navigation.navigate("Gift")}
          
          >
            <Text
            style={{
              color:"white",
              fontFamily:"regular"
            }}
            >Gift Someone</Text>
             <FontAwesome6 name="coins" size={20} color="white" />
                         
          </TouchableOpacity>
        </View>
        <View style={{
          marginTop:20,
         borderBottomColor: 'gray',
         borderBottomWidth: StyleSheet.hairlineWidth,
         width: '100%'
  }} />
    <Text style={{
      marginHorizontal:20,
      marginTop:20,
      fontFamily:"regular"
    }}>Gift History</Text>
    <GiftHistories/>
    <TopModal visible={visible}
     setVisible={setVisible} 
     setAmount={addAmount}
     amount={amount}
     toast={toast}/>
    </SafeAreaView>
  )
}

export default BuyGiftCard

const styles = StyleSheet.create({})
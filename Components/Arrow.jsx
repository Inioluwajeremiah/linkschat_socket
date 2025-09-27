import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
const Arrow = () => {
    const navigation = useNavigation()
  return (
    <TouchableOpacity style={{
        width:60,
        height:60,
        backgroundColor:"#5bbbdf",
        borderRadius:30,
        justifyContent:"center",
        alignItems:"center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Android Shadow
        elevation: 5,
        margin:10,
        marginLeft:0,
        // iOS Shadow
        // justifyContent:"center",
        // alignItems:"center",
        // iOS Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Android Shadow
        elevation: 5,
        position:"absolute",
        zIndex:1000,
        bottom:60,
        right:20
    }}
    onPress={()=>navigation.navigate("Chats")}
    >
      <AntDesign name="arrowright" size={24} color="white" />
    </TouchableOpacity>
  )
}

export default Arrow

const styles = StyleSheet.create({})
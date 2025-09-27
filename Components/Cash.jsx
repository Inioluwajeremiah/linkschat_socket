import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

import Feather from '@expo/vector-icons/Feather';
import { Entypo } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
const Cash = () => {
    const navigation=useNavigation()
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
    onPress={()=>navigation.navigate("Home")}
    >
          {/* <Entypo name="credit" size={24} color="white" /> */}
          <FontAwesome name="home" size={24} color="white" />
      
    </TouchableOpacity>
  )
}

export default Cash

const styles = StyleSheet.create({})
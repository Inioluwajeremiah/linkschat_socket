import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Pin from "react-native-vector-icons/MaterialCommunityIcons"
import Mark from "react-native-vector-icons/Ionicons"
import CheckBox from './checkbox'





const ShowContact = ({item}) => {
    const [checked, setChecked] = useState(false);

  return (
    <TouchableOpacity style={{
        flexDirection:"row",
       
        paddingHorizontal:20,
        paddingVertical:10,
        backgroundColor:"white",
        borderRadius:10,
        borderBottomColor:"gray",
        borderBottomWidth:0.4,
       
       
       
    }}>
        <CheckBox
          onPress={() => setChecked(!checked)} 
          isChecked={checked} 
      
        />
        <View style={{
            flexDirection:"row",
             alignItems:"center",
            borderColor:"#ccc",
            gap:10,
            position:'relative'
        }} >

        <View style={{
            width:70,
            height:70,
            borderWidth:3,
            borderColor:"gray",
            borderRadius:35,
            justifyContent:"center",
            alignItems:"center",
        }}>
          <Image source={item.image} style={{
              width:60,
              height:60,
              borderRadius:30,
              
            //   aspectRatio:1,
            //   resizeMode:"cover"
            }}/>
           
        </View>
          <View style={{
            marginBottom:20
          }}>
            <Text style={{fontSize:16, fontWeight:"bold", color:"black"}}>{item.sender}</Text>
            <View style={{
                flexDirection:"row",
                alignItems:"center",

                gap:5
 
            }}>
           
            <Text style={{fontSize:14, color:"gray",marginTop:10}}>{item.text}</Text>
            </View>
          </View>
            </View>
          
    </TouchableOpacity>
  )
}

export default ShowContact

const styles = StyleSheet.create({})
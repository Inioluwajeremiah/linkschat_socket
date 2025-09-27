
import React from 'react'
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
const GroupHeader = ({setShow}) => {
    const navigation=useNavigation()
  return (
    <View style={{
        flexDirection:"row",
        justifyContent:'space-between',
        backgroundColor:"#5bbbdf",
        height:120,
        marginTop:Platform.OS=="ios"? null: 30
    }}>
      <View style={{
        flexDirection:"row",
        alignItems:"center", 
        gap:10 ,
        // marginRight:20
      }}>
      <TouchableOpacity 
        onPress={()=>navigation.navigate('Chats')}
        style={{
            width:40,
            height:40,
            borderWidth:1,
            borderColor:"#ccc",
            borderRadius:10,
            backgroundColor:"#5bbbdf",
            opacity:0.7,
            justifyContent:"center",
            alignItems:"center",
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
            marginLeft:40
          }}>
        <MaterialIcons name="keyboard-arrow-left" size={34} color="white" />
        </TouchableOpacity>
        <View>
            <Text style={{
              fontWeight:"bold",
              fontSize:18,
              color:"white",
              fontFamily:"regular"
              }}>Select Contact</Text>
            <Text style={{
              fontWeight:"bold",
              fontSize:12,
              color:"white",
              fontFamily:"regular"
              }}>656 Contacts</Text>
        </View>
      </View>
      <View style={{
        flexDirection:"row",
        alignItems:"center",
        gap:10,
        marginRight:14
      }}>
      <TouchableOpacity 
        onPress={()=>setShow(prev=>!prev)}
        style={{
            width:40,
            height:40,
            borderWidth:1,
            borderColor:"#ccc",
            borderRadius:10,
            justifyContent:"center",
            alignItems:"center",
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
            backgroundColor:"#5bbbdf",
            opacity:0.7,
         
          }}>
        <EvilIcons name="search" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
        onPress={()=>navigation.navigate('Login')}
        style={{
            width:40,
            height:40,
            borderWidth:1,
            borderColor:"#ccc",
            borderRadius:10,
            justifyContent:"center",
            alignItems:"center",
            // iOS Shadow
            // justifyContent:"center",
            // alignItems:"center",
                      // iOS Shadow
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            backgroundColor:"#5bbbdf",
            opacity:0.7,
            // Android Shadow
            elevation: 5,
          
          }}>
         <Ionicons name="reload-sharp" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default GroupHeader

const styles = StyleSheet.create({})
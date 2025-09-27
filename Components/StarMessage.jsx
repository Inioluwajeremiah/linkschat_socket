import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';

const StarMessage = ({item}) => {
  return (
    <TouchableOpacity style={{
        backgroundColor:"white",
        marginTop:40,
        alignSelf:"center",
        borderRadius:10,
        marginHorizontal:40,
        width:350,
        height:170,   
        flexDirection:"column",    
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Android Shadow
        elevation: 5,

    }}>
      <View style={{
        borderBottomColor:"gray",
        borderBottomWidth:0.5,
        padding:10,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"

      }}>
        <View style={{
            flexDirection:"row",
            alignItems:"center"
        }}>

        <Image source={item.image} style={{
            width:60,
            height:60,
            borderRadius:30,      
            marginLeft:10
        }}/>
         <View>
         <Text style={{
            fontWeight:"bold",
            fontSize:18,
            marginLeft:10,
            fontFamily:"regular"
         }}>{item.sender}</Text>
         <Text 
         style={{
            fontWeight:"bold",
            color:"gray",
            marginTop:8,
            fontSize:12,
            marginLeft:10,
            fontFamily:'regular' 
         }}
         >You , 10/01/2025</Text>
         </View>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color="#ddd" />

      </View>




      <View style={{
        marginLeft:16,
        padding:10
      }}>
        <View style={{
            borderTopRightRadius:15,
            borderTopLeftRadius:15,
            borderBottomRightRadius:15,
            backgroundColor:"#f1f1f1",
            padding:10,
            height:50,
            width:200,
            marginBottom:6
           
        }}>
            <Text style={{
                fontWeight:"bold",
                fontSize:16,
                color:"black",
                fontFamily:"regular"
            }}
            
            >{item.text}</Text>

        </View>

        <View style={{
            flexDirection:"row",
            alignItems:"center"    
        }}>
        <Octicons name="star-fill" size={14} color="gray" />
        <Text style={{
            marginLeft:10,
            color:"gray",
            fontSize:14,
            fontFamily:"regular"
        }}>{item.time}</Text>
        </View>


      </View>
    </TouchableOpacity>
  )
}

export default StarMessage

const styles = StyleSheet.create({})
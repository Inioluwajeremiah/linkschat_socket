import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Gifts = ({item}) => {
  return (
    <View style={{
        flexDirection:"row",
        marginTop:20,
        justifyContent:"space-around",
        alignItems:"center"
    }}>
      <View style={{
        width:50,
        height:50,
        backgroundColor:"white",
        borderRadius:25,
        justifyContent:"center",
        alignItems:"center",
      }}>
      {/* <FontAwesome name="user" size={24} color="white" /> */}
      <Image source={item?.image} style={{
        width:50,
        height:50,
        borderRadius:25,
        overflow:"hidden"
      }}/>
      </View>
      <View style={{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingHorizontal:10,
        paddingVertical:10,
        backgroundColor:"white",
        borderRadius:10,
        width:280,
        height:60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Android Shadow
        elevation: 5,
      }}>
        <View>
            <Text style={{
              fontWeight:"bold",
              fontSize:16,
              color:"black",
              fontFamily:"regular",
              marginBottom:2
            }}>{item?.sender}</Text>
            <View style={{
                flexDirection:"row",
                alignItems:"center"
                
  
            }}>
             
            
            <Text style={{
              fontWeight:"bold",
              fontSize:12,
              color:"gray",
              fontFamily:"regular"
              }}>{item?.date}</Text>

              <Text style={{
              fontWeight:"bold",
              fontSize:12,
              color:"gray",
              fontFamily:"regular",
              marginLeft:10
              }}>{item?.time}</Text>
            
            </View>
        </View>
        <View style={{
          flexDirection:"row",
          alignItems:"center"
         
        }}>

        <Text style={{
          fontFamily:"regular",
          marginRight:5
        }}>{item?.amount}</Text>
          <FontAwesome6 name="coins" size={20} color="#5bbbdf" />
          </View>

      </View>
    </View>
  )
}

export default Gifts

const styles = StyleSheet.create({})
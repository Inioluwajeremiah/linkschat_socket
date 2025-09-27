import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useSelector } from 'react-redux';

const Someone = ({item,setVisible,setSelected}) => {
  const people = useSelector(state => state.contact.items);


  const Select=(id)=>{
    const selected=people.filter((person)=>person.id===id);
    setSelected(selected[0])
  }
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
      <Image source={item.image} style={{
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
        width:300,
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
              fontFamily:"regular"
            }}>{item.sender}</Text>
          
        </View>
    
           <TouchableOpacity style={{
                  paddingHorizontal:10,
                  paddingVertical:6,
                  backgroundColor:"#5bbbdf",
                  borderRadius:15,
                  // padding:10,
                  justifyContent:"center",
                  alignItems:"center"
                }}
                onPress={()=>{
                  setVisible(true)
                  Select(item.id)}}
                >
                  <Text style={{
                    fontWeight:"bold",
                    fontSize:16,
                    color:"white",
                    textAlign:"center",
                    fontFamily:"regular"
                  }}>Gift</Text>
                </TouchableOpacity>
      </View>
    </View>
  )
}

export default Someone

const styles = StyleSheet.create({})
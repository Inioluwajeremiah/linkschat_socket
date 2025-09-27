import { KeyboardAvoidingView, SafeAreaView,ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

import React, { useState } from 'react'
import GroupHeader from '../Components/GroupHeader';
import Arrow from '../Components/Arrow';
import Contacts from '../Components/Contacts';
import ShowContacts from '../Components/showcontacts';
import { useNavigation } from '@react-navigation/native';
import Search from '../Components/Search';

const NewGroup = () => {
  const [show,setShow]=useState(false)
  
  const navigation=useNavigation()
  return (
    <SafeAreaView style={{
      backgroundColor:"white",
      flex:1
    }}>
      <View style={{
        position:"relative"
      }}>

      <GroupHeader setShow={setShow}/>
     {show ? <Search setShow={setShow}/>:null}
      </View>
      <Contacts/>
      <ShowContacts/>
      <Arrow/>
     
    </SafeAreaView>
  )
}

export default NewGroup

const styles = StyleSheet.create({})
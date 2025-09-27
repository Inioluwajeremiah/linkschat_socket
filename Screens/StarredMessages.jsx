import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Header from '../Components/Header'
import Starred from '../Components/Starred'
import StarMessage from '../Components/StarMessage'
import StarMessages from '../Components/StarMessages'
import Search from '../Components/Search'

const StarredMessages = () => {
  const [show,setShow]=useState(false)
  return (
    <SafeAreaView style={{
      backgroundColor:"white",
      flex:1
    }}>
      <View style={{
        position:"relative"
      }}>
      <Starred setShow={setShow}/>
      {show ? <Search setShow={setShow}/> :null }
      </View>
      <StarMessages/>
  
    </SafeAreaView>
  )
}

export default StarredMessages

const styles = StyleSheet.create({})
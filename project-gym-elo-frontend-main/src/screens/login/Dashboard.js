// Adapted: https://github.com/Bria222/React-Redux-Toolkit-Login-Register/tree/development

import React from 'react'
import Background from '../../components/Background'
import Logo from '../../components/Logo'
import Header from '../../components/Header'
import Paragraph from '../../components/Paragraph'
import Button from '../../components/Button'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchEvent, fetchUser, fetchGroupWorkout, postGroupWorkout, updateGroupWorkout, postGroup } from "../../actions/server.js";
import { useEffect, useState } from "react";


export default function Dashboard({ navigation }) {
  const id = "65e116bf1503d46fd83cb39d"
  const sampleGW = {
    name: "Team Squat",
    groupName: "Zeta Pswole"
  }
  
  postGroupWorkout(sampleGW).then((GW) => {
    console.log("this should be group workout", GW)
    AsyncStorage.getItem('userToken').then((value) => {
      console.log(value)
    })
  })

  // AsyncStorage.getItem('id').then((value) => {
  //   console.log(value)
  //   subscribeToPusher(value, "msg-event")
  // });

  return (
    <Background>
      <Logo />
      <Header>Let’s start</Header>
      <Paragraph>
        Your amazing app starts here. Open you favorite code editor and start
        editing this project.
      </Paragraph>
      <Button
        mode="outlined"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'StartScreen' }],
          })
        }
      >
        Logout
      </Button>
    </Background>
  )
}

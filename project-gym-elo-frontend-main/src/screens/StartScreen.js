// Adapted: https://github.com/Bria222/React-Redux-Toolkit-Login-Register/tree/development

import React, { useEffect, useState } from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";
import { userSignIn } from "../features/auth/authActions.js";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { logout } from "../features/auth/authSlice"
import { useUpdateUserId } from "../PusherContext.js";
import { fetchUser } from "../actions/server";


export default function StartScreen({ route, navigation }) {
  const [dataLoading, setDataLoading] = useState(true);
  const dispatch = useDispatch();
  const updateUserId = useUpdateUserId();


  useEffect(() => {
    AsyncStorage.getItem('exp').then((exp) => {
      console.log(exp)
      if (exp) {
        // If current time is before expiry
        if (Math.round(Date.now() / 1000) < parseInt(exp)) {

          const loadEmailPassword = async () => {
            const userEmail = await AsyncStorage.getItem('email')
            const userPassword = await AsyncStorage.getItem('password')
            const data = {email: userEmail, password: userPassword}
            return data
          };
          
          loadEmailPassword().then((data) => {
            const submitUserInfo = async (id) => {
              const userInfo = await fetchUser(id, dispatch);
              return userInfo;
            };
            // console.log(data)
            // Logic to catch for incorrect password or email
            // Check for incorrect user data
            dispatch(userSignIn(data))
              .then((userData) => {
                if (userData.error) {
                  // Give an alert
                  Alert.alert("Login Error", "Invalid email or password");
                } else {
                  // Otherwise update data as planned and navigate to home
                  // console.log('USER ON LOGIN', userData.payload.user._id)
                  updateUserId(userData.payload.user._id);
                  submitUserInfo(userData.payload.user._id);
                  // console.log(userData.payload.user.firstName, userData.payload.user.lastName)
                  // Send users to the settings page to configure their name if none
                  if (
                    !userData.payload.user.firstName ||
                    !userData.payload.user.lastName
                  ) {
                    navigation.navigate("Settings");
                  } else {
                    navigation.navigate("Main");
                  }
                } // Catch any other errors
              })
              .catch((error) => {
                Alert.alert(
                  "Login Error",
                  "An unexpected error occurred. Please try again."
                );
              });
          })
        }
        else {
          console.log("expired token, logging out")
          dispatch(logout())
          
        }
      }
    })
    // show start screen
    .finally(() => {
      setDataLoading(false)
    })
  })
  if (dataLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }
  return (
    <Background>
      <Logo />
      <Header>Welcome to Flex N Friends</Header>
      <Paragraph>
        Start your fitness journey with the communities around you!
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button>
    </Background>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginBottom: 10,
    color: "#0066ff",
    fontWeight: "700",
  },
})

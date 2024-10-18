import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";

import {
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  Dashboard,
} from "../screens/login";
import HomeScreen from "../screens/HomeScreen.js";
import StartScreen from "../screens/StartScreen.js";
import NewUserScreen from "../screens/login/NewUserScreen.js";

const Stack = createStackNavigator();

export default function LoginNav() {
  return (
    <SafeAreaProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="StartScreen"
          component={StartScreen}
          options={{
            headerShown: false,
            tabBarVisible: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
            tabBarVisible: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{
            headerShown: false,
            tabBarVisible: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
            tabBarVisible: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="ResetPasswordScreen"
          component={ResetPasswordScreen}
          options={{
            headerShown: false,
            tabBarVisible: false,
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="NewUserScreen"
          component={NewUserScreen}
          options={{
            headerShown: false,
            tabBarVisible: false,
          }}
        ></Stack.Screen>
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000001",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});

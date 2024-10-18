import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import ChatNav from "./ChatNav";
import GroupsNav from "./GroupsNav";
import WorkoutsNav from "./WorkoutsNav";
import UserNav from "./UserNav";
import HomeNav from "./HomeNav";
import LoginNav from "./LoginNav";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

const Tab = createBottomTabNavigator();

const hideOnScreens = ["GroupChat", "DummyChatScreen"]; // Define screens where you want to hide the tab bar

const tabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (hideOnScreens.includes(routeName)) {
    return { display: "none" };
  }
  return {};
};

const CustomTabBarButtom = ({ children, onPress }) => {
  return (
    <SafeAreaView
      style={{
        width: 100,
        height: 100,
        borderRadius: 100,
        top: -40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00693E",
      }}
    >
      <TouchableOpacity
        style={{
          ...styles.shadow,
          width: 75,
          height: 75,
          marginBottom: 30,
          borderRadius: 100,
          backgroundColor: "#ACCAAF",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

function TabNav() {
  return (
    <SafeAreaProvider>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#80B49F",
          tabBarInactiveTintColor: "white",
          tabBarStyle: {
            ...tabBarVisibility(route),
            position: "absolute",
            left: 20,
            right: 20,
            borderRadius: 30,
            bottom: 20,
            height: 90,
            backgroundColor: "#00693E",
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeNav}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={40} />
            ),
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: 700,
            },
            tabBarLabelPosition: "below-icon",
          }}
        />
        <Tab.Screen
          name="Chats"
          component={ChatNav}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="chat" color={color} size={40} />
            ),
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: 700,
            },
            tabBarLabelPosition: "below-icon",
          }}
        />
        <Tab.Screen
          name="Workouts"
          component={WorkoutsNav}
          options={{
            tabBarLabel: "",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="dumbbell" color={color} size={50} />
            ),
            tabBarIconStyle: {
              marginTop: 10,
            },
            tabBarActiveTintColor: "white",
            tabBarButton: (props) => <CustomTabBarButtom {...props} />,
          }}
        />
        <Tab.Screen
          name="Groups"
          component={GroupsNav}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-group"
                color={color}
                size={45}
              />
            ),
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: 700,
            },
            tabBarLabelPosition: "below-icon",
          }}
        />

        <Tab.Screen
          name="User"
          component={UserNav}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" color={color} size={40} />
            ),
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: 700,
            },
            tabBarLabelPosition: "below-icon",
          }}
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
}

const Stack = createNativeStackNavigator();

export default function MainNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginNav}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Main"
          component={TabNav}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
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

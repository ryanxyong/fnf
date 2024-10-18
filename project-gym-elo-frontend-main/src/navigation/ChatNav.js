import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "../screens/chats/ChatScreen";
import GroupChatScreen from "../screens/chats/GroupChatScreen";
import ChatMembersScreen from "../screens/chats/ChatMembersScreen";
import DummyScreen from "../screens/chats/DummyScreen";

const Stack = createNativeStackNavigator();

export default function ChatNav() {
  return (
    <Stack.Navigator>
    <Stack.Screen
      options={{
        headerShown: false,
      }}
      name="ChatScreen"
      component={ChatScreen}
    ></Stack.Screen>
    <Stack.Screen
      name="GroupChat"
      component={GroupChatScreen}
      options={{
        headerShown: false,
        tabBarVisible: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="ChatMembersScreen"
      component={ChatMembersScreen}
      options={{
        headerShown: false,
        tabBarVisible: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="DummyChat"
      component={DummyScreen}
      options={{
        headerShown: false,
        tabBarVisible: false,
      }}
    ></Stack.Screen>
  </Stack.Navigator>
  )
};

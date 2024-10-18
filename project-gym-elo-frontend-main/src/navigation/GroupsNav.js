import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupsScreen from "../screens/groups/GroupsScreen";
import CommunityScreen from "../screens/groups/CommunityScreen";
import SearchScreen from "../screens/groups/SearchScreen";
import CommunityInfoScreen from "../screens/groups/CommunityInfoScreen";
import MembersScreen from "../screens/groups/MembersScreen";
import SettingsScreen from "../screens/groups/SettingsScreen";
import CreateGroupScreen from "../screens/groups/CreateGroupScreen";
import DummyChatScreen from "../screens/groups/DummyChatScreen";
import GroupChatScreen from "../screens/chats/GroupChatScreen";
import ActiveCommunityScreen from "../screens/chats/ChatScreen";

const Stack = createNativeStackNavigator();

export default function WorkoutsNav() {
  return (
    <Stack.Navigator>
    <Stack.Screen
      name="GroupsScreen"
      component={GroupsScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="CommunityScreen"
      component={CommunityScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="SearchScreen"
      component={SearchScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="CommunityInfoScreen"
      component={CommunityInfoScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="MembersScreen"
      component={MembersScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="SettingsScreen"
      component={SettingsScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="CreateGroupScreen"
      component={CreateGroupScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="DummyChatScreen"
      component={DummyChatScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="GroupChat"
      component={GroupChatScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="ChatScreen"
      component={ActiveCommunityScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
  </Stack.Navigator>
  )
}

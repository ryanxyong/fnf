import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserScreen from "../screens/user/UserScreen";
import UserSettingsScreen from "../screens/user/UserSettingScreen";

const Stack = createNativeStackNavigator();

export default function UserNav() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerTitleAlign: "center",
				headerTitleStyle: {
					flex: 1,
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
				},
			}}
		>
			<Stack.Screen
				name="UserScreen"
				component={UserScreen}
				options={{
					headerShown: false,
				}}
			></Stack.Screen>
			
			<Stack.Screen
				name="Settings"
				component={UserSettingsScreen}
				options={{
					headerShown: false,
				}}
			></Stack.Screen>
		</Stack.Navigator>
	)
}

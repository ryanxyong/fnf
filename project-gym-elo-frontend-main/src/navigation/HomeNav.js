import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AddWorkoutsScreen from "../screens/workouts/AddWorkoutsScreen";
import UserScreen from "../screens/user/UserScreen";

const Stack = createNativeStackNavigator();

export default function HomeNav() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="HomeScreen"
				component={HomeScreen}
				options={{
					headerShown: false,
				}}
			></Stack.Screen>
			<Stack.Screen
				name="AddWorkouts"
				component={AddWorkoutsScreen}
				options={{
					headerShown: false,
				}}
			></Stack.Screen>
			<Stack.Screen
				name="UserProfile"
				component={UserScreen}
				options={{
					headerShown: false,
				}}
			></Stack.Screen>
		</Stack.Navigator>
	)
}
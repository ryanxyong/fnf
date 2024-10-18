import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WorkoutsMainScreen from "../screens/workouts/WorkoutsMainScreen";
import AddWorkoutsScreen from "../screens/workouts/AddWorkoutsScreen";
import DoWorkoutsScreen from "../screens/workouts/DoWorkoutsScreen";
import EditSchedule from "../screens/workouts/EditSchedule";

const Stack = createNativeStackNavigator();

const WorkoutsNav = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="WorkoutsScreen"
      component={WorkoutsMainScreen}
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
      name="ScheduleWorkouts"
      component={EditSchedule}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
    <Stack.Screen
      name="DoWorkouts"
      component={DoWorkoutsScreen}
      options={{
        headerShown: false,
      }}
    ></Stack.Screen>
  </Stack.Navigator>
);

export default WorkoutsNav;

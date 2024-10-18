import * as React from "react";
import { useEffect, useState } from "react";
import { useWindowDimensions, Pressable, StyleSheet, Text } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Icon from "react-native-vector-icons/Ionicons";
import Schedule from "./Schedule";
import Workouts from "./Workouts";

export default function WorkoutsMainScreen({ navigation, route }) {
  const renderScene = SceneMap({
    schedule: () => <Schedule navigation={navigation} />,
    workouts: () => <Workouts navigation={navigation} />,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#00693E" }}
      style={{
        marginTop: 25,
        shadowOpacity: 0,
        backgroundColor: "transparent",
      }}
      renderLabel={({ route }) => (
        <Text
          style={{
            fontSize: 21,
            fontWeight: "900",
            margin: 8,
          }}
        >
          {route.title}
        </Text>
      )}
    />
  );
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  let indexRender = false;
  if (route.params) {
    indexRender = true;
  }

  useEffect(() => {
    if (route.params && indexRender) {
      setIndex(route.params.params == "schedule" ? 0 : 1);
    }
    indexRender = false;
  }, [route.params]);
  const [routes] = useState([
    { key: "schedule", title: "Schedule" },
    { key: "workouts", title: "Workouts" },
  ]);

  return (
    <>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
      <Pressable
        style={({ pressed }) => [
          styles.addButton || {},
          { opacity: pressed ? 0.5 : 1 },
        ]}
        onPress={() =>
          navigation.navigate("AddWorkouts", {
            workoutPlanParams: [
              {
                name: "New Workout",
                plan: [],
                timeCreated: parseInt(Date.now() / 1000),
              },
              true,
            ],
          })
        }
      >
        <Icon name="add" size={36} color="#FFFFFF" style={{ marginLeft: 1 }} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "right",
    fontSize: 17,
    fontWeight: "800",
    paddingRight: 20,
    color: "#0066FF",
    paddingTop: 25,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 0.5,
  },
  addButton: {
    position: "absolute",
    bottom: 120,
    right: 18,
    backgroundColor: "#00693E",
    borderRadius: 36,
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
});

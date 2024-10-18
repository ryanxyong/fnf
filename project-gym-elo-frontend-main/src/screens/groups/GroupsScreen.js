import React, { useEffect, useState } from "react";
import {
  useWindowDimensions,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import CommunityScreen from "./CommunityScreen";
import SearchScreen from "./SearchScreen";

export default function WorkoutsMainScreen({ navigation }) {
  const [events, setEvents] = useState([]);

  const renderScene = SceneMap({
    communities: () => <CommunityScreen navigation={navigation} />,
    search: () => <SearchScreen navigation={navigation} events={events} />,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#000000" }}
      style={{
        shadowOpacity: 0,
        backgroundColor: "transparent",
      }}
      renderLabel={({ route }) => (
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {route.title}
        </Text>
      )}
    />
  );
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "communities", title: "Communities" },
    { key: "search", title: "Search or Create New" },
  ]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </SafeAreaView>
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
    bottom: 16,
    right: 16,
    backgroundColor: "#8A2BE2",
    borderRadius: 36,
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

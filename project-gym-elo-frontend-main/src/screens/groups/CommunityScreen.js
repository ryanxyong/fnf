import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import { SearchBar } from "react-native-elements";
import {
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from "@expo-google-fonts/lato";
import { useFonts } from "expo-font";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../../features/users/userSlice";
import { postGroup, fetchGroup, updateGroup, deleteGroup, fetchUser } from "../../actions/server";

import Icon1 from "../../../assets/icon1.png";
import Icon2 from "../../../assets/icon2.png";
import Icon3 from "../../../assets/icon3.png";


const CommunityScreen = ({ navigation, refreshKey="0" }) => {
  const groups = [
    { id: 1, name: "Big Chunguses", icon: Icon1 },
    { id: 2, name: "Zete bois", icon: Icon2 },
    { id: 3, name: "Ryan's Rivals", icon: Icon3 },
  ];

  const [searchData, setSearchData] = useState("");


	const dispatch = useDispatch();
	const user = useSelector(getUser);
	const userGroups = user.groups;
	const [groupInfo, setGroupInfo] = useState([]);
	const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const getGroups = async () => {
        const groupDataArray = await Promise.all(
            userGroups.map(async (groupID) => {
                try {
                    const groupData = await fetchGroup(groupID);
                    return {
                        "name": groupData.name,
                        "icon": groupData.icon,
                        "type": groupData.type,
                        "id": groupData._id
                    };
                } catch (error) {
                    console.error(error);
                    return null;
                }
            })
        );

        // Filter out potential null values (failed fetches)
        const filteredGroupDataArray = groupDataArray.filter(group => group !== null);

        setGroupInfo(filteredGroupDataArray);
        setDataLoading(false);
    };

    getGroups();
}, [user, refreshKey]);

	const userCommunities = groupInfo.filter((group) => {
        if (group.type) {
          return group.type;
        }
    });

	const handleGroupPress = (id) => {
		navigation.navigate("CommunityInfoScreen", { communityID: id, userID: user.id, refreshKey: Math.random().toString(36).substring(7) });
	};

  const updateSearch = (search) => {
    setSearchData(search);
  };

  const CommunityContainer = ({ community }) => {
    if (community.name) {
      if (community.name.toLowerCase().startsWith(searchData.toLowerCase())) {
        return (
          <TouchableOpacity
            onPress={() => handleGroupPress(community.id)}
            style={styles.groupItem}
          >
            <Image source={{uri: community.icon}} style={styles.groupIcon} />
            <Text style={{ fontFamily: "Lato_400Regular" }}>
              {community.name}
            </Text>
          </TouchableOpacity>
        );
      }
    }
  };

  if (dataLoading) {
    <SafeAreaView style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading Map</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </SafeAreaView>
  } else {
	return (
		<SafeAreaView style={styles.groupListContainer}>
			<SearchBar
				placeholder="Search"
				onChangeText={updateSearch}
				value={searchData}
				containerStyle={styles.searchContainer}
				inputContainerStyle={styles.searchInputContainer}
				inputStyle={styles.searchInputText}
			/>
      { user.groups.length == 0 && (
        <SafeAreaView style={styles.emptyMessageContainer}>
          <Text style={[styles.emptyMessageText, {marginTop: -100}]}>You are not a member of any communities</Text>
        </SafeAreaView>
      )}

      { user.groups.length > 0 && (
        <FlatList
          data={userCommunities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CommunityContainer community={item}/>
          )}
        />
      )}
		</SafeAreaView>
	);
        }
};

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
  container: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "transparent",
  },
  searchInputContainer: {
    backgroundColor: "white",
    height: 40,
    borderRadius: 20,
    paddingLeft: 15,
    borderColor: "#E1EBED",
    borderWidth: 1,
  },
  searchInputText: {
    fontFamily: "Lato_400Regular",
  },
  groupListContainer: {
    position: "absolute",
    top: 10, // Adjust the value to fit the height of your tab bar
    left: 0,
    right: 0,
    bottom: 0,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupIcon: {
    width: 60,
    height: 60, // Adjust the height to fit your design
    marginRight: 10,
    borderRadius: 30,
    overflow: "hidden", // Ensure the icon is properly clipped
  },
  emptyMessageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default CommunityScreen;

import React, { useState, useEffect } from "react";
import {
	SafeAreaView,
	Text,
	ActivityIndicator,
	StyleSheet,
	Pressable,
	TouchableWithoutFeedback,
	Keyboard,
	FlatList,
	Image
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Callout } from "react-native-maps";
import { SearchBar } from 'react-native-elements';
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../../features/users/userSlice";
// for expo purposes of using location services
import * as Location from "expo-location";
import {
	findAllEvents,
	findAllGroups,
	findGroups
  } from "../../actions/server";
import eventIcon from "../../../assets/eventDefaultIcon.png";

const SearchScreen = ({ navigation }) => {
	const user = useSelector(getUser);
	const [initialRegion, setInitialRegion] = useState(null);
	const [mapLoading, setMapLoading] = useState(true);
	const [searchData, setSearchData] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [searchResults, setSearchResults] = useState([{name: "No suggested groups"}]);
	const [allGroupData, setAllGroupData] = useState(null);
	const [allEventData, setAllEventData] = useState(null);
	const [allDataReady, setAllDataReady] = useState(false);
	const [coordinatesReady, setCoordinatesReady] = useState(false);
	const [activeGroup, setActiveGroup] = useState(null);

	useEffect(() => {
		// Get user's current location
		// check should be all good in final app, but geolocation does not work with expo
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setInitialRegion({
						latitude,
						longitude,
						latitudeDelta: 0.01,
						longitudeDelta: 0.01,
					});
					setMapLoading(false);
				},
				(error) => {
					console.error(error);
					setMapLoading(false);
				},
				{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
			);
			// solution to work in expo
		} else {
			// Request permission to access the device's location
			const askPermission = async () => {
				try {
					const { status } = await Location.requestForegroundPermissionsAsync();
					if (status === "granted") {
						// Get the current position
						const location = await Location.getCurrentPositionAsync({});
						const { latitude, longitude } = location.coords;
						setInitialRegion({
							latitude,
							longitude,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01,
						});
						setMapLoading(false);
					} else {
						console.error("Permission to access location was denied");
						setMapLoading(false);
					}
				} catch (error) {
					console.error("Error getting location:", error);
					setMapLoading(false);
				}
			};

			askPermission();
		}
	});

	useEffect(() => {
		const searchGroups = async () => {
			try {
				const resp = await findGroups(searchData);
				setSearchResults(resp);	
			} catch (error) {
				console.error(error);
			}
		}

		if (searchData) {
			searchGroups();
		}
	}, [searchData]);

	useEffect(() => {
		const getMarkerData = async () => {
			try {
				const resp = await findAllGroups();
				setAllGroupData(resp);

				const resp2 = await findAllEvents();
				setAllEventData(resp2);

				setAllDataReady(true);
			} catch (error) {
				console.error(error);
			}
		}

		getMarkerData();
	}, []);

	useEffect(() => {
		const convertLocationstoCoordinates = async (dataList) => {
			if (dataList && allDataReady) {
				dataList.forEach((item, index) => {
					let query = item.location;
					// Remove non-alphanumeric characters
					query = query.replace(/[^a-zA-Z0-9 ]/g, "");
					// Replace spaces with "+"
					query = query.replace(/ /g, "+");

					const url = `https://geocode.search.hereapi.com/v1/geocode?q=${query}&apiKey=--ldxsPHMIAef20leMZqiNk4QDsl5FzzF7tp_PK7eNY`;

					const queryLocation = async () => {
						try {
							const response = await fetch(url);

							if (!response.ok) {
								console.error("Network error fetching location coordinates");
							  }

							const data = await response.json();

							if (data && data.items && data.items.length > 0) {
								const coordinates = data.items[0].position;
								item.location = coordinates;
							}
						} catch (error) {
							console.error(error);
						}
					}
					queryLocation();
				});
			}
		}

		convertLocationstoCoordinates(allGroupData);
		convertLocationstoCoordinates(allEventData);
		setCoordinatesReady(true);

	}, [allDataReady]);

	const handleMarkerPress = (groupID) => {
		navigation.navigate("CommunityInfoScreen", { communityID: groupID, userID: user.id, refreshKey: Math.random().toString(36).substring(7) });
	}


    const updateSearch = ( search ) => {
      setSearchData(search);
    }

	const renderMap = () => (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<SafeAreaView style={styles.map_container}>
				{mapLoading ? (
					// Show loading indicator while initialRegion is being set
					<SafeAreaView style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Loading Map</Text>
						<ActivityIndicator size="large" color="#0000ff" />
					</SafeAreaView>
				) : (
					// Render MapView once loading is complete
					<MapView style={styles.map} initialRegion={initialRegion}>
						{initialRegion && coordinatesReady && allGroupData && allEventData &&(
							<>
							{/* Your Location Marker */}
							<Marker
								coordinate={initialRegion}
								title={"Your Location"}
								pinColor="red"
							/>

							{/* Markers from allEventData */}
							{allEventData.map((markerData, index) => (
								<Marker
									key={index}
									coordinate={{
										latitude: markerData.location.lat,
										longitude: markerData.location.lng,
									}}
								>
										<Image style={styles.eventMarkerIcon} source={eventIcon}/>
										<Callout tooltip style={styles.calloutContainer}>
											<Pressable style={styles.calloutPressable} onPress={() => handleMarkerPress(markerData.communityID)}>
												<SafeAreaView>
													<Text style={styles.groupName} numberOfLines={1}>{markerData.name}</Text>
													<Text style={{fontWeight: "bold"}} numberOfLines={1}>		{markerData.groupName}</Text>
													<Text>{markerData.date},  {markerData.time}</Text>
												</SafeAreaView>
												<Ionicons name="chevron-forward" size={20} color="black" />
											</Pressable>
										</Callout>
								</Marker>
							))}

							{/* Markers from allGroupData */}
							{allGroupData.map((markerData, index) => (
								<Marker
									key={index}
									coordinate={{
										latitude: markerData.location.lat,
										longitude: markerData.location.lng,
									}}
								>
										<Image style={styles.markerIcon} source={{uri: markerData.icon}}/>
										<Callout tooltip style={styles.calloutContainer}>
											<Pressable style={styles.calloutPressable} onPress={() => handleMarkerPress(markerData.id)}>
												<Text style={styles.groupName} numberOfLines={1}>{markerData.name}</Text>
												<Ionicons name="chevron-forward" size={20} color="black" />
											</Pressable>
										</Callout>
								</Marker>
							))}
							</>
						)}

					</MapView>
				)}
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			{renderMap()}
			<SearchBar
                placeholder="Search for Community"
                onChangeText={updateSearch}
                value={searchData}
                containerStyle={styles.searchContainer}
                inputContainerStyle={styles.searchInputContainer}
                inputStyle={styles.searchInputText}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
            />

			{(isFocused || searchData) &&  (
			<SafeAreaView style={styles.searchResultsContainer}>
				<FlatList 
					data={searchResults}
					renderItem={({ item }) => (
					<Pressable 
						style={styles.searchResultItem}
						onPress={() => {
							navigation.navigate("CommunityInfoScreen", { communityID: item._id, userID: user.id, refreshKey: Math.random().toString(36).substring(7) });
						}}
					>
						<Text style={styles.searchResultText} numberOfLines={1}>{item.name}</Text>
					</Pressable>
					)}
				/>
			</SafeAreaView>
			)}

			<Pressable 
				style={styles.createGroupBtn}
				onPress={() => {
					navigation.navigate("CreateGroupScreen");
				}}
			>
				<AntDesign
					name="plus"
					size={30}
					color="white"
				/>
			</Pressable>
		</SafeAreaView>
	);
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
	map_container: {
		height: "100%",
		marginTop: 5
	},
	map: {
		height: "100%"
	},
	searchContainer: {
		backgroundColor: "transparent",
		marginTop: "-177%"
	  },
	  searchInputContainer: {
		backgroundColor: "white",
		height: 40,
		borderRadius: 20,
		paddingLeft: 15,
		borderColor: "#E1EBED",
		borderWidth: 1
	  },
	  searchInputText: {
		fontFamily: "Lato_400Regular",
		fontSize: 16
	  },
	  createGroupBtn: {
        width: 48,
        height: 48,
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "#446EC0",
        borderRadius: 24,
        margin: 15,
        marginRight: 40,
		marginTop: 80,
		position: "absolute",
		right: 0,
		shadowColor: "#000",
		shadowOffset: 4,
		shadowOpacity: 0.7,
		shadowRadius: 4,
	},
	popupContainer: {
        justifyContent: "center",
        alignItems: "center",
      },
      modalContainer: {
        flex: 1,
        justifyContent: "left",
        alignItems: "center",
        paddingTop: 75,
        paddingLeft: 10,
      },
      closeButton: {
        paddingLeft: 20,
        paddingVertical: 20,
        marginBottom: 28,
        marginTop: -75,
        width: 80
      },
      modalContent: {
        justifyContent: "left",
        backgroundColor: "#fff",
        borderRadius: 10,
      },
      modalHeading: {
        width: "auto",
        fontFamily: "Lato_400Regular",
        fontSize: 20,
        textAlign: "center",
        marginTop: 22,
        paddingBottom: 5,
      },
      modalHeadingBold: {
        fontFamily: "Lato_700Bold",
        fontSize: 20,
        textAlign: "center",
      },
      dropDownContainer: {
        marginBottom: 20,
      },
      dateContainer: {
        alignItems: "left",
        justifyContent: "space-between",
        marginTop: 6,
        marginBottom: 16,
      },
      pplContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
        marginBottom: 52,
      },
      picker: {
        backgroundColor: "white",
        width: 100,
        height: 75,
        paddingRight: 10,
      },
      label: {
        fontFamily: "Lato_400Regular",
        fontSize: 16,
        paddingLeft: 14
      },
      input: {
        borderWidth: 1.5,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 8,
        marginTop: 8,
        marginBottom: 24,
        marginHorizontal: 14,
        fontSize: 16,
      },
      descriptionInput: {
        height: 100,
        textAlignVertical: "top",
      },
      submitButton: {
        width: 172,
        backgroundColor: "#00693e",
        borderRadius: 30,
        padding: 12,
        marginBottom: 10,
        alignItems: "center",
        alignSelf: "center"
      },
      submitButtonText: {
        fontFamily: "Lato_700Bold",
        color: "#fff",
        fontSize: 18,
      },
	searchResultItem: {
	  zIndex: 999,
	  backgroundColor: "white",
	  borderWidth: 0.4,
	  borderColor: "black",
	  padding: 10
	},
	searchResultsContainer: {
	  zIndex: 998,
	  position: "absolute",
	  width: "98%",
	  height: 650,
	  padding: 10,
	  marginTop: 70,
	  marginLeft: 4,
	},
	searchResultText: {
	  fontFamily: "Lato_400Regular",
	  fontSize: 16,
	},
	markerIcon: {
		width: 50,
		height: 50,
		borderRadius: 25
	},
	eventMarkerIcon: {
		width: 40,
		height: 40,
		borderRadius: 20
	},
	calloutContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 220,
		backgroundColor: "transparent",
    },
	calloutPressable: {
		flexDirection: "row",
		alignSelf: 'center',
        padding: 12,
        position: 'relative',
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
		borderRadius: 10
	},
	groupName: {
		paddingRight: 4
	},
});

export default SearchScreen;

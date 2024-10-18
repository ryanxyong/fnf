import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { fetchEvent, fetchUser, findAllEvents } from "../actions/server";
import { useDispatch, useSelector } from "react-redux";
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { SelectList } from "react-native-dropdown-select-list";
import { getUser, getEvents } from "../features/users/userSlice";
import workoutSlice, {
  todayWorkoutID,
  specificWorkout,
  newWorkout,
} from "../features/workouts/workoutSlice";
import * as Location from "expo-location";
import haversine from "haversine";

export default function HomeScreen({ navigation }) {
  // get user information based on ID
  // call gets data from backend and updates redux

  const [userLocation, setUserLocation] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [activeUpcomingEvent, setActiveUpcomingEvent] = useState(null);
  const user = useSelector(getUser);
  const [todayID, setTodayID] = useState(
    user.schedule ? user.schedule.todayWorkoutID : null
  );
  const [allEventData, setAllEventData] = useState([]);
  const [eventDataFound, setEventDataFound] = useState(false);
  const [coordinatesReady, setCoordinatesReady] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
  	// Get user's current location
  	// check should be all good in final app, but geolocation does not work with expo
  	if ("geolocation" in navigator) {
  		navigator.geolocation.getCurrentPosition(
  			(position) => {
  				const { latitude, longitude } = position.coords;
  				setUserLocation({
  					latitude,
  					longitude
          });
  			},
  			(error) => {
  				console.error(error);
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
  					setUserLocation({
  						latitude,
  						longitude
  					});
  				} else {
  					console.error("Permission to access location was denied");
  				}
  			} catch (error) {
  				console.error("Error getting location:", error);
  			}
  		};

  		askPermission();
  	}
  }, []);

  useEffect(() => {
    const getEventData = async () => {
      try {
        const resp = await findAllEvents();
        setAllEventData(resp);
        setEventDataFound(true);
      } catch (error) {
        console.error(error);
      }
    };

    getEventData();
  }, []);

  useEffect(() => {
    const convertLocationstoCoordinates = async (dataList) => {
      if (dataList && eventDataFound) {
        dataList.forEach(async (item, index) => {
          let query = item.location;
          query = query.replace(/[^a-zA-Z0-9 ]/g, "");
          query = query.replace(/ /g, "+");

          const url = `https://geocode.search.hereapi.com/v1/geocode?q=${query}&apiKey=--ldxsPHMIAef20leMZqiNk4QDsl5FzzF7tp_PK7eNY`;

          try {
            const response = await fetch(url);

            if (!response.ok) {
              console.error("Network error fetching location coordinates");
              return;
            }

            const data = await response.json();

            if (data && data.items && data.items.length > 0) {
              const coordinates = data.items[0].position;
              item.location = {latitude: coordinates.lat, longitude: coordinates.lng};
              //item.location = coordinates;
              setCoordinatesReady(true);
            }
          } catch (error) {
            console.error(error);
          }
        });
      }
    };

    convertLocationstoCoordinates(allEventData);
    
  }, [eventDataFound]);

  useEffect(() => {
    const sortEventsByDistance = async () => {
      if (coordinatesReady) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const filteredEvents = allEventData.filter((event) => {
          if (event.date) {
            dateArray = event.date.split("/");
            const eventDate = new Date(
              parseInt(dateArray[2]),
              parseInt(dateArray[0]) - 1,
              parseInt(dateArray[1])
            );
            return eventDate >= yesterday;
          }
        });

        filteredEvents.sort((event) => {
          const distanceToEvent = haversine(userLocation, event.location);
          return distanceToEvent;
        });

        const finalEvents = filteredEvents.slice(0, 20);
        setNearbyEvents(finalEvents);

      }
    }
    if (coordinatesReady) {
      sortEventsByDistance();
    };
  }, [coordinatesReady])

  useEffect(() => {
    async function fetchEvents(allEventID) {
      const fetchedEvents = await Promise.all(
        allEventID.map((id) => fetchEvent(id))
      );
      setEvents(fetchedEvents);
    }
    if (user.schedule) {
      setTodayID(user.schedule.todayWorkoutID);
    }

    if (user.events) {
      if (user.events.length > 0) {
        fetchEvents(user.events).finally(() => setDataLoading(false));
      } else {
        setDataLoading(false);
      }
    } else {
      setDataLoading(false);
    }
  }, [dispatch, user, todayID]);

  const [isTodayEventModalVisible, setTodayEventModalVisible] = useState(false);
  const [isUpcomingEventModalVisible, setUpcomingEventModalVisible] =
    useState(false);
  const [selected, setSelected] = useState("");

  const dropdownOptions = [
    { key: "Your Events", value: "Your Events" },
    { key: "Nearby Events", value: "Nearby Events" },
  ];

  const toggleTEModal = () => {
    if (user) {
      if (countTodayEvents(user).length > 0) {
        setTodayEventModalVisible(!isTodayEventModalVisible);
      }
    }
  };
  const toggleUpcomingModal = () => {
    setUpcomingEventModalVisible(!isUpcomingEventModalVisible);
  };

  const countTodayEvents = (user) => {
    const today = new Date();
    today.setDate(today.getDate());
    today.setHours(0, 0, 0, 0);
    if (events) {
      const filteredEvents = events.filter((event) => {
        if (event.date) {
          dateArray = event.date.split("/");
          const eventDate = new Date(
            parseInt(dateArray[2]),
            parseInt(dateArray[0]) - 1,
            parseInt(dateArray[1])
          );
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        }
      });
      return filteredEvents;
    }
  };
  const TodayWorkout = () => {
    const workoutPlan = useSelector(specificWorkout(todayID));
    if (workoutPlan) {
      return (
        <>
          {workoutPlan._id != "rest" && (
            <Pressable
              style={styles.today_wo_btn}
              onPress={() =>
                navigation.navigate("AddWorkouts", {
                  workoutPlanParams: [workoutPlan, false],
                })
              }
            >
              <SafeAreaView>
                <Text style={styles.btnText_header}>Workout</Text>
                <Text style={styles.btnText_body1} numberOfLines={1}>
                  {workoutPlan.name}
                </Text>
              </SafeAreaView>
                <Text style={styles.btnText_body2}>
                  Est. Time: {workoutPlan.time} min(s)
                </Text>
              <AntDesign
                name="arrowright"
                size={24}
                color="black"
                style={styles.arrowIcon}
              />
            </Pressable>
          )}
          {workoutPlan._id == "rest" && (
            <SafeAreaView style={styles.today_wo_btn}>
              <SafeAreaView>
                <Text style={styles.btnText_header}>Workout</Text>
                <Text style={styles.btnText_body1} numberOfLines={1}>
                  {workoutPlan.name}
                </Text>
              </SafeAreaView>
              {!workoutPlan.time && (
                <Text style={styles.btnText_body2}>Est. Time: --</Text>
              )}
              {workoutPlan.time == 1 && (
                <Text style={styles.btnText_body2}>
                  Est. Time: {workoutPlan.time} min
                </Text>
              )}
              {workoutPlan.time && workoutPlan.time != 1 && (
                <Text style={styles.btnText_body2}>
                  Est. Time: {workoutPlan.time} mins
                </Text>
              )}
            </SafeAreaView>
          )}
        </>
      );
    }
  };
  const Todays_Event = ({ event }) => {
    const today = new Date();
    today.setDate(today.getDate());
    if (event.date) {
      dateArray = event.date.split("/");
      const eventDate = new Date(
        parseInt(dateArray[2]),
        parseInt(dateArray[0]) - 1,
        parseInt(dateArray[1])
      );
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (eventDate.getTime() == today.getTime()) {
        return (
          <SafeAreaView style={styles.today_event_container}>
            {/* Placeholder. Should access communities[event.communityID.icon] 
            <Image source={Icon2} style={styles.today_event_icon} />*/}
            <Text style={styles.today_event_header} numberOfLines={1}>
              {event.name}
            </Text>
          </SafeAreaView>
        );
      }
    }
  };

  const Today_Events_Full = ({ event }) => {
    const today = new Date();
    today.setDate(today.getDate());
    if (event.date) {
      dateArray = event.date.split("/");
      const eventDate = new Date(
        parseInt(dateArray[2]),
        parseInt(dateArray[0]) - 1,
        parseInt(dateArray[1])
      );
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (eventDate.getTime() == today.getTime()) {
        return (
          <SafeAreaView style={styles.eventContainer}>
            <SafeAreaView style={{ flexDirection: "row" }}>
              {/* Placeholder. Should access communities[event.communityID.icon] 
              <Image source={Icon2} style={styles.today_event_icon} />*/}
              <Text
                style={[styles.eventHeaderText, { maxWidth: 280 }]}
                numberOfLines={1}
              >
                {event.name}
              </Text>
            </SafeAreaView>
            <SafeAreaView
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.eventSubHeaderText}>
                {event.date} {event.time}
              </Text>
              <Text style={[styles.eventSubHeaderText, { maxWidth: "47%", textAlign: "center" }]}>{event.location}</Text>
            </SafeAreaView>
            <Text style={styles.eventText} numberOfLines={3}>
              {event.description}
            </Text>
          </SafeAreaView>
        );
      }
    }
  };

  const EventFlatlist = ({ allEvents }) => {
    if (allEvents) {
      return (
        <SafeAreaView>
          <FlatList
            style={{ paddingBottom: 130 }}
            data={allEvents}
            renderItem={({ item }) => (
              <SafeAreaView>
                <Pressable
                  style={styles.flatlistItem}
                  onPress={() => {
                    if (selected === "Your Events") {
                      toggleUpcomingModal();
                      setActiveUpcomingEvent(item);
                    }
                  }}
                >
                  <SafeAreaView style={{ maxWidth: "40%" }}>
                    <Text style={styles.eventHeaderText}>{item.date}</Text>
                    <Text style={[styles.eventHeaderText]} numberOfLines={1}>
                      {item.groupName}
                    </Text>
                  </SafeAreaView>
                  <SafeAreaView style={{ maxWidth: "50%" }}>
                    <Text style={[styles.eventHeaderText]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.eventHeaderText]}>
                      {item.location}
                    </Text>
                  </SafeAreaView>
                  <SafeAreaView
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 14,
                    }}
                  >
                    <Text>View</Text>
                    <AntDesign
                      name="arrowright"
                      size={24}
                      color="black"
                      style={styles.arrowIcon}
                    />
                  </SafeAreaView>
                </Pressable>
              </SafeAreaView>
            )}
            keyExtractor={(item, index) => "key" + index}
          />
          <Modal
            isVisible={isUpcomingEventModalVisible && activeUpcomingEvent}
            onBackdropPress={() => setUpcomingEventModalVisible(false)}
            onSwipeComplete={() => setUpcomingEventModalVisible(false)}
            swipeDirection="down"
          >
            <UpcomingEventPopUp event={activeUpcomingEvent} nearby={false} />
          </Modal>
        </SafeAreaView>
      );
    }
  };

  const NearbyEventFlatlist = ({ allEvents }) => {
    if (allEvents) {
      return (
        <SafeAreaView>
          <FlatList
            style={{ paddingBottom: 130 }}
            data={allEvents}
            renderItem={({ item }) => (
              <SafeAreaView>
                <Pressable
                  style={styles.flatlistItem}
                  onPress={() => {
                    if (selected === "Nearby Events") {
                      toggleUpcomingModal();
                      setActiveUpcomingEvent(item);
                    }
                  }}
                >
                  <SafeAreaView style={{ maxWidth: "40%" }}>
                    <Text style={styles.eventHeaderText}>{item.date}</Text>
                    <Text style={[styles.eventHeaderText]} numberOfLines={1}>
                      {item.groupName}
                    </Text>
                  </SafeAreaView>
                  <SafeAreaView style={{ maxWidth: "50%" }}>
                    <Text style={[styles.eventHeaderText]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.eventHeaderText]}>
                      {haversine(userLocation, item.location, {unit: "miles"}).toFixed(1)} miles away
                    </Text>
                  </SafeAreaView>
                  <SafeAreaView
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 14,
                    }}
                  >
                    <Text>View</Text>
                    <AntDesign
                      name="arrowright"
                      size={24}
                      color="black"
                      style={styles.arrowIcon}
                    />
                  </SafeAreaView>
                </Pressable>
              </SafeAreaView>
            )}
            keyExtractor={(item, index) => "key" + index}
          />
          <Modal
            isVisible={isUpcomingEventModalVisible && activeUpcomingEvent}
            onBackdropPress={() => setUpcomingEventModalVisible(false)}
            onSwipeComplete={() => setUpcomingEventModalVisible(false)}
            swipeDirection="down"
          >
            <UpcomingEventPopUp event={activeUpcomingEvent} nearby={true} />
          </Modal>
        </SafeAreaView>
      );
    }
  };

  const UpcomingEvents = ({ allEvents, selected }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (allEvents.length != 0) {
      const filteredEvents = allEvents.filter((event) => {
        if (event.date) {
          dateArray = event.date.split("/");
          const eventDate = new Date(
            parseInt(dateArray[2]),
            parseInt(dateArray[0]) - 1,
            parseInt(dateArray[1])
          );
          return eventDate >= yesterday;
        }
      });
      const sortedEvents = filteredEvents.sort((a, b) => {
        if (a.date && b.date) {
          dateArray1 = a.date.split("/");
          dateArray2 = b.date.split("/");
          const dateA = new Date(
            parseInt(dateArray1[2]),
            parseInt(dateArray1[0]) - 1,
            parseInt(dateArray1[1])
          );
          const dateB = new Date(
            parseInt(dateArray2[2]),
            parseInt(dateArray2[0]) - 1,
            parseInt(dateArray2[1])
          );
          return dateA - dateB;
        }
      });
      if (sortedEvents.length != 0) {
        if (selected == "Your Events") {
          return <EventFlatlist allEvents={sortedEvents} />;
        } else if (userLocation) {
          return <NearbyEventFlatlist allEvents={nearbyEvents} />;
        }
      }
    }
    return (
      <SafeAreaView style={styles.noScheduledEvents}>
        <Text style={styles.noScheduledEventsText}>No Upcoming {selected}</Text>
      </SafeAreaView>
    );
  };

  const UpcomingEventPopUp = ({ event, nearby }) => {
    if (event) {
      return (
        <SafeAreaView style={styles.eventContainer}>
          <SafeAreaView style={{ flexDirection: "row" }}>
            <Text
              style={[styles.eventHeaderText, { maxWidth: 280 }]}
              numberOfLines={1}
            >
              {event.name}
            </Text>
          </SafeAreaView>
          <SafeAreaView
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.eventSubHeaderText}>
              {event.date}, {event.time}
            </Text>
            {!nearby && (
              <Text
                style={[
                  styles.eventSubHeaderText,
                  { maxWidth: "47%", textAlign: "center" },
                ]}
              >
                {event.location}
              </Text>
            )}
            {nearby && (
              <Text
                style={[
                  styles.eventSubHeaderText,
                  { maxWidth: "47%", textAlign: "center" },
                ]}
              >
                {haversine(userLocation, event.location, {unit: "miles"}).toFixed(1)} miles away
              </Text>
            )}
          </SafeAreaView>
          <Text style={styles.eventText} numberOfLines={3}>
            {event.description}
          </Text>
        </SafeAreaView>
      );
    }
  };

  const Upcoming = ({ selected }) => {
    if (selected === "Your Events") {
      return <UpcomingEvents allEvents={events} selected={selected} />;
    } else if (selected === "Nearby Events") {
      return <UpcomingEvents allEvents={nearbyEvents} selected={selected} />;
    }
  };

  const TimeOfDayGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 4 && currentHour < 12) {
      return (
        <SafeAreaView style={{ flexDirection: "row" }}>
          <Text style={styles.subheader}>Good Morning</Text>
          <MaterialIcons
            name="wb-sunny"
            size={50}
            color="#FFCE31"
            style={styles.welcomeIcon}
          />
        </SafeAreaView>
      );
    } else if (currentHour >= 12 && currentHour < 17) {
      return (
        <SafeAreaView style={{ flexDirection: "row" }}>
          <Text style={styles.subheader}>Good Afternoon</Text>
          <MaterialIcons
            name="wb-sunny"
            size={50}
            color="#FFCE31"
            style={styles.welcomeIcon}
          />
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView style={{ flexDirection: "row" }}>
          <Text style={styles.subheader}>Good Evening</Text>
          <Ionicons
            name="moon-sharp"
            size={50}
            color="#666666"
            style={styles.welcomeIconMoon}
          />
        </SafeAreaView>
      );
    }
  };
  if (dataLoading || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      style={styles.screenContainer}
      edges={["right", "left", "top"]}
    >
      <FlatList
        ListHeaderComponent={
          <>
            {/* Welcome Message */}
            <View style={styles.headerContainer}>
              <SafeAreaView>
                <TimeOfDayGreeting />
                <Text style={styles.header}> {user.firstName}! </Text>
              </SafeAreaView>
              <Pressable onPress={() => navigation.navigate("UserProfile")}>
                <Image
                  source={{ uri: user.profilePic }}
                  style={styles.profilePicImage}
                />
              </Pressable>
            </View>

            {/* Today Section */}
            <SafeAreaView>
              <Text style={styles.subHeadingText}>Today</Text>

              {user.schedule && <TodayWorkout />}

              <SafeAreaView style={{ flexDirection: "row" }}>
                {/* Events Button */}
                <Pressable style={styles.events_btn} onPress={toggleTEModal}>
                  <Text style={styles.btnText_header}>Events</Text>
                  <SafeAreaView
                    style={{
                      marginLeft: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {countTodayEvents(user).length > 0 ? (
                      <FlatList
                        style={{ width: "95%" }}
                        data={events} // replace with "current user" instead of user
                        renderItem={({ item }) => <Todays_Event event={item} />}
                        keyExtractor={(item, index) => "key" + index}
                      />
                    ) : (
                      <Text style={styles.btnText_body2}>No events today</Text>
                    )}
                  </SafeAreaView>
                </Pressable>

                {/* Popup When clicking on events button */}
                <Modal
                  style={styles.modalContainer}
                  isVisible={isTodayEventModalVisible}
                  onBackdropPress={() => setTodayEventModalVisible(false)}
                  onSwipeComplete={() => setTodayEventModalVisible(false)}
                  swipeDirection="down"
                >
                  {/* Content */}
                  <SafeAreaView style={[styles.modalView]}>
                    <FlatList
                      style={[styles.flatList]}
                      data={events} // replace with "current user" instead of user
                      renderItem={({ item }) => (
                        <Today_Events_Full event={item} />
                      )}
                      keyExtractor={(item, index) => "key" + index}
                    />
                  </SafeAreaView>
                </Modal>
              </SafeAreaView>
            </SafeAreaView>

            {/* FlatList displaying upcoming events */}
            <SafeAreaView style={styles.eventListContainer}>
              <SafeAreaView style={styles.eventListHeaderContainer}>
                <Text style={styles.eventListHeader}>Upcoming</Text>
                <SelectList
                  setSelected={setSelected}
                  data={dropdownOptions}
                  search={false}
                  defaultOption={{ key: "Your Events", value: "Your Events" }}
                  dropdownStyles={styles.selectList}
                  boxStyles={{
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: "#00693E",
                  }}
                  dropdownTextStyles={{
                    fontFamily: "Lato_400Regular",
                    fontWeight: 600,
                    color: "#00693E",
                  }}
                  inputStyles={{
                    fontFamily: "Lato_700Bold",
                    fontWeight: 800,
                    color: "#00693E",
                  }}
                />
              </SafeAreaView>

              <Upcoming selected={selected} />
            </SafeAreaView>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' or 'contain'
    justifyContent: "center",
  },
  screenContainer: {},
  headerContainer: {
    flexDirection: "row",
    opacity: 0.8,
    justifyContent: "space-between",
    marginHorizontal: 12,
    paddingTop: 80,
    marginTop: -80,
    marginBottom: 10,
  },
  header: {
    fontFamily: "Lato_700Bold",
    textAlign: "left",
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.5,
  },
  subheader: {
    fontFamily: "Lato_700Bold",
    textAlign: "left",
    fontSize: 30,
    color: "black",
    marginTop: 15,
    marginBottom: 12,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.3,
  },
  welcomeIcon: {
    marginTop: 8,
    paddingLeft: 12,
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeIconMoon: {
    paddingLeft: 12,
    textShadowColor: "#ADD8E6",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  profilePicImage: {
    width: 100,
    height: 100,
    borderRadius: 55,
    borderWidth: 2,
    marginBottom: 10,
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1.5,
  },
  subHeadingText: {
    fontFamily: "Lato_700Bold",
    fontWeight: 800,
    fontSize: 26,
    paddingLeft: 20,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.5,
  },
  today_wo_btn: {
    backgroundColor: "#ACCAAF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  events_btn: {
    backgroundColor: "#ACCAAF",
    paddingTop: 10,
    borderRadius: 16,
    width: "95%",
    marginTop: 14,
    marginHorizontal: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    paddingBottom: 30,
  },
  btnText_header: {
    fontFamily: "Lato_700Bold",
    fontSize: 20,
    paddingTop: 5,
    paddingHorizontal: 35,
  },
  btnText_body1: {
    fontFamily: "Lato_400Regular",
    fontSize: 18,
    maxWidth: 170,
    paddingTop: 10,
    paddingLeft: 35,
  },
  btnText_body2: {
    fontFamily: "Lato_400Regular",
    fontSize: 16,
    paddingLeft: 20,
    paddingRight: 15,
    paddingTop: 5,
  },
  row_container: {
    flexDirection: "row",
  },
  today_event_container: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  today_event_icon: {
    margin: 10,
    marginRight: 0,
    width: 18,
    height: 18,
    overflow: "hidden",
  },
  today_event_header: {
    fontFamily: "Lato_900Black",
    margin: 10,
    fontSize: 14,
    maxWidth: "100%",
  },
  modalContainer: {
    width: "100%",
  },
  modalView: {
    justifyContent: "center",
    alignItems: "center",
  },
  eventContainer: {
    width: 360,
    height: 135,
    marginRight: 40,
    marginBottom: 14,

    backgroundColor: "#ACCAAF",
    alignItems: "center",
    borderRadius: 16,
    ShadowColor: "#000000",
    shadowOpacity: 0.6,
    ShadowOffset: { x: 3, y: 6 },
    ShadowRadius: 3,
  },
  eventIcon: {
    margin: 10,
    marginRight: 0,
    width: 18,
    height: 18,
    overflow: "hidden",
  },
  eventHeaderText: {
    fontFamily: "Lato_700Bold",
    margin: 10,
    fontSize: 16,
    maxWidth: "100%",
  },
  eventSubHeaderText: {
    fontFamily: "Lato_700Bold",
    margin: 5,
    fontSize: 14,
    marginHorizontal: 15,
    maxWidth: "100%",
  },
  eventText: {
    fontFamily: "Lato_400Regular",
    fontSize: 14,
    paddingTop: 8,
    maxWidth: "95%",
  },
  flatlistItem: {
    backgroundColor: "#ACCAAF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  eventListContainer: {
    flex: 1,
    marginTop: 30,
  },
  eventListHeaderContainer: {
    flexDirection: "row",
    zIndex: 999,
    height: 50,
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 10,
  },
  eventListHeader: {
    fontFamily: "Lato_700Bold",
    fontSize: 26,
    paddingLeft: 20,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.5,
  },
  selectList: {
    position: "absolute",
    marginTop: 48,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00693E",
  },
  workoutView: {
    marginBottom: 10,
    marginHorizontal: 15,
  },
  workoutContainer: {
    marginTop: 3,
    backgroundColor: "white",
    opacity: 0.9,
    borderRadius: 10,
    ShadowColor: "#000000",
    shadowOpacity: 0.2,
    ShadowOffset: { x: 3, y: 6 },
    ShadowRadius: 3,
  },
  containerText: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  arrowIcon: {
    fontWeight: 800,
  },
  message: {
    textAlign: "center",
    color: "#1118A4",
    fontSize: 18,
  },
  noScheduledEvents: {
    margin: 50,
    alignContent: "center",
    textAlign: "center",
  },
  noScheduledEventsText: {
    fontFamily: "Lato_700Bold",
    fontSize: 20,
    textAlign: "center",
  },
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
});

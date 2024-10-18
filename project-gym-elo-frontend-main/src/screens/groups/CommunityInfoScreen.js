import * as React from "react";
import { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  Text,
  ImageBackground,
  FlatList,
  Pressable,
  Image,
  Switch,
  TextInput,
  Alert,
  View,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-native-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { EvilIcons, AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import {
  fetchGroup,
  updateGroup,
  postEvent,
  fetchEvent,
  updateUser,
  addUserEvent,
  addAllUserEvent,
  removeUserEvent,
  deleteEvent,
  fetchUser,
  updateEvent,
  fetchChat,
  updateChat,
  fetchOtherUser,
  addOtherUserEvent
} from "../../actions/server";
import { getUser, addEvent, removeEvent, addGroup, addChat } from "../../features/users/userSlice";

const CommunityInfoScreen = ({ navigation, route }) => {
  const communityID = route.params.communityID;
  const refreshKey = route.params.refreshKey;
  const [community, setCommunity] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [ignoreAndKeepLoading, setIgnoreAndKeepLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [eventsIDs, setEventsIDs] = useState(null);
  const [isAutoEnabled, setIsAutoEnabled] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [locationOptions, setLocationOptions] = useState([]);

  useEffect(() => {
    const getCommunity = async () => {
      try {
        const comData = await fetchGroup(communityID);

        setEventsIDs(comData.events);
        
        let newEvents = [];
        for (i in comData.events) {
          let eventInfo = await fetchEvent(comData.events[i]);
          newEvents.push(eventInfo);
        }
        setEvents(newEvents);
        setCommunity(comData);
        setMemberCount(comData.admin.length + comData.members.length);
        setIsAutoEnabled(comData.autoAdd.includes(user._id));
        setDataLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    getCommunity();
  }, [dataLoading, refreshKey]);

  const queryLocation = async () => {

    let query = eventData.location;
    // Remove non-alphanumeric characters
    query = query.replace(/[^a-zA-Z0-9 ]/g, '');
    // Replace spaces with "+"
    query = query.replace(/ /g, '+');
    const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${query}&limit=5&apiKey=--ldxsPHMIAef20leMZqiNk4QDsl5FzzF7tp_PK7eNY`

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Network response was not ok');
      }

      const data = await response.json();

      if (data && data.items) {
        const newLocationOptions = data.items.map(result => result.title);
        setLocationOptions(newLocationOptions);
      }
      
    } catch {
      console.error(error);
    }
  }


  const layout = useWindowDimensions(); // Get window dimensions
  const modalWidth = layout.width * 0.9;

  const [isAddEventModalVisible, setAddEventModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validLocation, setValidLocation] = useState(false);

  // initialize add-event default values
  const todaysDate = selectedDate.toLocaleDateString("en-us");
  const [eventData, setEventData] = useState({
    name: "",
    groupName: "",
    date: todaysDate,
    time: "12:00 PM",
    location: "", // Added location field
    description: "",
    members: [],
    communityID: communityID,
  });

  const toggleSwitch = async () => {
    if (community.members.includes(user._id) || community.admin.includes(user._id)) {

      const remove = async () => {
        let communityAutoAdd = [...community.autoAdd];
        communityAutoAdd = communityAutoAdd.filter((item) => item !== user._id);
        await updateGroup(communityID, {"autoAdd": communityAutoAdd});
      }

      const add = async () => {
        if (!community.autoAdd.includes(user._id)) {
          let communityAutoAdd = [...community.autoAdd];
          communityAutoAdd.push(user._id);
          await updateGroup(communityID, {"autoAdd": communityAutoAdd});
        }
        addAllUserEvent(user, community.events, dispatch);
      };

      if (isAutoEnabled) {
        remove();
      } else {
        add();
      }
      setIsAutoEnabled((previousState) => !previousState);
    }
  };

  const toggleAddEventModal = () => {
    if (community.admin.includes(user._id) || (!community.permissions && community.members.includes(user._id))) {
      setAddEventModalVisible((previousState) => !previousState);
    }
    else {
      Alert.alert("You do not have permissions to create an event for this community!", "",  [
        {
          text: "OK",
          onPress: () => {},
          style: "cancel"
        }
      ])
    }
  }
  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const closeModalAlert = () => {
    Alert.alert("You will lose your changes!", "", [
        {
          text: "Discard Changes",
          onPress: () => toggleAddEventModal(),
        },
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
      ],
    );
  }

  const handleDateChange = (event, selectedDate) => {
    hideDatePicker();
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-us");
      handleInputChange("date", formattedDate);
      setSelectedDate(selectedDate);
    }
  };
  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const hours = selectedTime.getHours() % 12;
      const minutes = selectedTime.getMinutes();
      let formattedTime = "";
      if (selectedTime.getHours() > 11) {
        formattedTime = `${hours}:${minutes} PM`;
      } else if (selectedTime.getHours() == 0) {
        formattedTime = `12:${minutes} AM`;
      } else {
        formattedTime = `${hours}:${minutes} AM`;
      }

      handleInputChange("time", formattedTime);
      setSelectedTime(selectedTime);
    }
  };

  const handleInputChange = (field, value) =>
    setEventData({ ...eventData, [field]: value });

  const handleLocationInputChange = (field, value) => {
    setEventData({ ...eventData, [field]: value });
    setValidLocation(false);
    queryLocation();
  }

  const selectLocation = (address) => {
    setEventData({...eventData, "location": address});
    setValidLocation(true);
  }

  const leaveGroup = () => {
    let mockAutoAdd = [];
    let mockAdmin = [];
    let mockMembers = [];
    if (community.autoAdd) {
      mockAutoAdd = [...community.autoAdd];
      if (community.autoAdd.includes(user._id)) {
        mockAutoAdd = mockAutoAdd.filter((item) => item !== user._id);
      }
    }
    if (community.admin) {
      mockAdmin = [...community.admin];
      if (community.admin.includes(user._id)) {
        mockAdmin = mockAdmin.filter((item) => item !== user._id);
      }
    }
    if (community.members) {
      mockMembers = [...community.members];
      if (community.members.includes(user._id)) {
        mockMembers = mockMembers.filter((item) => item !== user._id);
      }
    }

    const updateData = async () => {
      // update user redux
      let updatedGroup = { ...community };
      updatedGroup.members = mockMembers;
      updatedGroup.admin = mockAdmin;
      updatedGroup.autoAdd = mockAutoAdd;
      let updatedGroups = [...user.groups];
      updatedGroups = updatedGroups.filter((item) => item !== communityID);
      dispatch(removeGroup(communityID));
      // update user backend
      await updateUser(user._id, { groups: updatedGroups });
      // update group backend
      await updateGroup(communityID, updatedGroup);
    };

    updateData();

    navigation.navigate("GroupScreen");
  };

  const settingsNavigation = () => {
    if (community.admin.includes(user._id) || (!community.permissions && community.members.includes(user._id))) {
      navigation.navigate("SettingsScreen", {groupID: communityID});
    }
    else {
      Alert.alert("You do not have permission to change settings. Would you like to leave this community?", "", [
        {
          text: "Leave Community",
          onPress: () => {
            leaveGroup();
          },
        },
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
      ],);
    }
  }


  const createSubmitAlert = (missingData) => {
    if (missingData) {
      Alert.alert("Trouble Submitting!", "Please fill in all available fields", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    } else {
      Alert.alert("Trouble Submitting!", "Please enter a valid location", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
  }

  const handleSubmit = () => {
    // Validate that all required fields are filled before submitting
    if (!eventData.date || !eventData.name || !eventData.location) {
      // Handle validation error (show an alert, etc.)
      return createSubmitAlert(true);
    }
    else if (!validLocation) {
      return createSubmitAlert(false);
    }

    // Create a new event object
    if (community) {
      const newEvent = {
        name: eventData.name,
        groupName: community.name,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        description: eventData.description,
        members: [],
        communityID: eventData.communityID,
      };


      const setEvent = async () => {
        try {
          if (newEvent) {
            const newEventData = await postEvent(newEvent);

            const newEventID = newEventData._id;
            eventsIDs.push(newEventID);
            await updateGroup(communityID, {"events": eventsIDs});

            // add event to every autoAdd user's events
            const addToAutoAdd = async (newEventID) => {
              const autoAddUsers = [...community.autoAdd];
              console.log("AUTOADD USERS", autoAddUsers)
              await Promise.all (
                autoAddUsers.map(async member => {
                  const userData = await fetchOtherUser(member);
                  let memberEvents = [...userData.events];
                  memberEvents.push(newEventID);
                  await updateUser(userData._id, memberEvents);

                  if (userData._id == user._id) {
                    console.log("BEFORE ADDING TO CURRENT USER")

                    await addUserEvent(user, newEventID, dispatch);
                    console.log("AFTER ADDING TO CURRENT USER")

                  }
                  else {
                    console.log("BEFORE ADDING TO OTHER USER")
                    await addOtherUserEvent(userData, newEventID);
                    console.log("AFTER ADDING TO OTHER USER")

                  }
              }))
            }
            
            await addToAutoAdd(newEventID);
            
            setDataLoading(true);

            // for each user in autoAddUsers
            // updateUser(user, newEventID)
            // setDataLoading(true);
          } else {
            console.error("Event is undefined")
          }

        } catch (error) {
          console.error(error);
        }
      };

      setEvent();
    }

    // Reset the eventData state for the next entry
    setEventData({
      date: todaysDate,
      time: "",
      name: "",
      groupName: community.name,
      description: "",
      location: "",
      members: [],
      communityID: communityID,
    });

    // Close the modal
    toggleAddEventModal();
  };

  const handleJoinCommunity = () => {
    // update the user on redux
    // update the user on backend
    // update the group on backend
    // refresh the page
    const joinCommunity = async () => {
      try {
          setIgnoreAndKeepLoading(true);
          // add the group to the user's groups in redux
          let updatedGroups = [...user.groups];
          updatedGroups.push(communityID);
          dispatch(addGroup(communityID));

          // update the user in the backend with their new groups
          const newUser = await updateUser(user._id, {groups: updatedGroups});

          // update the group
          let updatedMembers = [...community.members];
          updatedMembers.push(user._id);
          const updatedCommunity = await updateGroup(communityID, {members: updatedMembers});

          // add the user to the group's chat in backend
          let chat = await fetchChat(community.chat);
          let chatUsers = [...chat.userIDs];
          if (!chatUsers.includes(user._id)) {
            chatUsers.push(user._id);
          }

          const updatedChat = await updateChat(community.chat, {userIDs: chatUsers});

          // add the chat to the user's chats (or create chat array for user with chatid) on backend
          let newChats = [...user.chats];
          if (!newChats.includes(community.chat)) {
            newChats.push(community.chat);
          }
          const updatedUser = await updateUser(user._id, {chats: newChats});

          // update user redux with its new chats
          dispatch(addChat(community.chat));

          setIgnoreAndKeepLoading(false);
          setDataLoading(true);
      } catch (error) {
          console.error(error);
      }
    }

    joinCommunity();

  }

  const removeEventFromExistence = async (event) => {
    // remove event from community
    let communityEvents = [...community.events];
    communityEvents = communityEvents.filter((item) => item !== event._id);

    const updatedCommunity = await updateGroup(communityID, {events: communityEvents});

    // remove event from user's redux
    dispatch(removeEvent(event._id));

    // remove event from every member in event.member 's events
    if (event.members) {
      const updatedMembers = await Promise.all(
        event.members.map(async (memberID) => {
          const member = await fetchUser(memberID);
          if (member) {
            let memberEvents = [...member.events];
            memberEvents = memberEvents.filter((item) => item !== event._id);
            return await updateUser(member._id, { events: memberEvents });
          }
        })
      );
    }

    // delete event
    const deletedData = await deleteEvent(event._id);

    setDataLoading(true)
  }

  const deleteEventAlert = (event) => {
    Alert.alert(`Are you sure you want to delete ${event.name} for all participants?`, "", [
      {
        text: "Delete Event",
        onPress: () => removeEventFromExistence(event),
      },
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
    ]);
  };

  const AddEventBtn = (event) => {
    const id = event.event._id;

    const [isAdded, setIsAdded] = useState(user.events.includes(id));

    const toggleAdded = () => {
      if (community.admin.includes(user._id) || community.members.includes(user._id)) {
        if (isAdded) {
          const removeOne = async () => {
            if (user.events.includes(id)) {
              removeUserEvent(user, id, dispatch);
              // remove user from event.members
              let eventMembers = [...event.event.members];
              eventMembers = eventMembers.filter((item) => item !== user._id);
          
              const updatedEvent = await updateEvent(id, {members: eventMembers});
            }
          };
          removeOne();
        } else {
          const addOne = async () => {
            if (!user.events.includes(id)) {
              addUserEvent(user, id, dispatch);
              // add user to event.members
              let eventMembers = [...event.event.members];
              eventMembers.push(user._id);
          
              const updatedEvent = await updateEvent(id, {members: eventMembers});
            }
          };
          addOne();
        }
        setIsAdded(user.events.includes(id));
      }
    };

    if (!isAdded) {
      return (
        <SafeAreaView>
          <Pressable style={styles.addEventBtn} onPress={toggleAdded}>
            <AntDesign name="plus" size={30} color="white" />
          </Pressable>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView>
          <Pressable style={styles.addEventBtn} onPress={toggleAdded}>
            <Feather name="check" size={30} color="white" />
          </Pressable>
        </SafeAreaView>
      );
    }
  };

  const RemoveEventBtn = (eventEvent) => {
    const event = eventEvent.event;
    if (community.admin.includes(user._id) || (!community.permissions && community.members.includes(user._id))) {
      return (
        <SafeAreaView>
          <Pressable style={styles.removeEventBtn} onPress={() => deleteEventAlert(event)}>
            <AntDesign name="minus" size={20} color="red" />
          </Pressable>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView></SafeAreaView>
      );
    }
  };

  const EventContainer = ({ events }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const filteredEvents = events.filter((event) => {
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

    return (
      <SafeAreaView>
        <FlatList
          style={{ paddingBottom: 105 }}
          data={sortedEvents}
          renderItem={({ item }) => (
            <SafeAreaView style={styles.flatlistItem}>
              <SafeAreaView
                style={[
                  styles.flatlistItemSubheader,
                  { paddingHorizontal: 30, alignItems: "center" },
                ]}
              >
                <RemoveEventBtn event={item}/>
                <Text
                  style={[
                    styles.eventHeaderText,
                    { width: "70%", textAlign: "center" },
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <AddEventBtn event={item} />
              </SafeAreaView>
              <SafeAreaView style={styles.flatlistItemSubheader}>
                <Text style={styles.eventHeaderText}>
                  {item.date},  {item.time}
                </Text>
                <Text style={styles.eventLocationText}>{item.location}</Text>
              </SafeAreaView>
              <SafeAreaView style={{ width: "100%" }}>
                <Text style={styles.eventText}>{item.description}</Text>
              </SafeAreaView>
            </SafeAreaView>
          )}
          keyExtractor={(item, index) => "key" + index}
        />
      </SafeAreaView>
    );
  };

  if (dataLoading || ignoreAndKeepLoading || !events || !community) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.container}>
          <FlatList
            style={{flex: 1}}
            ListHeaderComponent={
              <SafeAreaView>
                <SafeAreaView style={styles.headerContainer}>
                  <EvilIcons
                    name="chevron-left"
                    size={40}
                    color="black"
                    style={styles.backIcon}
                    onPress={() => navigation.navigate("GroupsScreen")}
                  />
                  <Text style={styles.headerText}> Community Info</Text>
                </SafeAreaView>

                <SafeAreaView style={styles.bannerContainer}>
                  <ImageBackground
                    source={{uri: community.banner}} // Assuming community.banner is a valid image source
                    style={styles.bannerImage}
                  >
                    <SafeAreaView
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Image
                        style={styles.communityIcon}
                        source={{uri: community.icon}}
                      />
                      <Pressable
                        style={styles.createEventBtn}
                        onPress={toggleAddEventModal}
                      >
                        <AntDesign name="plus" size={30} color="white" />
                      </Pressable>
                    </SafeAreaView>
                    <SafeAreaView style={styles.bannerFooter}>
                      <SafeAreaView>
                        <Pressable
                          onPress={() =>
                            navigation.navigate("MembersScreen", {
                              groupID: communityID,
                              groupAdmin: community.admin,
                              groupMembers: community.members,
                              chatID: community.chat
                            })
                          }
                        >
                          <Ionicons
                            name="people-sharp"
                            size={22}
                            color="black"
                          />
                        </Pressable>
                        <Text style={styles.smallBannerText}>
                          ({memberCount})
                        </Text>
                      </SafeAreaView>
                      <Text style={styles.largeBannerText}>
                        {community.name}
                      </Text>
                      <Pressable
                        onPress={() => settingsNavigation()}>
                        <Ionicons
                          name="settings-sharp"
                          size={36}
                          color="black"
                        />
                      </Pressable>
                    </SafeAreaView>
                  </ImageBackground>
                </SafeAreaView>

                <SafeAreaView>
                  <Text style={styles.descriptionText}>
                    {community.description}
                  </Text>
                </SafeAreaView>

                <SafeAreaView style={styles.eventHeaderContainer}>
                  <Text style={styles.subheaderText}>Scheduled Events</Text>
                  <SafeAreaView
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={styles.smallBoldText}>Auto-Add Events</Text>
                    {(!community.members.includes(user._id) && !community.admin.includes(user._id)) && (
                      <Switch
                        trackColor={{ false: "#767577", true: "#383F41" }}
                        thumbColor={isAutoEnabled ? "#ffffff" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isAutoEnabled}
                        disabled={true}
                      />
                    )}
                    {(community.members.includes(user._id) || community.admin.includes(user._id)) && (
                      <Switch
                        trackColor={{ false: "#767577", true: "#383F41" }}
                        thumbColor={isAutoEnabled ? "#ffffff" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isAutoEnabled}
                      />
                    )}
                  </SafeAreaView>
                </SafeAreaView>

                <SafeAreaView>
                  <EventContainer events={events} />
                </SafeAreaView>
              </SafeAreaView>
            }
          />

          {/* Modal for adding event */}
          <SafeAreaView style={styles.popupContainer}>
            <Modal
              style={styles.modalContainer}
              isVisible={isAddEventModalVisible}
              swipeDirection={[]}
            >
              <SafeAreaView
                style={[styles.modalContainer, { width: layout.width }]}
              >
                {/* Modal content */}
                <KeyboardAwareScrollView scrollEnabled={false}>
                  <SafeAreaView
                    style={[styles.modalContent, { width: modalWidth }]}
                  >
                    {/* Close button in the top left */}
                    <SafeAreaView style={{}}>
                      <Text style={styles.modalHeading}>Add Event for</Text>
                      <Text style={styles.modalHeadingBold}>
                        {community.name}
                      </Text>
                      <Pressable
                        style={styles.closeButton}
                        onPress={closeModalAlert}
                      >
                        <AntDesign name="close" size={30} color="#000" />
                      </Pressable>
                    </SafeAreaView>

                    {/* Event Name input */}
                    <Text style={styles.label}>Event Name:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Event Name"
                      placeholderTextColor={"#B7B7B7"}
                      value={eventData.name}
                      onChangeText={(text) => handleInputChange("name", text)}
                    />

                    {/* Date input */}
                    <SafeAreaView style={styles.dateContainer}>
                      <Text style={styles.label}>Date:</Text>
                      <DateTimePicker
                        mode="date"
                        display="calendar"
                        value={selectedDate}
                        onChange={handleDateChange}
                        isVisible={isDatePickerVisible}
                        style={{ marginLeft: 60, marginTop: -26 }}
                      />
                    </SafeAreaView>

                    {/* Time input */}
                    <SafeAreaView style={styles.dateContainer}>
                      <Text style={styles.label}>Time:</Text>
                      <DateTimePicker
                        mode="time"
                        value={selectedTime}
                        onChange={handleTimeChange}
                        style={{ marginLeft: 60, marginTop: -26 }}
                      />
                    </SafeAreaView>

                    {/* Location input */}
                    <Text style={styles.label}>Location:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Location"
                      placeholderTextColor={"#B7B7B7"}
                      value={eventData.location}
                      onChangeText={(text) => handleLocationInputChange("location", text)}
                      onFocus={() => setIsFocused(true)}
                    />

                      {isFocused && locationOptions.length > 0 && !validLocation &&  (
                        <SafeAreaView style={styles.locationOptionContainerFull}>
                          <FlatList 
                            style={styles.locationOptionsFlatlist}
                            data={locationOptions}
                            renderItem={({ item }) => (
                              <Pressable 
                                style={styles.locationOption}
                                onPress={() => {
                                    selectLocation(item);
                                  }
                                }
                              >
                                <Text style={styles.locationOptionText} numberOfLines={1}>{item}</Text>
                              </Pressable>
                            )}
                            inverted={true}
                          />
                        </SafeAreaView>
                      )}

                      {isFocused && locationOptions.length == 0 &&  (
                        <SafeAreaView style={styles.locationOptionContainerEmpty}>
                          <FlatList 
                            style={styles.locationOptionsFlatlist}
                            data={["No Suggested Addresses"]}
                            renderItem={({ item }) => (
                              <Pressable 
                                style={styles.locationOption}
                              >
                                <Text style={styles.locationOptionText} numberOfLines={1}>{item}</Text>
                              </Pressable>
                            )}
                            inverted={true}
                          />
                        </SafeAreaView>
                      )}

                    {/* Description input */}
                    <Text style={styles.label}>Description:</Text>
                    <TextInput
                      style={[styles.input, styles.descriptionInput]}
                      placeholder="Enter Description"
                      placeholderTextColor={"#B7B7B7"}
                      multiline
                      value={eventData.description}
                      onChangeText={(text) =>
                        handleInputChange("description", text)
                      }
                    />

                    {/* Submit button */}
                    <Pressable
                      style={styles.submitButton}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.submitButtonText}>Submit</Text>
                    </Pressable>
                  </SafeAreaView>
                </KeyboardAwareScrollView>
              </SafeAreaView>
            </Modal>
          </SafeAreaView>
        {!community.members.includes(user._id) && !community.admin.includes(user._id) && (
          <SafeAreaView>
            <Pressable
              style={styles.joinCommunityBtn}
              onPress={() => handleJoinCommunity()}
            >
              <Text style={styles.submitButtonText}>Join Community</Text>
            </Pressable>
          </SafeAreaView>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "left",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: "14%",
  },
  backIcon: {
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  bannerContainer: {
    justifyContent: "flex-end",
    height: 185,
    width: "100%",
  },
  bannerImage: {
    height: "100%",
    width: "100%",
  },
  bannerFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 40,
    width: "100%",
    backgroundColor: "white",
    opacity: 0.7,
    marginTop: 15,
  },
  createEventBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#446EC0",
    borderRadius: 24,
    margin: 15,
    marginRight: 20,
  },
  communityIcon: {
    width: 100,
    height: 100,
    marginTop: 30,
    marginLeft: "35%",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
  },
  smallBannerText: {
    fontSize: 13,
  },
  largeBannerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 14,
    padding: 18,
  },
  eventHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  subheaderText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  smallBoldText: {
    fontSize: 12,
    fontWeight: "bold",
    paddingBottom: 4,
  },
  flatlistItem: {
    backgroundColor: "#ACCAAF",
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
  addEventBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    paddingVertical: 10,
    marginVertical: 10,
    backgroundColor: "#383F41",
    borderRadius: 24,
  },
  removeEventBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    paddingVertical: 6,
    marginVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "red"
  },
  flatlistItemSubheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  eventHeaderText: {
    fontFamily: "Lato_700Bold",
    margin: 10,
    fontSize: 16,
    maxWidth: "100%",
  },
  eventLocationText: {
    fontFamily: "Lato_700Bold",
    margin: 10,
    fontSize: 16,
    maxWidth: "52%",
  },
  eventText: {
    fontFamily: "Lato_400Regular",
    paddingHorizontal: 15,
    fontSize: 14,
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
    width: 80,
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
    paddingLeft: 14,
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
    alignSelf: "center",
  },
  submitButtonText: {
    fontFamily: "Lato_700Bold",
    color: "#fff",
    fontSize: 18,
  },
  locationOptionsFlatlist: {
  },
  locationOption: {
    zIndex: 999,
    backgroundColor: "white",
    borderWidth: 0.4,
    borderColor: "black",
    padding: 10
  },
  locationOptionContainerFull: {
    zIndex: 998,
    position: "absolute",
    width: 320,
    height: 200,
    justifyContent: "flex-end",
    padding: 10,
    marginTop: 116,
    marginLeft: 16,
    backgroundColor: "transparent"
  },
  locationOptionContainerEmpty: {
    zIndex: 998,
    position: "absolute",
    width: 320,
    padding: 10,
    marginTop: 274,
    marginLeft: 16,
  },
  locationOptionText: {
    fontFamily: "Lato_400Regular",
    fontSize: 16,
  },
  joinCommunityBtn: {
    position: "absolute",
    zIndex: 999,
    width: 172,
    backgroundColor: "#00693e",
    borderRadius: 30,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    alignSelf: "center",
    bottom: 140
  },
});

export default CommunityInfoScreen;

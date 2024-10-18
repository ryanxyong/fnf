import { useState, useEffect, React } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ImageBackground,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import { EvilIcons, Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { 
  fetchGroup, 
  updateGroup, 
  updateUser, 
  updateChat, 
  fetchChat,
  fetchEvent,
  updateEvent
} from "../../actions/server";
import { getUser, removeGroup, removeChat, removeAllEvents } from "../../features/users/userSlice";

export default function SettingsScreen({ navigation, route }) {
  const groupID = route.params.groupID;

  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const [bannerPhoto, setBannerPhoto] = useState("");
  const [iconPhoto, setIconPhoto] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [adminOnlyPermissions, setAdminOnlyPermissions] = useState(null);

  const [isFocused, setIsFocused] = useState(false);
  const [validLocation, setValidLocation] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    const getGroup = async () => {
      try {
        const groupData = await fetchGroup(groupID);
        setGroup(groupData);
        setGroupName(groupData.name);
        setDescription(groupData.description);
        setLocation(groupData.location);
        setBannerPhoto(groupData.banner);
        setAdminOnlyPermissions(groupData.permissions);
        setIconPhoto(groupData.icon);
        setDataLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    getGroup();
  }, [user]);

  const cloudinaryUpload = (photo, type) => {
    const data = new FormData();
    data.append("file", photo);
    data.append("upload_preset", "fnfphotos");
    data.append("cloud_name", "flexnfriends");
    fetch("https://api.cloudinary.com/v1_1/flexnfriends/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        const groupUpdate = { ...group };
        if (type == "icon") {
          setIconPhoto(data.secure_url);
          if (!hasEdited) {
            setHasEdited(true);
          }
        } else {
          setBannerPhoto(data.secure_url);
          if (!hasEdited) {
            setHasEdited(true);
          }
        }
      })
      .catch((err) => {
        Alert.alert("An Error Occured While Uploading");
      });
  };

  const pickImage = async (icon) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && icon) {
        const uri = result.assets[0].uri;
        const type = result.assets[0].type;
        const name = uri.substring(uri.lastIndexOf("/") + 1, uri.length);
        const source = {
          uri,
          type,
          name,
        };
        cloudinaryUpload(source, "icon");
      } else if (!result.canceled) {
        const uri = result.assets[0].uri;
        const type = result.assets[0].type;
        const name = uri.substring(uri.lastIndexOf("/") + 1, uri.length);
        const source = {
          uri,
          type,
          name,
        };
        cloudinaryUpload(source, "banner");
      }
    } catch (error) {
      console.log(error, "error taking image");
    }
  };

  const toggleSwitch = () =>
    setAdminOnlyPermissions((previousState) => !previousState);
    if (!hasEdited) {
      setHasEdited(true);
    }

  const handleLocationInputChange = (value) => {
    setLocation(value);
    setValidLocation(false);
    queryLocation();
  };

  const selectLocation = (address) => {
    setLocation(address);
    setValidLocation(true);
    if (!hasEdited) {
      setHasEdited(true);
    };
  };

  const queryLocation = async () => {
    let query = location;
    // Remove non-alphanumeric characters
    if (location) {
      // Remove everything that is not an alphanumeric symbol or a space
      query = query.replace(/[^a-zA-Z0-9 ]/g, "");
      // Replace spaces with "+"
      query = query.replace(/ /g, "+");

      const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${query}&limit=5&apiKey=--ldxsPHMIAef20leMZqiNk4QDsl5FzzF7tp_PK7eNY`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          console.error("Network response was not ok");
        }

        const data = await response.json();

        if (data && data.items) {
          const newLocationOptions = data.items.map((result) => result.title);
          setLocationOptions(newLocationOptions);
          console.error(locationOptions);
        }
      } catch {
        console.error(error);
      }
    }
  };

  const leaveGroup = () => {
    let mockAutoAdd = [];
    let mockAdmin = [];
    let mockMembers = [];
    if (group.autoAdd) {
      mockAutoAdd = [...group.autoAdd];
      if (group.autoAdd.includes(user._id)) {
        mockAutoAdd = mockAutoAdd.filter((item) => item !== user._id);
      }
    }
    if (group.admin) {
      mockAdmin = [...group.admin];
      if (group.admin.includes(user._id)) {
        mockAdmin = mockAdmin.filter((item) => item !== user._id);
      }
    }
    if (group.members) {
      mockMembers = [...group.members];
      if (group.members.includes(user._id)) {
        mockMembers = mockMembers.filter((item) => item !== user._id);
      }
    }

    const updateData = async () => {
      // update user redux
      let updatedGroup = { ...group };
      updatedGroup.members = mockMembers;
      updatedGroup.admin = mockAdmin;
      updatedGroup.autoAdd = mockAutoAdd;
      let updatedGroups = [...user.groups];
      updatedGroups = updatedGroups.filter((item) => item !== groupID);
      console.log("members", updatedGroup.members);
      console.log("admin", updatedGroup.admin);
      console.log("autoAdd", updatedGroup.autoAdd);
      console.log("updated groups", updatedGroup);
      dispatch(removeGroup(groupID));
      // update user backend
      await updateUser(user._id, { groups: updatedGroups });
      // update group backend
      await updateGroup(groupID, updatedGroup);
    };

    const leaveChat = async () => {
      // remove chat from user.chats
      let newChats = [...user.chats];
      newChats = newChats.filter((item) => item !== group.chat);

      const userNoChat = await updateUser(user._id, {chats: newChats});

      // update user redux
      dispatch(removeChat(group.chat));
      
      // remove user from chat
      const chatData = await fetchChat(group.chat);

      let newChatUsers = [...chatData.userIDs];
      newChatUsers = newChatUsers.filter((item) => item !== user._id);
      const updatedChat = await updateChat(chatData._id, {userIDs: newChatUsers});

    }

    updateData();
    leaveChat();

    navigation.navigate("GroupsScreen");
  };

  const clickBack = () => {
    Alert.alert("Do you want to Submit your changes?", "", [
      {
        text: "Submit",
        onPress: () => leavePage(true),
      },
      {
        text: "Cancel",
        onPress: () => leavePage(false),
        style: "cancel",
      },
    ]);
  };

  const clickSave = () => {
    Alert.alert("Do you want to save your changes?", "", [
      {
        text: "Save",
        onPress: () => {
          leavePage(true);
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const leavePage = (submitted) => {
    if (submitted && validLocation) {
      let groupInfo = { ...group };
      groupInfo.name = groupName;
      groupInfo.icon = iconPhoto;
      groupInfo.banner = bannerPhoto;
      groupInfo.description = description;
      groupInfo.location = location;
      groupInfo.permissions = adminOnlyPermissions;

      const update = async () => {
        const newGroup = await updateGroup(group._id, groupInfo);
      }
      update();
    }

    navigation.navigate("CommunityInfoScreen", {
      communityID: group._id,
      userID: user._id,
      refreshKey: Math.random().toString(36).substring(7),
    });
  };

  if (dataLoading || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Map</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    )
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView>
          <SafeAreaView style={styles.headerContainer}>
            <EvilIcons
              name="chevron-left"
              size={40}
              color="black"
              style={styles.backIcon}
              onPress={() => clickBack()}
            />
            <Text style={styles.headerText}> Settings</Text>
            {hasEdited && (
              <Pressable onPress={() => clickSave()} style={styles.save}>
                <Feather
                  name="check"
                  size={40}
                  color="black"
                />
              </Pressable>
            )}
          </SafeAreaView>

          {/* Edit Group Image */}
          <SafeAreaView>
            <ImageBackground
              source={{ uri: bannerPhoto }}
              style={styles.groupIconContainer}
            >
              <ImageBackground
                source={{ uri: iconPhoto }} // Assuming community.banner is a valid image source
                style={styles.groupPic}
              >
                <Pressable
                  style={styles.editImageContainer}
                  onPress={() => pickImage(true)}
                >
                  <Feather
                    name={"edit-2"}
                    size={50}
                    color={"black"}
                    style={styles.editIcon}
                  />
                </Pressable>
              </ImageBackground>
                <Pressable
                  style={styles.editBannerContainer}
                  onPress={() => pickImage(false)}
                >
                  <Feather
                    name={"edit-2"}
                    size={35}
                    color={"black"}
                    style={styles.editIcon}
                  />
                </Pressable>
            </ImageBackground>
          </SafeAreaView>

          <TextInput
            style={styles.input}
            placeholder={group.name}
            placeholderTextColor={"#B7B7B7"}
            value={groupName}
            onChangeText={(text) => {
              setGroupName(text);
              setHasEdited(true);
            }}
          />

          {/* Description input */}
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder={group.description}
            placeholderTextColor={"#B7B7B7"}
            multiline
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (!hasEdited) {
                setHasEdited(true);
              }
            }}
          />

          {/* Location input */}
          <Text style={styles.label}>Location:</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Enter Location"
            placeholderTextColor={"#B7B7B7"}
            value={location}
            onChangeText={(text) => handleLocationInputChange(text)}
            onFocus={() => setIsFocused(true)}
          />

          {isFocused && locationOptions.length > 0 && !validLocation && (
            <SafeAreaView style={styles.locationOptionContainerFull}>
              <FlatList
                style={styles.locationOptionsFlatlist}
                data={locationOptions}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.locationOption}
                    onPress={() => {
                      selectLocation(item);
                    }}
                  >
                    <Text style={styles.locationOptionText} numberOfLines={1}>
                      {item}
                    </Text>
                  </Pressable>
                )}
                inverted={true}
              />
            </SafeAreaView>
          )}

          {isFocused && locationOptions.length == 0 && (
            <SafeAreaView style={styles.locationOptionContainerEmpty}>
              <FlatList
                style={styles.locationOptionsFlatlist}
                data={["No Suggested Addresses"]}
                renderItem={({ item }) => (
                  <Pressable style={styles.locationOption}>
                    <Text style={styles.locationOptionText} numberOfLines={1}>
                      {item}
                    </Text>
                  </Pressable>
                )}
                inverted={true}
              />
            </SafeAreaView>
          )}

          <SafeAreaView style={styles.permissionsContainer}>
            <Text style={styles.subheaderText}>Admin-Only Permissions</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#00693E" }}
              thumbColor={adminOnlyPermissions ? "#ffffff" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={adminOnlyPermissions}
            />
          </SafeAreaView>
          <Text style={styles.basicText}>
            When on, only admins will have permission to change community
            settings and create new events
          </Text>

          <Pressable style={styles.leaveGroupBtn} onPress={() => leaveGroup()}>
            <Ionicons name={"exit-outline"} size={40} color={"red"} />
            <Text style={[styles.subheaderText, { color: "red" }]}>
              Leave Group
            </Text>
          </Pressable>

          <SafeAreaView style={{ height: 140 }}></SafeAreaView>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

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
    paddingVertical: 10,
  },
  headerText: {
    fontFamily: "Lato_700Bold",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: "25%",
  },
  backIcon: {
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  groupIconContainer: {
    width: 350,
    height: 170,
    marginTop: 12,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "gray",
    shadowRadius: 4,
    shadowColor: "black",
    shadowOffset: 3,
    overflow: "hidden",
  },
  groupPic: {
    height: 150,
    width: 150,
    marginTop: 10,
    marginLeft: 10,
    borderRadius: 75,
    overflow: "hidden",
  },
  editImageContainer: {
    height: 100,
    width: 100,
    marginTop: 25,
    marginLeft: 25,
    borderRadius: 20,
    backgroundColor: "white",
    opacity: 0.6,
  },
  editBannerContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    marginTop: 25,
    marginLeft: 25,
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
    marginHorizontal: 20,
    fontSize: 20,
  },
  locationInput: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
    marginBottom: 24,
    marginHorizontal: 20,
    fontSize: 13,
  },
  descriptionInput: {
    height: 150,
    marginHorizontal: 14,
    textAlignVertical: "top",
    fontSize: 16,
  },
  smallInput: {
    marginHorizontal: 14,
    textAlignVertical: "top",
    fontSize: 16,
  },
  permissionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 14,
    marginRight: 80,
  },
  subheaderText: {
    fontSize: 18,
    fontFamily: "Lato_700Bold",
  },
  basicText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    alignSelf: "center",
    marginTop: 14,
  },
  leaveGroupBtn: {
    width: 180,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#b3b3b3",
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 0.4,
    borderColor: "black",
    marginTop: 30,
    paddingHorizontal: 10,
  },
  locationOptionsFlatlist: {},
  locationOption: {
    zIndex: 999,
    backgroundColor: "white",
    borderWidth: 0.4,
    borderColor: "black",
    padding: 10,
  },
  locationOptionContainerFull: {
    zIndex: 998,
    position: "absolute",
    width: 340,
    height: 200,
    justifyContent: "flex-end",
    padding: 10,
    marginTop: 356,
    backgroundColor: "transparent",
    alignSelf: "center",
  },
  locationOptionContainerEmpty: {
    zIndex: 998,
    position: "absolute",
    width: 320,
    padding: 10,
    marginTop: 514,
    marginLeft: 16,
    alignSelf: "center",
  },
  locationOptionText: {
    fontFamily: "Lato_400Regular",
    fontSize: 16,
  },
  save: {
    borderRadius: 30,
    borderColor: "black",
    borderWidth: 3,
    width: 60,
    height: 60,
    marginLeft: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: {
      width: .6,
      height: .6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
});

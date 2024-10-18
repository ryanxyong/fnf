import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  useWindowDimensions,
  ImageBackground,
  Switch,
  FlatList,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SelectList } from "react-native-dropdown-select-list";
import { EvilIcons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSelector, useDispatch } from "react-redux";
import { addGroup, getUser, getGroups, addChat } from "../../features/users/userSlice";
import { postGroup, updateChat, updateUser } from "../../actions/server";

import defaultIcon from "../../../assets/defaultPic.png";

const CreateGroupScreen = ({ navigation }) => {
  const user = useSelector(getUser);
  const [selected, setSelected] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [bannerPic, setBannerPic] = useState(null);
  const [adminOnlyPermissions, setAdminOnlyPermissions] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    location: "",
  });
  const [validLocation, setValidLocation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const dispatch = useDispatch();

  const toggleSwitch = () =>
    setAdminOnlyPermissions((previousState) => !previousState);

  const layout = useWindowDimensions(); // Get window dimensions

  const pickImage = async (icon) => {
    if (!isLeaving) {
      // // No permissions request is necessary for launching the image library
      // let result = await ImagePicker.launchImageLibraryAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.All,
      //   allowsEditing: true,
      //   aspect: [4, 3],
      //   quality: 1,
      // });

      // if (!result.canceled && icon) {
      //   setProfilePic(result.assets[0].uri);
      // } else if (!result.canceled) {
      //   setBannerPic(result.assets[0].uri);
      // }
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
    }
  };

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
        if (type == "icon") {
          setProfilePic(data.secure_url);
          //groupUpdate.icon = data.secure_url;
          //updateGroup(groupID, groupUpdate);
        } else {
          setBannerPic(data.secure_url);
          //groupUpdate.banner = data.secure_url;
          //updateGroup(groupID, groupUpdate);
        }
      })
      .catch((err) => {
        Alert.alert("An Error Occured While Uploading");
      });
  };

  const queryLocation = async () => {
    let query = groupData.location;
    // Remove non-alphanumeric characters
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
      }
    } catch {
      console.error(error);
    }
  };

  const handleLocationInputChange = (field, value) => {
    setGroupData({ ...groupData, [field]: value });
    setValidLocation(false);
    queryLocation();
  };

  const selectLocation = (address) => {
    setGroupData({ ...groupData, location: address });
    setValidLocation(true);
  };

  const handleInputChange = (field, value) =>
    setGroupData({ ...groupData, [field]: value });

  const createSubmitAlert = (missingData) => {
    if (missingData) {
      Alert.alert(
        "Trouble Submitting!",
        "Please fill in all available fields",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]
      );
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
  };

  const handleSubmit = () => {
    if (!isLeaving) {
      // Validate that all required fields are filled before submitting
      if (!groupData.name || !groupData.description || !groupData.location || ! profilePic || !bannerPic) {
        // Handle validation error (show an alert, etc.)
        return createSubmitAlert(true);
      } else if (!validLocation) {
        return createSubmitAlert(false);
      }

      // Create a new group object
      const newGroup = {
        name: groupData.name,
        memberCount: 1,
        icon: profilePic,
        banner: bannerPic,
        description: groupData.description,
        events: [],
        permissions: adminOnlyPermissions,
        members: [],
        admin: [user._id],
        type: true,
        autoAdd: [],
        location: groupData.location,
        chat: null,
      };

      submitData(newGroup);
    }
  };

  const submitData = async (newGroup) => {
    setIsLeaving(true);

    try {
      // post the new group
      console.log(newGroup)
      const postedGroup = await postGroup(newGroup);
      console.log(postedGroup);
      // add the new group to the user's groups in redux
      const newGroupID = postedGroup._id;
      let updatedGroups = [...user.groups];
      updatedGroups.push(newGroupID);
      dispatch(addGroup(newGroupID));
      // update the user in the backend with their new groups
      const newUser = await updateUser(user._id, { groups: updatedGroups });

      // add the user to the group's chat
      let oneUserArray = [user._id]
      const updatedChat = await updateChat(postedGroup.chat, {userIDs: oneUserArray});

      // update the user's redux with new chat
      dispatch(addChat(postedGroup.chat));

      // update the user backend with the new chat
      let updatedChats = [...user.chats];
      updatedChats.push(postedGroup.chat);
      const updatedUser = await updateUser(user._id, {chats: updatedChats});

      navigation.navigate("GroupsScreen");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.popupContainer,
        { width: layout.width, height: layout.height },
      ]}
    >
      <KeyboardAwareScrollView scrollEnabled={true}>
        {/* Close button in the top left */}
        <SafeAreaView style={styles.headerContainer}>
          <EvilIcons
            name="chevron-left"
            size={40}
            color="black"
            style={styles.backIcon}
            onPress={() => navigation.navigate("GroupsScreen")}
          />
          <Text style={styles.headerText}> Create New Group</Text>
        </SafeAreaView>

        {/* Edit Group Image */}
        <SafeAreaView>
          <ImageBackground
            source={{ uri: bannerPic }}
            style={styles.groupIconContainer}
          >
            <ImageBackground
              source={{ uri: profilePic }} // Assuming community.banner is a valid image source
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

        <SafeAreaView>
          {/* Group Name input */}
          <TextInput
            style={styles.nameInput}
            placeholder="Group Name"
            placeholderTextColor={"#B7B7B7"}
            value={groupData.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />

          {/* Location input */}
          <Text style={styles.label}>Location:</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Enter Location"
            placeholderTextColor={"#B7B7B7"}
            value={groupData.location}
            onChangeText={(text) => handleLocationInputChange("location", text)}
            onFocus={() => setIsFocused(true)}
          />

          {isFocused && locationOptions.length > 0 && !validLocation && (
            <SafeAreaView style={styles.locationOptionContainerFull}>
              <FlatList
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

          {/* Description input */}
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Enter Description"
            placeholderTextColor={"#B7B7B7"}
            multiline
            value={groupData.description}
            onChangeText={(text) => handleInputChange("description", text)}
          />

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
            When on, only admins will have permission to change settings and
            create new events or workouts.
          </Text>
        </SafeAreaView>

        {/* Submit button */}
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Group</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    justifyContent: "left",
    backgroundColor: "white",
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
    marginLeft: "13%",
  },
  backIcon: {
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  selectList: {
    zIndex: 999,
    position: "absolute",
    width: "45%",
    marginLeft: 40,
    marginTop: 48,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00693E",
  },
  groupIconContainer: {
    width: 350,
    height: 170,
    marginTop: 20,
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
  nameInput: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginTop: 12,
    marginBottom: 24,
    marginHorizontal: 40,
    fontSize: 22,
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
  locationInput: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginVertical: 8,
    marginLeft: 14,
    marginRight: 26,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
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
    marginLeft: 14,
  },
  basicText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
    margin: 14,
  },
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
    width: 350,
    height: 200,
    justifyContent: "flex-end",
    padding: 10,
    marginTop: -92,
    marginLeft: 16,
    backgroundColor: "transparent",
  },
  locationOptionContainerEmpty: {
    zIndex: 998,
    position: "absolute",
    width: 350,
    padding: 10,
    marginTop: 68,
    marginLeft: 16,
  },
  locationOptionText: {
    fontFamily: "Lato_400Regular",
    fontSize: 16,
  },
  submitButton: {
    width: 172,
    backgroundColor: "#00693e",
    borderRadius: 30,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 125,
    shadowColor: "#000",
    shadowOffset: 2,
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  submitButtonText: {
    fontFamily: "Lato_700Bold",
    color: "#fff",
    fontSize: 18,
  },
});

export default CreateGroupScreen;

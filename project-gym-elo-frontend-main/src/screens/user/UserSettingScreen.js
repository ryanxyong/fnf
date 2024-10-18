import { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  Pressable,
  Image,
  // TextInput,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { EvilIcons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateUser } from "../../actions/server";
import { getUser } from "../../features/users/userSlice";
import { createUser } from "../../features/users/userSlice";
import { nameValidator } from "../../helpers/nameValidator";
import TextInput from "../../components/TextInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { logout } from "../../features/auth/authSlice"
import { Ionicons } from "@expo/vector-icons";

export default function UserSettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  // console.log(user)
  // console.log(user.profilePic)

  const [firstName, setFirstName] = useState({ value: `${user.firstName || ''}`.trim(), error: '' }); 
  const [lastName, setLastName] = useState({ value: `${user.lastName || ''}`.trim(), error: '' });
  const [profilePic, setProfilePic] = useState(`${user.profilePic || ''}`);
  const [dataLoading, setDataLoading] = useState(true);

  const logoutUser = () => {
    dispatch(logout())
    navigation.navigate("StartScreen")
  };

  const updateUserProfile = async () => {
    try {
      const userUpdate = { ...user };
      userUpdate.profilePic = profilePic;
      userUpdate.firstName = firstName.value;
      userUpdate.lastName = lastName.value;
      dispatch(createUser(userUpdate));
      // console.log('pp', profilePic)
      await updateUser(user._id, { email: user.email, firstName: firstName.value, lastName: lastName.value, profilePic: profilePic });
    //   setDataLoading(false);
      navigation.navigate("UserScreen");
      Alert.alert("Profile Updated Successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("An Error Occurred");
    }
  };

  const cloudinaryUpload = (photo) => {
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
        // console.log(data.secure_url)
        setProfilePic(data.secure_url);
      })
      .catch((error) => {
        Alert.alert("An Error Occured While Uploading", );
      });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const type = result.assets[0].type;
        const name = uri.substring(uri.lastIndexOf("/") + 1, uri.length);
        const source = {
          uri,
          type,
          name,
        };
        cloudinaryUpload(source);
      }
    } catch (error) {
      console.log(error, "error taking image");
    }
  };

  const clickBack = () => {
    Alert.alert("Do you want to save your changes?", "", [
      {
        text: "Save",
        onPress: () => {
          const firstNameError = nameValidator(firstName.value);
          const lastNameError = nameValidator(lastName.value);
          if (firstNameError && lastNameError) {
            setFirstName({ ...firstName, error: `First ${firstNameError}` });
            setLastName({ ...lastName, error: `Last ${lastNameError}` });
            return
          } else if (firstNameError) {
            setFirstName({ ...firstName, error: `First ${firstNameError}` });
            return
          } else if (lastNameError) {
            setLastName({ ...lastName, error: `Last ${lastNameError}` });
            return
          }
          updateUserProfile();
          navigation.navigate("Home");
        },
      },
      {
        text: "Cancel",
        onPress: () => navigation.navigate("UserScreen"),
        style: "cancel",
      },
    ]);
  };

  const clickSave = () => {
    Alert.alert("Do you want to save your changes?", "", [
      {
        text: "Save",
        onPress: () => {
          const firstNameError = nameValidator(firstName.value);
          const lastNameError = nameValidator(lastName.value);
          if (firstNameError && lastNameError) {
            setFirstName({ ...firstName, error: `First ${firstNameError}` });
            setLastName({ ...lastName, error: `Last ${lastNameError}` });
            return
          } else if (firstNameError) {
            setFirstName({ ...firstName, error: `First ${firstNameError}` });
            return
          } else if (lastNameError) {
            setLastName({ ...lastName, error: `Last ${lastNameError}` });
            return
          }
          updateUserProfile();
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const deleteAccount = () => {
    // Here you would typically handle account deletion logic
    Alert.alert("Delete Account", "Are you sure you want to delete your account?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        onPress: () => {
          // Insert account deletion logic here
          console.log('Account deletion process started');
        },
        style: 'destructive',
      }
    ]);
  };

//   if (dataLoading || !user) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading User Data</Text>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </SafeAreaView>
//     );
//   } else {
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
          
          <Text style={styles.headerText}> </Text>
        </SafeAreaView>

        <Pressable onPress={() => clickSave()} style={styles.save}>
          <Feather
            name="check"
            size={40}
            color="black"
          />
        </Pressable>
        <SafeAreaView style={styles.profilePicContainer}>
          <Pressable onPress={pickImage}>
            <View>
              <Image source={{ uri: profilePic }} style={styles.profilePicImage} />
              <SafeAreaView style={styles.edit}>
                <Feather name={"edit-2"} size={35} color={"black"} />
              </SafeAreaView>
            </View>
          </Pressable>
        </SafeAreaView>
        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>Email</Text>
          <Text style={styles.input}>{user.email}</Text> 
        </View>

        <View style={styles.fieldContainer}>
          <TextInput
            label="First name"
            returnKeyType="next"
            value={firstName.value}
            onChangeText={(text) => setFirstName({ value: text, error: '' })}
            error={!!firstName.error}
            errorText={firstName.error}
            header="Name"
          />
          <TextInput
            label="Last name"
            returnKeynpm Type="done"
            value={lastName.value}
            onChangeText={(text) => setLastName({ value: text, error: '' })}
            error={!!lastName.error}
            errorText={lastName.error}
          />
        </View>
        <SafeAreaView>
          <Pressable style={styles.leaveGroupBtn} onPress={() => logoutUser()}>
            <Ionicons name={"exit-outline"} size={40} color={"red"} />
            <Text style={[styles.subheaderText, { color: "red" }]}>
            Sign out
            </Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
    );
    //}
}

const styles = StyleSheet.create({
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
  },
  profilePicImage: {
    width: 140,
    height: 140,
    borderRadius: 100,
    borderWidth: 2,
    marginBottom: 10,
  },
  edit: {
    position: "absolute",
    opacity: 0.5,
    borderRadius: 100,
    backgroundColor: "white",
    width: 50,
    height: 50,
    bottom: 25,
    right: 25,
    justifyContent: "center",
    alignItems: "center",
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
  container: {
    flex: 1,
  },
  headerContainer: {
    alignContent: "center",
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontFamily: "Lato_700Bold",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    alignContent: "center",
  },
  backIcon: {
    fontWeight: "bold",
    position: "absolute",
    marginBottom: 10,
    left: 10
  },
  save: {
    borderRadius: 30,
    borderColor: "black",
    borderWidth: 3,
    width: 60,
    height: 60,
    position: "absolute",
    top: 80,
    right: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  editImageContainer: {
    height: 130,
    width: 130,
    marginTop: 25,
    marginLeft: 25,
    borderRadius: 70,
    backgroundColor: "white",
    opacity: 0.6,
  },
  emailContainer: {
    marginBottom: 24,
    marginHorizontal: 20,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContainer: {
    marginBottom: 5,
    marginHorizontal: 20,
  },
  emailLabel: {
    fontFamily: "Lato_400Regular",
    fontSize: 16,
    // paddingLeft: 14,
    marginBottom: 8, // Add space between label and input
  },
  label: {
    fontFamily: "Lato_400Regular",
    fontSize: 16,
    paddingLeft: 14,
    marginBottom: 8, // Add space between label and input
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
    // marginBottom: 24,
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
});

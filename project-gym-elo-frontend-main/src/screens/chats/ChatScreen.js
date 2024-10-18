import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SearchBar } from "react-native-elements";
import { useSelector } from "react-redux";
import { getUser } from "../../features/users/userSlice";
import {
  fetchChat,
  fetchChatGroup,
  fetchOtherUser,
  fetchMessage,
} from "../../actions/server";
import { usePusher } from "../../PusherContext";

const ActiveCommunityScreen = ({ navigation }) => {
  const user = useSelector(getUser);
  const [dataLoading, setDataLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [searchData, setSearchData] = useState("");

  const addMessageToChat = (message) => {
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat._id === message.chat
          ? {
              ...chat,
              allMessages: [...chat.allMessages, message],
              lastMessage: message.text,
              lastMessageTime: "0 minutes",
            }
          : chat
      )
    );
  };

  // updates the user's redux to store updated chat information when chat is updated
  const handleNewMember = (chatroom) => {
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat._id === chatroom._id
          ? {
              ...chat,
              userIDs: chatroom.userIDs
            }
          : chat
      )
    );
  };

  const { channel } = usePusher();

  useEffect(() => {
    // Listen for new message events
    channel.bind("notif-event", (data) => {
      addMessageToChat(data.message);
    });
    channel.bind("group-event", (data) => {
      // console.log('pop')
      handleNewMember(data.chatroom);
    });
  }, [channel]);

  useEffect(() => {
    async function getChats() {
      try {
        const allMessages = await fetchMessage(user._id);
        let fetchChats = await Promise.all(
          user.chats.map((id) => fetchChat(id))
        );
        fetchChats = fetchChats.filter((chat) => chat._id);

        for (let item of fetchChats) {
          item.name = await getName(item);
          item.profilePic = await getProfilePics(item);
          item.allMessages = allMessages[item._id].sort(
            (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
          );
          const lastMessage =
            allMessages[item._id][allMessages[item._id].length - 1];
          if (lastMessage) {
            item.lastMessage = lastMessage.text;
          } else {
            item.lastMessage = "";
          }

          if (lastMessage) {
            //gotten from stackoverflow
            const givenDateTime = new Date(lastMessage.updatedAt);
            const currentDateTime = new Date();
            const differenceInMilliseconds = currentDateTime - givenDateTime;
            const minutes = Math.floor(differenceInMilliseconds / 1000 / 60);
            const hours = Math.floor(differenceInMilliseconds / 1000 / 60 / 60);
            const days = Math.floor(
              differenceInMilliseconds / 1000 / 60 / 60 / 24
            );
            if (days == 1) {
              item.lastMessageTime = `${days} day`;
            } else if (days > 1) {
              item.lastMessageTime = `${days} days`;
            } else if (hours >= 1) {
              item.lastMessageTime = `${hours} hours`;
            } else {
              item.lastMessageTime = `${minutes} minutes`;
            }
          } else {
            item.lastMessageTime = "";
          }
        }
        setChats(fetchChats);
      } catch (error) {
        console.error(error);
      }
    }

    async function getName(item) {
      let profilePic = "";
      try {
        if (item.chatType) {
          const groupInfo = await fetchChatGroup(item._id);
          profilePic = groupInfo.name;
        } else {
          const otherUserID = item.userIDs.find((id) => id !== user._id);
          const otherUser = await fetchOtherUser(otherUserID);
          profilePic = otherUser.firstName;
        }
        return profilePic;
      } catch (error) {
        console.error(error);
        return "";
      }
    }

    async function getProfilePics(item) {
      let profilePic = "";
      try {
        if (item.chatType) {
          const groupInfo = await fetchChatGroup(item._id);
          profilePic = groupInfo.icon;
        } else {
          const otherUserID = item.userIDs.find((id) => id !== user._id);
          const otherUser = await fetchOtherUser(otherUserID);
          profilePic = otherUser.profilePic;
        }
        return profilePic;
      } catch (error) {
        console.error(error);
        return "";
      }
    }

    if (user.chats) {
      getChats().finally(() => setDataLoading(false));
    }
  }, [user]);

  const updateSearch = (search) => {
    setSearchData(search);
  };
  const handleGroupPress = (groupData) => {
    navigation.navigate("GroupChat", {
      group: { groupData },
      addMessageToChat,
    });
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
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.groupHeaderContainer}>
        <Text style={styles.headerText}>Messages</Text>
      </SafeAreaView>
      <SearchBar
        placeholder="Search"
        onChangeText={updateSearch}
        value={searchData}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInputText}
      />
      {user.chats.length == 0 && (
        <SafeAreaView style={styles.emptyMessageContainer}>
          <Text style={[styles.emptyMessageText, { marginTop: -100 }]}>
            You are not a member of any chats
          </Text>
        </SafeAreaView>
      )}

      {user.chats.length > 0 && (
        <FlatList
          data={chats}
          style={{marginTop: 2, paddingTop: 58}}
          renderItem={({ item }) =>
            item.name.toLowerCase().startsWith(searchData.toLowerCase()) && (
              <>
                <TouchableOpacity
                  onPress={() => handleGroupPress(item)}
                  style={styles.groupItem}
                >
                  <SafeAreaView style={styles.picData}>
                    {item.chatType && (
                      <Image
                        source={{ uri: item.profilePic }}
                        style={styles.individualIcon}
                      />
                    )}
                    {!item.chatType && (
                      <Image
                        source={{ uri: item.profilePic }}
                        style={styles.groupIcon}
                      />
                    )}
                    <SafeAreaView>
                      <Text style={styles.chatName}>{item.name}</Text>
                      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                    </SafeAreaView>
                  </SafeAreaView>
                  <SafeAreaView>
                    <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
                    <Text></Text>
                  </SafeAreaView>
                </TouchableOpacity>
                <SafeAreaView style={styles.bottomBorder}></SafeAreaView>
              </>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  groupHeaderContainer: {
    borderColor: "black",
    borderBottomWidth: 1,
  },
  headerText: {
    marginTop: 15,
    marginVertical: 10,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    paddingVertical: 15,
  },
  picData: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  bottomBorder: {
    marginHorizontal: 20,
    borderBottomWidth: 0.25,
  },
  groupIcon: {
    width: 60,
    height: 60, // Adjust the height to fit your design
    marginRight: 10,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden", // Ensure the icon is properly clipped
  },
  individualIcon: {
    width: 60,
    height: 60, // Adjust the height to fit your design
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden", // Ensure the icon is properly clipped
  },
  searchContainer: {
    position: "absolute",
    zIndex: 999,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderBottomWidth: 0,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignSelf: "center",
    top: 110,
    width: "100%"
  },
  searchInputContainer: {
    backgroundColor: "white",
    height: 40,
    borderRadius: 20,
    paddingLeft: 15,
    borderColor: "#E1EBED",
    width: "85%",
    alignSelf: "center"
  },
  searchInputText: {
    fontFamily: "Lato_400Regular",
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
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textTransform: "capitalize",
  },
  lastMessage: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "500",
  },
  chatTime: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "500",
    color: "black",
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
  },
});

export default ActiveCommunityScreen;

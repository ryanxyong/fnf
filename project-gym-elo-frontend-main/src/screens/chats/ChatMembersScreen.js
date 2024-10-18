import * as React from "react";
import { useState, useEffect } from "react";
import {
	SafeAreaView,
	StyleSheet,
  useWindowDimensions,
	Text,
	FlatList,
	Pressable,
	Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { SearchBar } from 'react-native-elements'
import Modal from "react-native-modal";
import { useSelector, useDispatch } from "react-redux";
import { EvilIcons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { 
  fetchOtherUser, 
  findDM, 
  fetchMessage, 
  updateGroup,
  updateChat,
  updateUser, 
  fetchChat,
  fetchChatGroup,
  updateEvent,
  fetchGroup
} from "../../actions/server";
import { getUser, removeAllEvents, removeChat } from "../../features/users/userSlice";


const ChatMembersScreen = ({ navigation, route }) => {

    const dispatch = useDispatch();

    const chatID = route.params.chatID;
    const chatType = route.params.chatType;
    const userIDs = route.params.users;
    const user = useSelector(getUser);

    const [dataLoading, setDataLoading] = useState(true);

    const [groupAdmin, setGroupAdmin] = useState([])
    const [adminInfo, setAdminInfo] = useState([]);
    const [membersInfo, setMembersInfo] = useState([]);
    const [genericPeople, setGenericPeople] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [activeMember, setActiveMember] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [groupID, setGroupID] = useState(null);

    const [searchData, setSearchData] = useState("");

    const layout = useWindowDimensions();
    const modalWidth = layout.width * 0.9;

    useEffect(() => {

      const findGroup = async () => {
        return await fetchChatGroup(chatID);
      }

      const getGroupPeopleInfo = async (groupData) => {
        try {          
          let newAdmin = [];
          for (i in groupData.admin) {
            let personInfo = await fetchOtherUser(groupData.admin[i]);
            newAdmin.push(personInfo);
          }
          setAdminInfo(newAdmin);

          let newMembers = [];
          for (i in groupData.members) {
            let personInfo = await fetchOtherUser(groupData.members[i]);
            newMembers.push(personInfo);
          }
          setMembersInfo(newMembers);

          setDataLoading(false);
        } catch (error) {
          console.error(error);
        }
      };

      const getPeopleInfo = async () => {
        try {          
          let newPeople = [];
          for (i in userIDs) {
            let personInfo = await fetchOtherUser(userIDs[i]);
            newPeople.push(personInfo);
          }
          setGenericPeople(newPeople);

          setDataLoading(false);
        } catch (error) {
          console.error(error);
        }
      };

      const fetchData = async () => {
        try {
          const groupData = await findGroup();

    
          if (groupData) {
            setGroupID(groupData._id);
            setGroupAdmin(groupData.admin);
            await getGroupPeopleInfo(groupData);
          } else {
            await getPeopleInfo();
          }
        } catch (error) {
          console.error(error);
        }
      };
    
      fetchData();
    }, [dataLoading]);


    const getAllMessages = async (chatInfo) => {
        try {
          const allUserMessages = await fetchMessage(user._id);
  
          const sortedMessages = allUserMessages[chatInfo._id]
            .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
  
          return {
            groupData: {
              ...chatInfo,
              allMessages: sortedMessages
            }
          };
            
            
        } catch (error) {
          console.error(error);
        }
    }
  
    
    const addMessageToChat = (message) => {
      setChats(currentChats =>
        currentChats.map(chat =>
          chat._id === message.chat
            ? { ...chat, allMessages: [...chat.allMessages, message], lastMessage: message.text, lastMessageTime: '0 minutes' }
            : chat
        )
      );
    };

    const updateSearch = ( search ) => {
      setSearchData(search);
    }

    const toggleModal = (turnOn, member) => {
      if (turnOn && member) {
        if (member._id !== user._id) {
          setActiveMember(member);
          setModalVisible(true);
        }
      }
      else {
        setModalVisible(false);
      }
    }

    const createDM = (member) => {
      if ((member._id !== user._id) && (member && user)) {

        const searchForDM = async () => {
          const resp = await findDM(user._id, member._id);
          // if there exists a chatroom, type=false and contains both _id's
          // navigate to that groupchatscreen
          if (resp) {
            const chat = await getAllMessages(resp[0]);
            toggleModal(false);
            navigation.navigate("GroupChat", { group: chat, addMessageToChat });
          } else {
            toggleModal(false);
            navigation.navigate("DummyChat", { user: user, other: member });
          }
        }

        searchForDM();
      }
    }

    const kickMember = async (member) => {
      if (groupMembers.includes(member._id)) {
        toggleModal(false);
        // update group backend with removed member
        const mockMembers = groupMembers.filter((item) => item !== member._id);
        const updatedGroup = await updateGroup(groupID, {members: mockMembers});

        // update chatRoom backend with removed user
        const chatData = await fetchChat(groupChatID);
        const mockUsers = chatData.userIDs.filter((item) => item !== member._id);
        const updatedChat = await updateChat(chatData._id, {userIDs: mockUsers});


        // update member's backend with removed group & chat
        const mockGroups = member.groups.filter((item) => item !== groupID);
        const mockChats = member.chats.filter((item) => item !== groupChatID);
        const updatedMember = await updateUser(member._id, {groups: mockGroups, chats: mockChats});

      }
      navigation.navigate("CommunityInfoScreen", { 
        communityID: groupID, 
        refreshKey: Math.random().toString(36).substring(7) 
      });
    }

    const leavingAlert = () => {
      if (chatType) {
        Alert.alert("Are you sure you want to leave this community's chat? This action cannot be undone!", "", [
          {
            text: "Leave Chat",
            onPress: () => {
              leaveChat();
              navigation.navigate("ChatScreen");
            },
          },
          {
            text: "Cancel",
            onPress: () => {},
            style: "cancel",
          },
        ],);
      } else {
        Alert.alert("Are you sure you want to leave this chat?", "", [
          {
            text: "Leave Chat",
            onPress: () => {
              leaveChat();
              navigation.navigate("ChatScreen");
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

    // const leaveGroup = async () => {
    //   console.log("GROUPPPPPPPP");
    //   const group = await fetchGroup(groupID);
    //   console.log(group.members);
    //   console.log(user._id);
    //   let mockAutoAdd = [];
    //   let mockAdmin = [];
    //   let mockMembers = [];
    //   if (group.autoAdd) {
    //     mockAutoAdd = [...group.autoAdd];
    //     if (group.autoAdd.includes(user._id)) {
    //       mockAutoAdd = mockAutoAdd.filter((item) => item !== user._id);
    //     }
    //   }
    //   if (group.admin) {
    //     mockAdmin = [...group.admin];
    //     if (group.admin.includes(user._id)) {
    //       mockAdmin = mockAdmin.filter((item) => item !== user._id);
    //     }
    //   }
    //   if (group.members) {
    //     mockMembers = [...group.members];
    //     if (group.members.includes(user._id)) {
    //       mockMembers = mockMembers.filter((item) => item !== user._id);
    //     }
    //   }
  
    //   const updateData = async () => {
    //     let updatedGroup = { ...group };
    //     updatedGroup.members = mockMembers;
    //     updatedGroup.admin = mockAdmin;
    //     updatedGroup.autoAdd = mockAutoAdd;

    //     let updatedGroups = [...user.groups];
    //     updatedGroups = updatedGroups.filter((item) => item !== group._id);

    //     // update user redux
    //     dispatch(removeGroup(group._id));
    //     // update user backend
    //     await updateUser(user._id, { groups: updatedGroups });
    //     // update group backend
    //     const updatedgroup = await updateGroup(group._id, updatedGroup);
    //     return updatedgroup;
    //   };
  
    //   const updatedGroup = await updateData();

    //   const allEvents = group.events;
    //   console.log("ALL EVENTS");
    //   console.log(allEvents);

    //   const yesterday = new Date();
    //   yesterday.setDate(yesterday.getDate() - 1);

    //   if (allEvents.length > 0 && user.events.length > 0) {
    //     let allEventData = [];
    //     allEvents.forEach(async (event) => {
    //       const data = await fetchEvent(event);
    //       allEventData.push(data);
    //     });
    //     const filteredEvents = allEventData.filter((event) => {
    //       if (event.date) {
    //         dateArray = event.date.split("/");
    //         const eventDate = new Date(
    //           parseInt(dateArray[2]),
    //           parseInt(dateArray[0]) - 1,
    //           parseInt(dateArray[1])
    //         );
    //         return eventDate >= yesterday;
    //       }
    //     });

    //     if (filteredEvents.length > 0) {
    //       let updatedUserEvents = [...user.events];

    //       filteredEvents.forEach(async (event) => {
    //         updatedUserEvents.filter((item) => item !== event._id);
    //         let updatedMembers = [...event.members];
    //         updatedMembers.filter((item) => item !== user._id);
    //         let updatedEvent = await updateEvent(event._id, {members: updatedMembers});
    //       });

    //       const updatedUser = await updateUser(user._id, {events: updatedUserEvents});
    //       dispatch(removeAllEvents(filteredEvents));
    //     }
    //   }      

    // };

    const leaveChat = async () => {
      // remove chat from user.chats
      let newChats = [...user.chats];
      newChats = newChats.filter((item) => item !== chatID);

      const userNoChat = await updateUser(user._id, {chats: newChats});

      // update user redux
      dispatch(removeChat(chatID));
      
      // remove user from chat
      const chatData = await fetchChat(chatID);

      let newChatUsers = [...chatData.userIDs];
      newChatUsers = newChatUsers.filter((item) => item !== user._id);
      const updatedChat = await updateChat(chatID, {userIDs: newChatUsers});

    }

    const MembersList = ({ members, admin }) => {
      return (
        <SafeAreaView>
          {admin && (
            <FlatList
              numColumns={2}
              style={{alignSelf: "center"}}
              contentContainerStyle={{
                justifyContent: "space-around",
                paddingHorizontal: 10,
              }}
              data={members}
              renderItem= {({ item }) => (
                <MemberBox member={item} />
              )}
            />
          )}
          {!admin && (
            <FlatList
              numColumns={2}
              style={{alignSelf: "center", marginBottom: 105}}
              contentContainerStyle={{
                justifyContent: "space-around",
                paddingHorizontal: 10,
              }}
              data={members}
              renderItem= {({ item }) => (
                <MemberBox member={item} />
              )}
            />
          )}
        </SafeAreaView>
      )
    }

    const MemberBox = ({ member }) => {
      if (member.firstName && member.lastName) {
        const memberName = member.firstName.concat(' ', member.lastName);

        if (memberName.startsWith(searchData)) {
          return (
            <SafeAreaView style={{marginHorizontal: 6, marginBottom: 6}}>
              <Pressable 
                style={styles.memberContainer}
                onPress={() => {toggleModal(true, member)}}
              >
                <Image style={styles.profilePic} source={{uri: member.profilePic}}/>
                <Text style={styles.memberNameText} numberOfLines={1}>{memberName}</Text>
              </Pressable>
            </SafeAreaView>
          )
        }
      }
    }

  if (dataLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }
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
                      onPress={() => navigation.navigate("CommunityInfoScreen", { 
                        communityID: groupID, 
                        refreshKey: Math.random().toString(36).substring(7) 
                      })}
                  />
                  <Text style={styles.headerText}> Members</Text>
                  <MaterialCommunityIcons
                      name="exit-run"
                      size={40}
                      color="red"
                      style={styles.leaveIcon}
                      onPress={() => leavingAlert()}
                  />

                </SafeAreaView>

                <SafeAreaView>
                  { chatType && (
                    <>
                      <SearchBar
                        placeholder="Search"
                        onChangeText={updateSearch}
                        value={searchData}
                        containerStyle={styles.searchContainer}
                        inputContainerStyle={styles.searchInputContainer}
                        inputStyle={styles.searchInputText}
                      />
                      <Text style={styles.subHeaderText}>Admin</Text>
                      <MembersList members={adminInfo} admin={true}/>
                      <Text style={styles.subHeaderText}>Members</Text>
                      <MembersList members={membersInfo} admin={false}/>
                    </>
                  )}
                  { !chatType && (
                    <SafeAreaView style={{marginTop: 40}}>
                      <MembersList members={genericPeople} admin={false}/>
                    </SafeAreaView>
                  )}
              </SafeAreaView>
            </SafeAreaView>
          }
        />
        {activeMember && (
            <SafeAreaView style={styles.popupContainer}>
            <Modal
              style={styles.modalContainer}
              isVisible={modalVisible}
              swipeDirection={[]}
            >
              <SafeAreaView
                style={[styles.modalContainer, { width: layout.width }]}
              >
                {/* Modal content */}
                  <SafeAreaView
                    style={[styles.modalContent, { width: modalWidth }]}
                  >
                    {/* Close button in the top left */}
                    <SafeAreaView>
                      <Pressable
                        style={styles.closeButton}
                        onPress={() => {toggleModal(false)}}
                      >
                        <AntDesign name="close" size={30} color="#000" />
                      </Pressable>
                    </SafeAreaView>

                    <SafeAreaView>
                      <Image style={styles.profilePicFocused} source={{uri: activeMember.profilePic}}/>
                    </SafeAreaView>
                    {/* Buttons */}
                    { genericPeople.length == 0 && (
                      <>
                      <Pressable
                        style={styles.dmBtn}
                        onPress={() => {createDM(activeMember)}}
                      >
                      <Text style={[styles.memberNameText, {color: "white", paddingVertical: 2}]}>Direct Message</Text>
                      </Pressable>
                      { !groupAdmin.includes(activeMember._id) && groupAdmin.includes(user._id) && (
                        <Pressable
                          style={styles.kickBtn}
                          onPress={() => kickMember(activeMember)}
                        >
                          <Text style={[styles.memberNameText, {color: "white", paddingVertical: 2}]}>Remove From Group</Text>
                        </Pressable>
                      )}
                      </>
                    )}
                  </SafeAreaView>
              </SafeAreaView>
            </Modal>
          </SafeAreaView>
        )}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
    headerContainer: {
        flexDirection: "row",
        paddingVertical: 10,
        justifyContent: "space-between",
        marginLeft: 12,
        marginRight: 22
	},
    headerText: {
        fontFamily: "Lato_700Bold",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    backIcon: {
        fontWeight: "bold",
        marginBottom: 10,
    },
    leaveIcon: {
      fontWeight: "bold",
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: .6,
        height: .6,
      },
      shadowOpacity: 0.3,
      shadowRadius: 1,
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
      borderWidth: 1
    },
    searchInputText: {
      fontFamily: "Lato_400Regular",
    },
    subHeaderText: {
      fontFamily: "Lato_700Bold",
      fontSize: 22,
      alignSelf: "center",
      paddingVertical: 15,
    },
    memberContainer: {
      width: 170,
      height: 170,
      backgroundColor: "#fff",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    profilePic: {
      height: 120,
      width: 120,
      marginTop: 10,
      alignSelf: "center",
      borderRadius: 60,
      overflow: "hidden",
    },
    profilePicFocused: {
      height: 150,
      width: 150,
      marginTop: -50,
      marginBottom: 8,
      alignSelf: "center",
      borderRadius: 75,
      overflow: "hidden",
    },
    memberNameText: {
      fontFamily: "Lato_700Bold",
      fontSize: 16,
      alignSelf: "center",
      paddingVertical: 5,
      maxWidth: 150
    },
    popupContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 75,
      paddingLeft: 10,
    },
    modalContent: {
      backgroundColor: "white",
      justifyContent: "left",
      backgroundColor: "#fff",
      borderRadius: 10,
    },
    closeButton: {
      paddingLeft: 20,
      paddingVertical: 20,
      width: 80,
    },
    dmBtn: {
      width: 300,
      backgroundColor: "#00693e",
      borderRadius: 10,
      padding: 8,
      marginVertical: 15,
      alignItems: "center",
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3,
    },
    kickBtn: {
      width: 300,
      backgroundColor: "red",
      borderRadius: 10,
      padding: 8,
      marginBottom: 15,
      alignItems: "center",
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3,
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

export default ChatMembersScreen;

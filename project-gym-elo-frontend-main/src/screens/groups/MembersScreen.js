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
  ActivityIndicator
} from "react-native";
import { SearchBar } from 'react-native-elements'
import Modal from "react-native-modal";
import { useSelector, useDispatch } from "react-redux";
import { EvilIcons, AntDesign } from "@expo/vector-icons";
import { 
  fetchOtherUser, 
  findDM, 
  fetchMessage, 
  updateGroup,
  updateChat,
  updateUser, 
  fetchChat
} from "../../actions/server";
import { getUser } from "../../features/users/userSlice";


const MembersScreen = ({ navigation, route }) => {

    const dispatch = useDispatch();

    const groupID = route.params.groupID;
    const groupAdmin = route.params.groupAdmin;
    const groupMembers = route.params.groupMembers;
    const groupChatID = route.params.chatID;
    const user = useSelector(getUser);

    const [dataLoading, setDataLoading] = useState(true);

    const [adminInfo, setAdminInfo] = useState([]);
    const [membersInfo, setMembersInfo] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [activeMember, setActiveMember] = useState(null);
    const [chatData, setChatData] = useState(null);

    const [searchData, setSearchData] = useState("");

    const layout = useWindowDimensions();
    const modalWidth = layout.width * 0.9;

    useEffect(() => {

      const getPeopleInfo = async () => {
        try {          
          let newAdmin = [];
          for (i in groupAdmin) {
            let personInfo = await fetchOtherUser(groupAdmin[i]);
            newAdmin.push(personInfo);
          }
          setAdminInfo(newAdmin);

          let newMembers = [];
          for (i in groupMembers) {
            let personInfo = await fetchOtherUser(groupMembers[i]);
            newMembers.push(personInfo);
          }
          setMembersInfo(newMembers);

          setDataLoading(false);
        } catch (error) {
          console.error(error);
        }
      };

      getPeopleInfo();

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
            navigation.navigate("DummyChatScreen", { user: user, other: member });
          }
        }

        searchForDM();
      }
    }

    const promoteMember = async (member) => {
      if (groupMembers.includes(member._id)) {
        toggleModal(false);
        // update group backend with promoted member
        const mockMembers = groupMembers.filter((item) => item !== member._id);
        let mockAdmin = [...groupAdmin];
        mockAdmin.push(member._id);
        const updatedGroup = await updateGroup(groupID, {members: mockMembers, admin: mockAdmin});

      }
      navigation.navigate("CommunityInfoScreen", { 
        communityID: groupID, 
        refreshKey: Math.random().toString(36).substring(7) 
      });
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
                </SafeAreaView>

                <SafeAreaView>
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
                    <Pressable
                      style={styles.dmBtn}
                      onPress={() => {createDM(activeMember)}}
                    >
                      <Text style={[styles.memberNameText, {color: "white", paddingVertical: 2}]}>Direct Message</Text>
                    </Pressable>
                    { !groupAdmin.includes(activeMember._id) && groupAdmin.includes(user._id) && (
                      <>
                        <Pressable
                          style={styles.promoteBtn}
                          onPress={() => promoteMember(activeMember)}
                        >
                          <Text style={[styles.memberNameText, {color: "white", paddingVertical: 2}]}>Make User an Admin</Text>
                        </Pressable>
                        <Pressable
                          style={styles.kickBtn}
                          onPress={() => kickMember(activeMember)}
                        >
                          <Text style={[styles.memberNameText, {color: "white", paddingVertical: 2}]}>Remove From Group</Text>
                        </Pressable>
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
	},
    headerText: {
        fontFamily: "Lato_700Bold",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        marginLeft: "23%"
    },
    backIcon: {
        fontWeight: "bold",
        marginBottom: 10,
        marginLeft: 10,
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
    promoteBtn: {
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

export default MembersScreen;

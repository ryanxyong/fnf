import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { fetchOtherUser } from "../../actions/server";
import { getUser } from "../../features/users/userSlice";
import { postMessage } from "../../actions/server";
import { usePusher } from "../../PusherContext";

export default function GroupChatScreen({ route, navigation }) {
  const groupData = route.params.group.groupData;
  // console.log("data", groupData);
  const addMessageToChat = route.params.addMessageToChat;
  const user = useSelector(getUser);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(groupData.allMessages);
  const [dataLoading, setDataLoading] = useState(true);
  const [userMap, setUserMap] = useState({});
  const [notAlerted, setNotAlerted] = useState(true);
  const { channel } = usePusher();
  const flatListRef = useRef();
  let prevSender = messages ? messages.length > 0 ? messages[messages. length - 1].sender : null : null;
  
  // flatListRef.current.scrollToEnd({ animated: true });

    // from ChatGPT
    useEffect(() => {
      // Auto scrolls to bottom on new chat message
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, [messages]);

    useEffect(() => {
      if (!dataLoading && messages.length > 0) {
        setTimeout(() => {
          if (flatListRef.current) {
            // Auto scrolls to bottom when data loaded and have chats
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 900);
      }
    }, [dataLoading, messages]);
    // end ChatGPT code

  useEffect(() => {
    channel.bind("msg-event", (data) => {
      // Add the new message to the existing messages state if same chat
      if (data.message.chat === groupData._id) {
        const showSenderName =
          messages.length === 0 || data.message.sender !== prevSender;
        // console.log(showSenderName, messages.length === 0, prevSender, data.message.sender)
        const msg = { ...data.message, showSenderName } // should make names appear on new messages
        // console.log("asdfasdfasdf", messages)
        prevSender = data.message.sender
        // console.log(prevSender)
        setMessages((currentMessages) => [...currentMessages, msg]);
        // console.log("ASDFASDFSADFSASD", messages)
      };

    });

    async function getUserMap2(id) {
      try {
        const userInfo = await fetchOtherUser(id);
        return { id, userInfo };
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    async function updateUserMap(ids) {
      try {
        const promises = ids.map((id) => getUserMap2(id));
        const results = await Promise.all(promises);
        let usersInfo = { ...userMap };
        results.forEach((result) => {
          if (result) usersInfo[result.id] = result.userInfo;
        });
        const processedMessages = messages.map((message, index, array) => {
          const showSenderName =
            index === 0 || message.sender !== array[index - 1].sender;
          return { ...message, showSenderName };
        });
        setMessages(processedMessages);
        setUserMap(usersInfo);

      } catch (error) {
        console.log("Error in updateUserMap", error);
      }
    }

    channel.bind("group-event", (data) => {
      console.log("group-event received", data);
      if (data.chatroom._id === groupData._id && data.chatroom.userIDs.length > groupData.userIDs.length) {
        updateUserMap(data.chatroom.userIDs);
      };
    })

    // channel.unbind("group-event");

    // channel.unbind('msg-event');
  }, [channel]);

  useEffect(() => {
    async function getUserMap(id) {
      try {
        const userInfo = await fetchOtherUser(id);
        return { id, userInfo };
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    async function getUserData() {
      try {
        const promises = groupData.userIDs.map((id) => getUserMap(id));
        const results = await Promise.all(promises);
        let usersInfo = { ...userMap };
        results.forEach((result) => {
          if (result) usersInfo[result.id] = result.userInfo;
        });
        const processedMessages = messages.map((message, index, array) => {
          const showSenderName =
            index === 0 || message.sender !== array[index - 1].sender;
          return { ...message, showSenderName };
        });
        setMessages(processedMessages);
        setUserMap(usersInfo);
      } catch (error) {
        console.error(error);
      } finally {
        setDataLoading(false);
      }
    }

    if (groupData) {
      getUserData();
    }
  }, [groupData]);

  useEffect(() => {
    if (groupData.userIDs.length == 1 && notAlerted) {
      Alert.alert("You are the only member of this chat!", "", [
        {
          text: "OK",
          onPress: () => {},
          style: "cancel",
        },
      ]);
      setNotAlerted(false);
    }
  });

  // Function to send a message
  const sendMessage = async () => {
    if (message.trim() !== "") {
      msg = await postMessage({
        sender: user._id,
        text: message,
        chat: groupData._id,
      });
      setMessages([...messages, msg]);
      addMessageToChat(msg);
      prevSender = null;
      setMessage("");
    }
  };

  const MessageRender = ({ message }) => {
    if (message.sender) {
      const sender = message.sender;
      if (message.sender != user._id && userMap[sender]) {
        const firstName = userMap[sender].firstName;
        const lastName = userMap[sender].lastName;
        return (
          <SafeAreaView>
            {message.showSenderName && (
              <SafeAreaView style={styles.messageContainer}>
                <Text style={styles.senderText}>
                  {firstName} {lastName}
                </Text>
              </SafeAreaView>
            )}
            <SafeAreaView style={styles.textMessageContainer}>
              <Text style={styles.messageText}>{message.text}</Text>
            </SafeAreaView>
          </SafeAreaView>
        );
      }

      return (
        <SafeAreaView>
          <SafeAreaView style={styles.youTextMessageContainer}>
            <Text style={styles.youMessageText}>{message.text}</Text>
          </SafeAreaView>
        </SafeAreaView>
      );
    }
  };

  if (dataLoading || !groupData || !user || Object.keys(userMap).length == 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.header}>{groupData.name}</Text>
        <Pressable
          onPress={() =>
            navigation.navigate("ChatMembersScreen", {
              chatID: groupData._id,
              chatType: groupData.chatType,
              users: groupData.userIDs,
              groupData: groupData,
              addMessageToChat: addMessageToChat,
            })
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={26}
            color="black"
            style={{ padding: 2 }}
          />
        </Pressable>
      </SafeAreaView>
      {/* flatlist styling from https://stackoverflow.com/questions/48477500/react-native-flatlist-initial-scroll-to-bottom */}
      <FlatList
        // inverted
        // contentContainerStyle={{ flexDirection: 'column-reverse' }}
        data={messages}
        // data={[...messages].reverse()}
        // ref={(ref) => (this.FlatListRef = ref)}
        ref={flatListRef}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MessageRender message={item} />}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        <SafeAreaView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 16,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  senderText: {
    fontSize: 16,
    fontWeight: "800",
    marginRight: 8,
  },
  textMessageContainer: {
    backgroundColor: "#e6e6e6",
    marginHorizontal: 14,
    marginVertical: 2,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    padding: 8,
    paddingHorizontal: 13,
    fontWeight: "600",
  },
  youMessageContainer: {
    flexDirection: "row-reverse",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  youTextMessageContainer: {
    backgroundColor: "#0066FF",
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  youMessageText: {
    color: "white",
    fontSize: 16,
    padding: 8,
    paddingHorizontal: 13,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F2F2F7",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 20,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    marginTop: 10,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  sendButton: {
    marginTop: 8,
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00693E",
    alignItems: "center",
    justifyContent: "center",
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

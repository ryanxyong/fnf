import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";
import { postChat, updateUser, postMessage, findDM } from "../../actions/server";
import { addChat } from "../../features/users/userSlice";


export default function DummyChatScreen({ route, navigation }) {
  const dispatch = useDispatch();

  const user = route.params.user;
  const member = route.params.other;

  const chatName = user.firstName.concat(' & ', member.firstName);

  const [message, setMessage] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [existingDM, setExistingDM] = useState(null);

  // Function to "send message" and create the chat
  const sendMessage = () => {
      // make a new chat and send it everywhere
      if ((message.trim() !== "") && (!isLeaving)) {
        setIsLeaving(true);

        const newChatRoom = {
          name: chatName,
          chatType: false,
          userIDs: [user._id, member._id]
        }
    
        const makeChat = async () => {
  
          // create new chat
          const chatInfo = await postChat(newChatRoom);
  
          // update user chat redux
          let updatedChats = [...user.chats];
          updatedChats.push(chatInfo._id);
          dispatch(addChat(chatInfo._id));
          
          // update user and member backend chats
          const newUser = await updateUser(user._id, {chats: updatedChats});
          const newOther = await updateUser(member._id, {chats: updatedChats});
  
          // post sent message
          const newMessage = {
            sender: user._id,
            text: message,
            chat: chatInfo._id
          }
  
          const messageInfo = await postMessage(newMessage);
  
          // navigate to the actual chat screen
  
          navigation.navigate("ChatScreen");
        }

        makeChat();
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.header}>{chatName}</Text>
      </SafeAreaView>
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAwareScrollView 
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1, justifyContent: "flex-end"}}
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
        </KeyboardAwareScrollView>
      </SafeAreaView>
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
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
  },
  backBtn: {
    position: "absolute",
    top: 8,
    left: 8
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
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    marginTop: 10,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: "white",
    marginBottom: 20
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

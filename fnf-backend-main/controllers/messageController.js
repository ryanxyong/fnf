/**
 * Controller file for message routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

import { Message } from '../models/messageModel.js';
import { chatRoom } from '../models/chatRoomModel.js';
import { User } from '../models/userModel.js';
import { Group } from '../models/groupModel.js';
import Pusher from 'pusher';


// Create a new instance of Pusher
const pusher = new Pusher({
  appId: "1761614",
  key: '50c9a69251810c14210a',
  secret: "4a43842b19956466f3ad",
  cluster: "us2",
});


// Function: to create a new message object
// Inputs: messageFields, an object with the following fields:
//      sender: String, required
//      text: String, required
//      chat: String, required
// Outputs: the newly created message object
export async function createMessage(request) {
    const newMessage = {
        sender: request.body.sender,
        text: request.body.text,
        chat: request.body.chat,
    };

    const message = await Message.create(newMessage);

    // Ensure the chat room exists and has userIDs
    const chat = await chatRoom.findById(request.body.chat); // Assuming this returns a chat room object
    if (chat && chat.userIDs) { // Check if chat exists and has userIDs
        chat.userIDs.forEach((userId) => {
            if (userId != message.sender) {
                console.log("triggering pusher");
                pusher.trigger(userId, "msg-event", {
                    message: message
                });
                pusher.trigger(userId, "notif-event", {
                    message: message
                });
            }
        });
    } else {
        console.error("Chat room not found or does not contain any user IDs");
        // Handle the error appropriately
    }

    return message;
}


// Function: to get a message object by id
// Inputs: id of the message object
// Outputs: the message object
export async function getMessage(request) {
    const { id }  = request.params;
    const message = await Message.findById(id);
    return message
}

// Function: to get all message objects associated with a chat object
// Inputs: chat ID
// Outputs: an array of all message objects associated with the chat
export async function getMessagesByChat(request) {
    const { id } = request.params; // Keep using the chat ID from the request parameters
    const messages = await Message.find({ chat: id }).sort({ createdAt: -1 }); // Fetch messages for the specified chat ID
    
    // Structure the result as a hash map where the key is the chat ID and the value is the list of messages
    const messagesGroupedByChat = {};
    messagesGroupedByChat[id] = messages; // Assign the fetched messages to the corresponding chat ID

    return messagesGroupedByChat;
}

// Function: to get all message objects associated with a user
// Inputs: user ID
// Outputs: an array of all message objects associated with the user
export async function getMessagesByUser(request) {
    const { id } = request.params; // Assuming this is the user ID
    let messagesGroupedByChat = {};

    // Fetch all chat rooms that include the user
    const chatRooms = await chatRoom.find({ userIDs: id });

    // Convert each chatRoom into a promise to fetch its messages
    // Notice the change here: we are now passing 'room' to the callback function of map
    const chatRoomPromises = chatRooms.map(async (room) => {
        // Now we don't need to find the room by id again, we already have it as 'room'
        const messages = await Message.find({ chat: room._id }).sort({ createdAt: -1 });
        return { chat: room._id, messages: messages };
    });

    // Wait for all message fetches to complete
    const results = await Promise.all(chatRoomPromises);
    results.forEach(result => {
        messagesGroupedByChat[result.chat] = result.messages;
    });

    return messagesGroupedByChat;
}


// Function: to delete a message object
// Inputs: id of the message object
// Outputs: a message confirming the deletion and the deletion of the object
export async function deleteMessage(request) {
    const { id } = request.params;
    const result = await Message.findByIdAndDelete(id);
    return result;
}

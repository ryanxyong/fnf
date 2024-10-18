/**
 * Controller file for chatRoom routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

// Import chatroom model
import { chatRoom } from '../models/chatRoomModel.js';

// Export function to use in route file to create a chat room
// Expects a request
// Returns a room, error handling in route file
export async function createChatRoom(request) {

    const newRoom = new chatRoom({
        name: request.body.name,
        chatType: request.body.chatType,
        userIDs: request.body.userIDs,
    });
    const room = await newRoom.save();
    // const newChatRoom = {
    //     name: request.body.name,
    //     chatType: request.body.chatType,
    //     userIDs: request.body.userIDs,
    // };
    // Await creation of room 
    // const room = await chatRoom.create(newChatRoom);
    return room;
}

// Export function to use in route file to get all chat room by id
// Expects a request
// Returns a chat room, error handling in route file
export async function getChatRoom(request) {
    const { id }  = request.params;
    // Await finding room by id -- no longer name
    const room = await chatRoom.findById(id);
    return room;
}

// Export function to use in route file to delete chat room
// Expects a request
// Returns the result of deletion, error handling in route file
export async function deleteChatRoom(request) {
    const { id } = request.params;
    const result = await chatRoom.findByIdAndDelete(id);
    return result;
}

/**
 * Route file for chatRooms
 * File contains functionality for CRUD operations on security
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from "express";
import {
  createChatRoom,
  getChatRoom,
  deleteChatRoom,
} from "../controllers/chatRoomController.js";
import { chatRoom } from "../models/chatRoomModel.js";
import { requireAuth } from '../services/passport.js';
import Pusher from 'pusher';


// Create a new instance of Pusher
const pusher = new Pusher({
  appId: "1761614",
  key: '50c9a69251810c14210a',
  secret: "4a43842b19956466f3ad",
  cluster: "us2",
});

const router = express.Router();

// Post function to create a chat room
// Expects a chat id, name, chat type and user ids
// Leverages function in the controller file to create chat room
// Returns room or handles error accordingly
router.post("/", requireAuth, async (request, response) => {
  try {
    if (
      !request.body.name ||
      request.body.chatType == null ||
      !request.body.userIDs
    ) {
      return response.status(400).send({ message: "Data missing" });
    }
    const room = await createChatRoom(request);
    console.log(room)
    return response.status(201).send(room);
  } catch (error) {
    // If an error is caught then return a 500 status and the error message
    console.log(error);
    response.status(500).send({ message: error.message });
  }
});

// update group's information by ID
router.put("/update/:id", async (request, response) => {
  try {
    const chatId = request.params.id;
    const result = await chatRoom.findByIdAndUpdate(chatId, request.body, {
      new: true,
    }); // Ensure updated chatRoom is returned

    if (!result) {
      return response.status(404).json({ message: "Chat not found" });
    }

    // const chat = await chatRoom.findById(request.body.chatId); // Assuming this returns a chat room object
    console.log(chatId, result)
    if (result && result.userIDs) { // Check if chat exists and has userIDs
      const last = result.userIDs[result.userIDs. length - 1]
      result.userIDs.forEach((userId) => {
        if (userId != last) {
          console.log("triggering pusher: updating chat for members");
          pusher.trigger(userId, "group-event", {
              chatroom: result
          });
        }
      });
    } else {
      console.error("Failed updating other users: Chat room not found or does not contain any user IDs");
      // Handle the error appropriately
    }

    return response
      .status(200)
      .json({ message: "Chat updated successfully", group: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Get function to get chat room by id
// Expects an id
// Leverages function in the controller file to get chat room by id
// Returns room or handles error accordingly
router.get("/:id", async (request, response) => {
  try {
    const room = await getChatRoom(request); // Use a different variable name like room

    if (room) {
      return response.status(200).send(room);
    } else {
      return response.status(404).send({ message: "Chat room not found" });
    }
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

router.get("/searchDMs/:query1/:query2/", async (request, response) => {
  try {
    console.log("REACHED");
    const user1 = request.params.query1;
    const user2 = request.params.query2;

    const chats = await chatRoom.find({
      chatType: false,
      userIDs: { $all: [user1, user2] }
    });

    if (chats.length > 1) {
      return response.status(409).json({ message: "Error finding DM - multiple DMs exist" });
    }
    else if (chats.length == 0) {
      return response.status(200).json(null);
    }

    return response.status(200).json(chats);
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Delete chat room by id
// Expects an id
// Leverages function in the controller file to delete chat room
// Returns a message or handles error accordingly
router.delete("/:id", requireAuth, async (request, response) => {
  try {
    const room = await deleteChatRoom(request);
    if (room) {
      return response.status(200).send({ message: "Chat room deleted" });
    }
    return response.status(404).send({ message: "Chat room not found" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;

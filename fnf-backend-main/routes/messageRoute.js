/**
 * Route file for security
 * File contains functionality for CRUD operations on security
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from 'express';
import { createMessage, getMessagesByChat, deleteMessage, getMessagesByUser } from '../controllers/messageController.js';
import { requireAuth } from '../services/passport.js';

const router = express.Router();

// Route to post a new message
// Requires authentication
// Leverages the createMessage function from messageController.js
router.post('/', requireAuth, async (request, response) => {
    try {
        if (!request.body.sender ||
            !request.body.text ||
            !request.body.chat) {
            return response.status(400).send({ message: 'Data missing' });
        }

        const message = await createMessage(request);

        return response.status(201).send(message);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// gets messages for a given id
// Leverages the getMessagesByChat function from messageController.js
router.get('/:id', async (request, response) => {
    try {
        const messages = await getMessagesByChat(request);

        // Extract the 'message' property from each message
        return response.status(200).send(messages);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// gets messages for a given chatroom id
// Leverages the getMessagesByUser function from messageController.js
router.get('/chat/:id', async (request, response) => {
    try {
        const messages = await getMessagesByUser(request);

        // // Extract the 'message' property from each message
        // const messagesContent = res[0].text;
        // const cursor = res[1];
        return response.status(200).send({ messages: messages });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Don't actually think we need, can easily reimplement if so
// get message content by chat room id
// router.get('/ /:id', async (request, response) => {
//     try {
//         const messages = await Message.find({ chatID: request.params.id });
//         return response.status(200).send(messages);
//     } 
//     catch (error) {
//         console.log(error.message);
//         response.status(500).send({ message: error.message });
//     }
// });


// delete message by id
// Leverages the deleteMessage function from messageController.js
router.delete('/:id', requireAuth, async (request, response) => {
    try {
        const deletedMessage = await deleteMessage(request);
        if (!deletedMessage) {
            return response.status(404).send({ message: 'Message not found' });
        }
        return response.status(200).send({ message: 'Message deleted successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;


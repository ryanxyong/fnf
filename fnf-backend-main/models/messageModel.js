/**
 * Model file for message schema
 * Models are designed based on spec, then meshed in order to work with front end
 * these are leveraged in the routes in order to ensure that data is being handled correctly
 * and that the database is being interacted with in a consistent manner
 */
import mongoose from 'mongoose';

// Define the message schema
const messageSchema = new mongoose.Schema({
    // Assuming 'id' is automatically handled by MongoDB as '_id'
    sender: { // Renamed from senderID
        type: String,
        required: true,
    },
    text: { // Renamed from message
        type: String,
        required: true,
    },
    // chatID remains as is if it's used for identifying different chats
    chat: {
        type: String,
        required: true
    }
},
{
    timestamps: true,
});

export const Message = mongoose.model('Message', messageSchema);

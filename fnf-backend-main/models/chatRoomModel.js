/**
 * Model file for chatRoom schema
 * Models are designed based on spec, then meshed in order to work with front end
 * these are leveraged in the routes in order to ensure that data is being handled correctly
 * and that the database is being interacted with in a consistent manner
 */

import mongoose from 'mongoose';

// Schema for chat room
// Following from the document 

// Required:
// chatID: string
// name: string
// chatType: boolean
// userIDs: array

// Timestamps will also be used

const chatRoomSchema = new mongoose.Schema({
    // name: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    // ,
    name: { type: String, required: true }
    ,
    chatType: {
        type: Boolean,
        required: true,
    },
    userIDs: {
        type: Array,
        required: true,
    },
},
    {
        timestamps: true,
    }
);

export const chatRoom = mongoose.model('Chat room', chatRoomSchema);

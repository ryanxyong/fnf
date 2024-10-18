/**
 * Model file for events schema
 * Models are designed based on spec, then meshed in order to work with front end
 * these are leveraged in the routes in order to ensure that data is being handled correctly
 * and that the database is being interacted with in a consistent manner
 */

import mongoose from "mongoose";

// New Event schema based on the frontend requirements

const eventSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        groupName: {
            type: String,
            required: true, // Assuming the groupName is required as per frontend data
        },
        date: {
            type: String, // Changing to String to accommodate separate date and time if necessary
            required: true,
        },
        time: {
            type: String, // Adding time as a separate field as per frontend data
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true, // Set to true based on frontend showing descriptions for events
        },
        members: {
            type: [String],
            required: false, // Set false as it's empty in frontend, adjust based on actual use
        },
        communityID: {
            type: String,
            required: true, // Assuming communityID is required
        },
    },
    {
        timestamps: true, // Keeping timestamps for creation and update tracking
    }
);

export const Event = mongoose.model('Event', eventSchema);

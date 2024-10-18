/**
 * Controller file for event routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */
import { Event } from '../models/eventModel.js';

// Export function to use in the route file
// Create a new event
// Expects a name, date, communityId and isPublic
// Outputs the event or handles error accordingly (error handling done in route file)
export async function createEvent(request) {
    // Updated newEvent object to match the new schema
    const newEvent = {
        name: request.body.name,
        groupName: request.body.groupName, // Added groupName from the request body
        date: request.body.date,
        time: request.body.time, // Added time from the request body
        location: request.body.location, // Added location from the request body
        description: request.body.description, // Added description from the request body
        members: request.body.members || [], // Defaulting to empty if not provided
        communityID: request.body.communityID // Added communityID from the request body
    };

    // Create the event using the updated newEvent object
    const event = await Event.create(newEvent);
    return event;
}

// Export function getEvent which we use in the route file
// Get event by id
// Expects an id
// Gets the event or handles error accordingly (error handling done in route file)
export async function getEvent(request) {
    const { id }  = request.params;
    const event = await Event.findById(id);
    return event
}

// Export function updateEvent to use in the route file
// Update event by id
// Expects an id and request
// Updates the event or handles error accordingly (error handling done in route file)
export async function updateEvent(request) {
    const { id } = request.params;
    const result = await Event.findByIdAndUpdate(id, request.body);
    return result;
}

// Export function deleteEvent to use in the route file
// Delete event by id
// Expects an id
// Deletes the event or handles error accordingly (error handling done in route file)
export async function deleteEvent(request) {
    const { id } = request.params;
    const result = await Event.findByIdAndDelete(id);
    return result;
}
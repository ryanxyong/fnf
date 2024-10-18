/**
 * Route file for events
 * File contains functionality for CRUD operations on events
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from 'express';
import { createEvent, getEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { Event } from '../models/eventModel.js';
import { requireAuth } from '../services/passport.js';

const router = express.Router();

// Functinoality to post a new event
// Leverages the createEvent function from the eventController
// Expects a name, date, communityId and isPublic
// Outputs the event or handles error accordingly
router.post('/', requireAuth, async (request, response) => {
    try {
        // Update the validation to reflect the new required fields based on the updated schema
        if (
            !request.body.name ||
            !request.body.groupName || // Add this line to check for the group name
            !request.body.date ||
            !request.body.time || // Add this line to check for the event time
            !request.body.location || // Add this line to check for the event location
            !request.body.description || // Add this line to check for the event description
            !request.body.communityID // Add this
        ) {
            return response.status(400).send({
                message: 'Send all required fields.'
            });
        }
        
        const event = await createEvent(request);

        return response.status(201).send(event);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Functionality to get all event by id
// Leverages the getEvent function from the eventController
// Expects an id
// Gets the event or handles error accordingly
router.get('/:id', async (request, response) => {
    try {
        const event = await getEvent(request);

        if (!event) {
            return response.status(404).json({ message: 'Event not found' });
        }

        return response.status(200).json(event);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Functionality to get all events
router.get("/getAllEvents/get/", async (request, response) => {
    try {  
      const today = new Date(); // Get today's date
  
      // Format today's date to match event date format
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();
      const todayYear = today.getFullYear();
  
      // Find events whose dates are greater than or equal to today's date
      const events = await Event.find();

      const filteredEvents = events.filter(event => {
        const [streventMonth, streventDay, streventYear] = event.date.split('/');
        const eventMonth = parseInt(streventMonth);
        const eventDay = parseInt(streventDay);
        const eventYear = parseInt(streventYear);
            // Compare each part individually
            if (eventYear > todayYear) {
                return true;
            } else if (eventYear === todayYear) {
                if (eventMonth > todayMonth) {
                    return true;
                } else if (eventMonth === todayMonth) {
                    if (eventDay > todayDay) {
                        return true;
                    }
                }
            }
            return false;
      })

      if (!filteredEvents || filteredEvents.length === 0) {
        return response.status(404).json({ message: "No events found" });
      }
  
      return response.status(200).json(filteredEvents);
    } catch (error) {
      console.error(error.message);
      response.status(500).send({ message: error.message });
    }
  });

// Functionality to update event by id
// Leverages the updateEvent function from the eventController
// Expects an id and request
// Updates the event or handles error accordingly
router.put('/:id', requireAuth, async (request, response) => {
    try {
        if ( // make sure that we have good security to prevent data change for id in frontend
            !request.body.name ||
            !request.body.groupName || // Add this line to check for the group name
            !request.body.date ||
            !request.body.time || // Add this line to check for the event time
            !request.body.location || // Add this line to check for the event location
            !request.body.description || // Add this line to check for the event description
            !request.body.communityID // Add this
        ) {
            return response.status(400).send({
                message: 'Send all required fields.'
            });
        }
        // Await update of event, handle statusese accordingly
        const event = await updateEvent(request);

        if (!event) {
            return response.status(404).json({ message: 'Event not found' });
        }

        return response.status(200).send({ message: 'Event updated successfully '});
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
})

// Functionality to delete event by id
// Leverages the deleteEvent function from the eventController
// Expects an id
// Deletes the event or handles error accordingly
router.delete('/:id', requireAuth,  async (request, response) => {
    try {
        const event = await deleteEvent(request);

        if (!event) {
            return response.status(404).json({ message: 'Event not found' });
        }
        
        return response.status(200).send({ message: 'Event deleted successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
})

export default router;

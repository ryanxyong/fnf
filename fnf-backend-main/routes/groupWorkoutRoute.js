/**
 * Route file for groupWorkouts
 * File contains functionality for CRUD operations on groupWorkouts
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from 'express';
import * as GroupWorkout from '../controllers/groupWorkoutController.js';
import { requireAuth } from '../services/passport.js';

const router = express.Router();


// Route to get all group workouts
// Leverages the getGroupWorkouts function from groupWorkoutController.js
// Also supports posting a new group workout leveraging the createGroupWorkout function from groupWorkoutController.js
router.route('/')
    .get(async (req, res) => {
        try {
            const groupWorkouts = await GroupWorkout.getGroupWorkouts();
            console.log("Got GroupWorkouts");
            res.status(200).json(groupWorkouts);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .post(requireAuth, async (req, res) => {
        try {
            const newWorkout = await GroupWorkout.createGroupWorkout(req.body);
            console.log("New GW", newWorkout)
            res.status(201).json(newWorkout);
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error.message });
        }
    })

// Route to get a group workout by its id
// Leverages the getGroupWorkout function from groupWorkoutController.js
// Also supports updating a group workout leveraging the updateGroupWorkout function from groupWorkoutController.js
// Also supports deleting a group workout leveraging the deleteGroupWorkout function from groupWorkoutController.js
router.route('/:id')
    .get(async (req, res) => {
        try {
            const groupWorkouts = await GroupWorkout.getGroupWorkout(req.params.id);
            res.status(200).json(groupWorkouts);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .put(requireAuth, async (req, res) => {
        try {
            const updatedWorkout = await GroupWorkout.updateGroupWorkout(req.params.id, req.body)
            console.log(updatedWorkout)
            res.status(200).json(updatedWorkout);
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error.message });
        }
    })
    .delete(requireAuth, async (req, res) => {
        try {
            await GroupWorkout.deleteGroupWorkout(req.params.id);
            res.status(200).json({ message: 'Workout deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

export default router;

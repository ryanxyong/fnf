/**
 * Route file for workouts
 * File contains functionality for CRUD operations on workouts
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from 'express';
import * as Workout from '../controllers/workoutController.js';
import { requireAuth } from '../services/passport.js';

const router = express.Router();

// Workout routes

// Base route, just gets workouts
router.route('/')
    .get(async (req, res) => {
        try {
            const workouts = await Workout.getWorkouts();
            res.status(200).json(workouts);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .post(requireAuth, async (req, res) => {
        try {
            // console.log(req);
            const newWorkout = await Workout.createWorkout(req.body);
            // console.log(newWorkout);
            res.status(201).json(newWorkout);
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error.message });
        }
    });

// Specific workout routes
// Expects workout id
// Leverages functionality from workout controller, please see there for more details
router.route('/:id')
    .get(async (req, res) => {
        try {
            const workout = await Workout.getWorkout(req.params.id);
            res.status(200).json(workout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .put(requireAuth, async (req, res) => {
        try {
            const updatedWorkout = await Workout.updateWorkout(req.params.id, req.body)
            res.status(200).json(updatedWorkout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(requireAuth, async (req, res) => {
        try {
            const result = await Workout.deleteWorkout(req.params.id);
            res.status(200).json({ message: result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })

// Exercise routes

// Post exercise to workout route
// Expects workout id
// Leverages functionality from workout controller, please see there for more details
router.route('/:workoutId/exercises')
    .post(requireAuth, async (req, res) => {
        try {
            const updatedWorkout = await Workout.addExerciseToWorkout(req.params.workoutId, req.body);
            res.status(201).json(updatedWorkout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .put(requireAuth, async (req, res) => {
        try {
            const updatedWorkout = await Workout.updateExerciseInWorkout(req.params.workoutId, req.params.exerciseId, req.body);
            res.status(200).json(updatedWorkout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })


// Delete exercise route
// Expects workout id and exercise id
// Leverages functionality from workout controller, please see there for more details
router.route('/:workoutId/exercises/:exerciseId')
    .delete(requireAuth, async (req, res) => {  
        try {
            const updatedWorkout = await Workout.removeExerciseFromWorkout(req.params.workoutId, req.params.exerciseId);
            res.status(200).json(updatedWorkout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .get(requireAuth, async (req, res) => {
        try {
            const exercise = await Workout.getExerciseFromWorkout(req.params.workoutId, req.params.exerciseId);
            res.status(200).json(exercise);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })

// Lift routes

// Post lift route
// Expects workout id and exercise id
// Leverages functionality from workout controller, please see there for more details
router.route('/:workoutId/exercises/:exerciseId/lifts')
    .post(requireAuth, async (req, res) => {
        try {
            const updatedWorkout = await Workout.addLiftToExercise(req.params.workoutId, req.params.exerciseId, req.body);
            res.status(201).json(updatedWorkout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .put(requireAuth, async (req, res) => {
        try {
            const updatedWorkout = await Workout.updateLiftInExercise(req.params.workoutId, req.params.exerciseId, req.params.liftId, req.body);
            res.status(200).json(updatedWorkout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })

// Delete lift route
// Expects workout id, exercise id and lift id
// Leverages functionality from workout controller, please see there for more details
router.route('/:workoutId/exercises/:exerciseId/lifts/:liftId')
    .delete(requireAuth, async (req, res) => {
        try {
            const updatedWorkout = await Workout.removeLiftFromExercise(req.params.workoutId, req.params.exerciseId, req.params.liftId);
            res.status(200).json(updatedWorkout);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .get(async (req, res) => {
        try {
            const lift = await Workout.getLiftFromExercise(req.params.workoutId, req.params.exerciseId, req.params.liftId);
            res.status(200).json(lift);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })

export default router;

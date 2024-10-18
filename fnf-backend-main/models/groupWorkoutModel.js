/**
 * Model file for groupWorkout schema
 * Models are designed based on spec, then meshed in order to work with front end
 * these are leveraged in the routes in order to ensure that data is being handled correctly
 * and that the database is being interacted with in a consistent manner
 */

import mongoose from 'mongoose';

// Define the lift schema
const liftSchema = mongoose.Schema({
    amount: Number,
    reps: Number,
});

// Define the exercise plan schema
const exercisePlanSchema = mongoose.Schema({
    name: String,
    unit: String,
    lifts: [liftSchema],
});

// Define the group workout schema
const groupWorkoutSchema = mongoose.Schema({
    name: { type: String, required: true },
    groupName: { type: String, required: true},
    time: String, // assuming 'time' refers to the duration e.g. "60 min"
    date: String,
    priority: Boolean,
    location: String,
    plan: [exercisePlanSchema],
}, {
    timestamps: true,
});

// Create the group workout model
const GroupWorkoutModel = mongoose.model('groupWorkout', groupWorkoutSchema);

export default GroupWorkoutModel;

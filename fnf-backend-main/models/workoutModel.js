/**
 * Model file for workout and exercise plane schemae
 * Models are designed based on spec designed by Ryan and Sam, then meshed work with front end
 * these are leveraged in the routes in order to ensure that data is being handled correctly
 * and that the database is being interacted with in a consistent manner
 */

import mongoose from "mongoose";

// Exercise plan schema
// Carries all required data structures for the workout plan
const exercisePlanSchema = mongoose.Schema({
  name: String,
  unit: String,
  units: [String],
  max: String,
  lifts: { type: [] },
  _id: {
    type: String,
    unique: true,
    sparse: true,
  },
});


// Workout schema
// Carries all required data structures for the workout
const workoutSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    time: String, // assuming 'time' refers to the duration e.g. "60 min"
    plan: [exercisePlanSchema],
  },
  {
    timestamps: true,
  }
);

// Create a model for the workout schema and export it
const WorkoutModel = mongoose.model("Workout", workoutSchema);

export default WorkoutModel;

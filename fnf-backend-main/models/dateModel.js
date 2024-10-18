/**
 * Model file for date schema
 * Models are designed based on spec, then meshed in order to work with front end
 * these are leveraged in the routes in order to ensure that data is being handled correctly
 * and that the database is being interacted with in a consistent manner
 */

import mongoose from "mongoose";
const { Schema } = mongoose;

// Schema for the exercise object which is nested within the date object
const exerciseSchema = new Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true }, // Assuming only kg and lbs, adjust as necessary
  max: { type: Number, required: false },
  lifts: { type: [], required: true },
  units: { type: [], required: false },
});

// Schema for the date object
const DateSchema = new Schema({
  user: { type: String, required: true },
  workoutData: {
    type: Map,
    of: [exerciseSchema],
  },
  // upsert: true,
});

export const Date = mongoose.model("Date", DateSchema);

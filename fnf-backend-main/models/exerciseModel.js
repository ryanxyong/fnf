// Define the schema for exercises as set out in google doc
// Required:
// exerciseID: string
// name: string
// type: string
// equipment: string

import mongoose from 'mongoose';

const exerciseSchema = mongoose.Schema({
    exerciseID: { type: String, unique: true },
    name: String,
    type: String, // calisthenics, cardio, weights, interval cardio?
    equipment: String,
});

var ExerciseModel = mongoose.model('Exercise', exerciseSchema);

export default ExerciseModel

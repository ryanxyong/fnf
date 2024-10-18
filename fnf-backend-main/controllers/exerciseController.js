import Exercise from '../models/exerciseModel.js';

export async function getExercise(id) {
  const exercise = await Exercise.findById(id).lean();
  if (exercise === null) {
    throw new Error('Exercise not found');
  }
  return exercise;
}

export async function getExercises() {
  const exercises = await Exercise.find().lean();
  return exercises;
}

export async function updateExercise(id, exerciseFields) {
  await Exercise.findByIdAndUpdate(id, exerciseFields);
  const exercise = await Exercise.findById(id);
  if (exercise === null) {
    throw new Error('Exercise not found');
  }
  return exercise;
}

export async function createExercise(exerciseFields) {
  const exercise = new Exercise();
  exercise.exerciseID = exerciseFields.exerciseID;
  exercise.name = exerciseFields.name;
  exercise.type = exerciseFields.type;
  exercise.equipment = exerciseFields.equipment;

  const savedExercise = exercise.save();
  return savedExercise;
}

export async function deleteExercise(id) {
  await Exercise.findByIdAndDelete(id);
  return { msg: `Exercise ${id} deleted successfully.` };
}

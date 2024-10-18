/**
 * Controller file for workout routes
 * All functions are async and return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

import Workout from '../models/workoutModel.js';

// START OF WORKOUT FUNCTIONS

// Function to return workouts
export async function getWorkouts() {
    const workouts = await Workout.find().lean();
    return workouts;
}

// Function: to return a single workout
// Inputs: id of the workout
// Outputs: the workout object
export async function getWorkout(id) {
    const workout = await Workout.findById(id).lean();
    if (!workout) {
        throw new Error('Workout not found');
    }
    return workout;
}

// Function: to create a workout
// Inputs: the data required by the workout object (see workoutModel)
// Outputs: the workout object (see workoutModel
export async function createWorkout(workoutFields) {
    const workout = new Workout({
        name: workoutFields.name,
        time: workoutFields.time,
        plan: workoutFields.plan,
    });
    const savedWorkout = await workout.save();
    return savedWorkout;
}

// Function: to update a workout
// Inputs: id of the workout, the data to update
// Outputs: the updated workout object
export async function updateWorkout(id, workoutFields) {
    const updatedWorkout = await Workout.findByIdAndUpdate(id, workoutFields, { new: true }).lean();
    if (!updatedWorkout) {
        throw new Error('Workout not found');
    }
    return updatedWorkout;
}

// Function: to delete a workout
// Inputs: id of the workout
// Outputs: a message confirming the deletion (and the workout gets deleted)
export async function deleteWorkout(id) {
    await Workout.findByIdAndDelete(id);
    return { msg: `Workout ${id} deleted successfully.` };
}

// END OF WORKOUT FUNCTIONS

// START OF EXERCISE FUNCTIONS

// Function: to add an exercise to a workout
// Inputs: id of the workout, the data required by the exercise object (see workoutModel)
// Outputs: the workout object updated with the exercise
export async function addExerciseToWorkout(workoutId, exerciseData) {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
        throw new Error('Workout not found');
    }
    workout.plan.push(exerciseData);
    await workout.save();
    return workout;
}

// Function: to update an exercise in a workout
// Inputs: id of the workout, id of the exercise, the data to update
// Outputs: the workout object updated with the exercise
export async function updateExerciseInWorkout(workoutId, exerciseId, exerciseData) {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
        throw new Error('Workout not found');
    }
    const exerciseIndex = workout.plan.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) {
        throw new Error('Exercise not found');
    }
    workout.plan[exerciseIndex] = { ...workout.plan[exerciseIndex], ...exerciseData };
    await workout.save();
    return workout;
}

// Function: to remove an exercise from a workout
// Inputs: id of the workout, id of the exercise
// Outputs: the workout object updated without the exercise
export async function removeExerciseFromWorkout(workoutId, exerciseId) {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
        throw new Error('Workout not found');
    }
    workout.plan = workout.plan.filter(ex => ex.id !== exerciseId);
    await workout.save();
    return workout;
}

// Function: to get an exercise from a workout
// Inputs: id of the workout, id of the exercise
// Outputs: the exercise object
export async function getExerciseFromWorkout(workoutId, exerciseId) {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
        throw new Error('Workout not found');
    }
    const exercise = workout.plan.find(ex => ex.id === exerciseId);
    if (!exercise) {
        throw new Error('Exercise not found');
    }
    return exercise;
}

// END OF EXERCISE FUNCTIONS

// START OF LIFT FUNCTIONS

// Function: to add a lift to an exercise
// Inputs: id of the workout, id of the exercise, the data required by the lift object (see workoutModel)
// Outputs: the workout object updated with the lift
export async function addLiftToExercise(workoutId, exerciseId, liftData) {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
        throw new Error('Workout not found');
    }
    const exercise = workout.plan.find(ex => ex.id === exerciseId);
    if (!exercise) {
        throw new Error('Exercise not found');
    }
    exercise.lifts.push(liftData);
    await workout.save();
    return workout;
}

// Function: to update a lift in an exercise
// Inputs: id of the workout, id of the exercise, id of the lift, data for the lift to be updated
// Outputs: the workout object updated
export async function updateLiftInExercise(workoutId, exerciseId, liftId, liftData) {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
        throw new Error('Workout not found');
    }
    const exercise = workout.plan.find(ex => ex.id === exerciseId);
    if (!exercise) {
        throw new Error('Exercise not found');
    }
    const liftIndex = exercise.lifts.findIndex(lift => lift.id === liftId);
    if (liftIndex === -1) {
        throw new Error('Lift not found');
    }
    exercise.lifts[liftIndex] = { ...exercise.lifts[liftIndex], ...liftData };
    await workout.save();
    return workout;
}

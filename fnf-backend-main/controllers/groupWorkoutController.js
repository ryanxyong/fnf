/**
 * Controller file for message routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

import GroupWorkout from '../models/groupWorkoutModel.js';

// Function: to get all group workouts
// Inputs: none
// Outputs: an array of all group workouts
export async function getGroupWorkouts() {
    const groupWorkouts = await GroupWorkout.find().lean();
    return groupWorkouts;
}

// Function: to get a group workout by its id
// Inputs: id, a string
// Outputs: the group workout object with the given id
export async function getGroupWorkout(id) {
    const groupWorkout = await GroupWorkout.findById(id).lean();
    if (!groupWorkout) {
        throw new Error('Group workout not found');
    }
    return groupWorkout;
}

// Function: to create a new group workout
// Inputs: groupWorkoutFields, an object with the following fields:
//      name: String, required
//      groupName: String, required
//      time: String, required
//      date: String, required
//      priority: Boolean, required
//      location: String, required
//      plan: Array, required
// Outputs: the newly created group workout object
export async function createGroupWorkout(groupWorkoutFields) {
    const groupWorkout = new GroupWorkout({
        name: groupWorkoutFields.name,
        groupName: groupWorkoutFields.groupName,
        time: groupWorkoutFields.time,
        date: groupWorkoutFields.date,
        priority: groupWorkoutFields.priority,
        location: groupWorkoutFields.location,
        plan: groupWorkoutFields.plan,
    });
    if (!groupWorkout) {
        throw new Error('Error creating group workout');
    }
    const savedGroupWorkout = await groupWorkout.save();
    console.log(savedGroupWorkout);
    return savedGroupWorkout;
}

// Function: to update a group workout by its id
// Inputs: id, a string
//         groupWorkoutFields, an object with the following fields:
//              name: String
//              groupName: String
//              time: String
//              date: String
//              priority: Boolean
//              location: String
//              plan: Array
// Outputs: the updated group workout object
export async function updateGroupWorkout(id, groupWorkoutFields) {
    const updatedGroupWorkout = await GroupWorkout.findByIdAndUpdate(id, groupWorkoutFields, { new: true }).lean();
    console.log(updatedGroupWorkout)
    if (!updatedGroupWorkout) {
        throw new Error('GroupWorkout not found');
    }
    return updatedGroupWorkout;
}

// Function: to delete a group workout by its id
// Inputs: id, a string
// Outputs: a message indicating the group workout was deleted successfully
export async function deleteGroupWorkout(id) {
    await GroupWorkout.findByIdAndDelete(id);
    return { msg: `GroupWorkout ${id} deleted successfully.` };
}

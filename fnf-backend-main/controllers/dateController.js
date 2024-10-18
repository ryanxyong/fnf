/**
 * Controller file for date routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

import { Date } from '../models/dateModel.js';


// Function: create a date object
// Input: dateFields - object
// Output: savedDate - object
export async function createDate(dateFields) {
    const date = new Date({
        user: dateFields.user,
        workoutData: dateFields.workoutData,
    });
    const savedDate = await date.save();
    return savedDate;
}

// Function: get a date object
// Input: id - string
// Output: date - object
export async function getDates() {
    const dates = await Date.find().lean();
    return dates;
}

// Function: get a date object
// Input: id - string
// Output: date - object
export async function updateDate(id, dateFields) {
    const date = await Date.findByIdAndUpdate(id, dateFields);
    (id, dateFields, { new: true });
    return date;
}

// Function: delete a date object
// Input: id - string
// Output: object
export async function deleteDate(id) {
    await Date.findByIdAndDelete(id);
    return { msg: `Date ${id} deleted successfully.` };
}


// Function: upsert a date object
// Input: userId - string, dateFields - object
// Output: date - object
export async function upsertDate(userId, dateFields) {
    const date = await Date.findOneAndUpdate(
        { user: userId }, // find a document with this user
        { $set: dateFields.dateFields }, // update these fields in the document
        { new: true, upsert: true } // options: return new document, create if not exists
    );
    return date;
}
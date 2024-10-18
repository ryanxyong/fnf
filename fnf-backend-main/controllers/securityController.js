/**
 * Controller file for security routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

import { Security } from '../models/securityModel.js';

// Function: to create a new security object
// Inputs: securityFields, an object with the following fields:
//      userEmail: String, required
//      maiden: String, required
//      teacher: String, required
// Returns: the newly created security object
export async function createSecurity(securityFields) {
    const security = new Security({
        userEmail: securityFields.userEmail,
        maiden: securityFields.maiden,
        teacher: securityFields.teacher,
    });
    const savedSecurity = await security.save();
    return savedSecurity;
}

// Function: to get all security objects
// Inputs: none
// Returns: an array of all security objects
export async function getSecurityAll() {
    const securityAll = await Security.find().lean();
    return securityAll;
}

// Function: to get a security object by id
// Inputs: id of the security object
// Returns: the security object
export async function getSecurity(id) {
    const security = await Security.findById(id).lean();
    return security;
}

// Function: to get a security object by email
// Inputs: email of the security object
// Returns: the security object
export async function getSecurityByEmail(email) {
    const security = await Security.find({ userEmail: email });
    return security;
}

// Function: to update a security object
// Inputs: id of the security object, the data to update
// Returns: the updated security object
export async function updateSecurity(id, securityFields) {
    const security = await Security.findOneAndUpdate(
        { userEmail: id }, 
        { maiden: securityFields.maiden, teacher: securityFields.teacher }
        );
    return security;
}

// Function: to delete a security object
// Inputs: id of the security object
// Returns: a message confirming the deletion
export async function deleteSecurity(id) {
    await Security.findByIdAndDelete(id);
    return { msg: `Security ${id} deleted successfully.` };
}

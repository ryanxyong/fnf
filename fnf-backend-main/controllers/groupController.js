/**
 * Controller file for group routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

import { Group } from '../models/groupModel.js';

// Function: to create a new group object
// Inputs: groupFields, an object with the fields outlined in the group model
// Outputs: the newly created group object
export async function createGroup(groupFields) {  
    console.log("Group being created...")
    console.log(groupFields)

    const newGroup = new Group( {
        name: groupFields.name,
        memberCount: groupFields.memberCount,
        icon: groupFields.icon, // Assuming this is handled differently (e.g., file upload)
        banner: groupFields.banner, // Assuming this is handled differently (e.g., file upload)
        description: groupFields.description, // Assuming optional
        events: groupFields.events,
        permissions: groupFields.permissions,
        members: groupFields.members,
        admin: groupFields.admin,
        type: groupFields.type,
        autoAdd: groupFields.autoAdd,
        location: groupFields.location,
        chat: groupFields.chat
    });
    // Not including 'icon' and 'banner' directly, assuming they are handled differently (e.g., file upload)

    const savedGroup = await newGroup.save();
    return savedGroup
}

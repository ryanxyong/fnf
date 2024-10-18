/**
 * Route file for groupWorkouts
 * File contains functionality for CRUD operations on groupWorkouts
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */


import express from "express";
import { Group } from "../models/groupModel.js";
import { requireAuth } from '../services/passport.js';
import * as GroupController from '../controllers/groupController.js'

const router = express.Router();

// Base route 
// Allows for the creation of a new group
// Leverages the createGroup function from the groupController
router.post("/", requireAuth, async (request, response) => {
  try {
    // const iconBuffer = request.body.icon ? Buffer.from(request.body.icon, 'base64') : null;
    // const bannerBuffer = request.body.banner ? Buffer.from(request.body.banner, 'base64') : null;
    const group = await GroupController.createGroup(request.body)
    console.log("This should be group", group)
    return response.status(201).send(group);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// get group information by ID
// leverages the getGroup function from the groupController
router.get("/info/:id", async (request, response) => {
  try {
    const groupId = request.params.id;
    const group = await Group.findById(groupId);

    if (!group) {
      return response.status(404).json({ message: "Group not found" });
    }

    return response.status(200).json(group);
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

// get all groups beginning with request
// Joe
router.get("/getAllGroups/", async (request, response) => {
  try {
    const groups = await Group.find(
      {},
      { _id: 1, name: 1, icon: 1, location: 1 }
    );

    if (!groups || groups.length === 0) {
      return response.status(404).json({ message: "No groups found" });
    }

    // Construct array of objects containing _id, location, and icon
    const formattedGroups = groups.map((group) => ({
      id: group._id,
      name: group.name,
      location: group.location,
      icon: group.icon,
    }));

    return response.status(200).json(formattedGroups);
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

// get group information by chatroomID
router.get("/chatroom/:id", async (request, response) => {
  try {
    const chatID = request.params.id;
    const group = await Group.findOne({ chat: chatID });
    if (!group) {
      return response.status(200).json(null);
    }

    return response.status(200).json(group);
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

// update group's information by ID
router.put("/update/:id", requireAuth, async (request, response) => {
  try {
    const groupId = request.params.id;
    const result = await Group.findByIdAndUpdate(groupId, request.body, {
      new: true,
    }); // Ensure updated group is returned

    if (!result) {
      return response.status(404).json({ message: "Group not found" });
    }

    return response
      .status(200)
      .json({ message: "Group updated successfully", group: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// update group when someone joins group by ID
router.put("/update/:groupId/:userId", requireAuth, async (request, response) => {
  try {
    const groupId = request.params.groupId;
    const userId = request.params.userId;
    const group = await Group.findById(groupId);
    let members = group.members;
    members.push(userId);
    request.body.members = members;
    const result = await Group.findByIdAndUpdate(groupId, request.body, {
      new: true,
    }); // Ensure updated group is returned

    if (!result) {
      return response.status(404).json({ message: "Group not found" });
    }

    return response
      .status(200)
      .json({ message: "Group updated successfully", group: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// get all groups beginning with request
router.get("/searchAll/:query", async (request, response) => {
  try {
    const name = request.params.query;
    const regexQuery = new RegExp("^" + name, "i");

    const groups = await Group.find(
      { name: regexQuery },
      { _id: 1, name: 1, icon: 1 }
    );

    if (!groups) {
      return response.status(404).json({ message: "No groups found" });
    }

    return response.status(200).json(groups);
  } catch (error) {
    console.error(error.message);
    response.status(500).send({ message: error.message });
  }
});

// delete group by ID
router.delete("/:id", requireAuth, async (request, response) => {
  try {
    const groupId = request.params.id;
    const result = await Group.findByIdAndDelete(groupId);

    if (!result) {
      return response.status(404).json({ message: "Group not found" });
    }

    return response.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;


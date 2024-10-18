/**
 * Route file for users
 * File contains functionality for CRUD operations on users
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from 'express';
import { requireAuth, requireSignin } from '../services/passport.js';
import * as UserController from '../controllers/userController.js';
import * as SecurityController from '../controllers/securityController.js';

// create a new router
const router = express.Router();

// Function: get user's information by ID
// Returns: user's information
// Parameters: user ID
router.get('/info/:id', async (request, response) => {
    try {
        const user = await UserController.getUser(request.params.id);
        // console.log(user);
        return response.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Function: get user's information by email
// Returns: user's information
// Parameters: user email
router.get('/info/email/:email', async (request, response) => {
    try {
        const user = await UserController.getUserByEmail(request.params.email);
        // console.log(user);
        return response.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Function: update user
// Returns: updated user
// Parameters: user ID, updated user information
router.put('/update/:id', requireAuth, async (request, response) => {
    try {
        // if (
        //     !request.body.gender ||
        //     !request.body.pic ||
        //     !request.body.bio ||
        //     !request.body.workouts
        // ) {
        //     return response.status(400).send({
        //         message: 'Send all required fields: gender, pic, bio, workouts'
        //     });
        // }

        const result = await UserController.updateUser(request.params.id, request.body);
        
        if (!result) {
            return response.status(404).json({ message: 'User not found' });
        }

        return response.status(200).json({ message: 'User updated successfully', user: result });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Function: update user's password
// Returns: updated user
// Parameters: user ID, new password
router.put('/update/password/:id', async(req, res) => {
    try {
        const result = await UserController.changePassword(req.params.id, req.body.newPassword);
        if (result) {
            res.status(200).send({ message: 'Password updated successfully', user: result })
        }
        res.status(404).json({ message: 'Error in changing password' });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// Function: delete user
// Returns: confirmation message
// Parameters: user ID
router.delete('/delete/:id', requireAuth, async (req, res) => {
    try {
        const result = await UserController.deleteUser(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// Taken from CS52 curriculum
router.post('/signin', requireSignin, async (req, res) => {
    try {
      const result = await UserController.signin(req.user);
    //   console.log("signin", result)
      res.json({ token: result.token, user: result.user });
    } catch (error) {
      res.status(422).send({ error: error.toString() });
    }
});

// Taken from CS52 curriculum
router.post('/signup', async (req, res) => {
    try {
        const token = await UserController.signup(req.body);
        // console.log(token);
        res.json({ token, email: req.body.email });
    } catch (error) {
        res.status(422).send({ error: error.toString() });
    }
});

router.put('/reset', async(req, res) => {
    try {
        const security = await SecurityController.getSecurityByEmail(req.body.userEmail);
        const user = await UserController.getUserByEmail(req.body.userEmail);
        const userID = user[0]._id;
        if (security[0].teacher == req.body.teacher && security[0].maiden == req.body.maiden) {
            const result = await UserController.changePassword(userID, req.body.newPassword);
            if (result) {
                return res.json({ user: result });
            }
            else {
                return res.json({ error: 'Error updating user' });
            }
        }
        else {
            return res.json({ error: "Wrong answers to security questions"})
        }
        
    }
    catch (error) {
        console.log("This is an error", error.message);
        res.status(500).send({ error: error.toString() });
    }
});

export default router;

// Refactored from CS52: https://brunchlabs.notion.site/Schedule-7457e761c83f4b37bbbdca10e045b1d9?p=b2d5bb7f6ab3421ba2f96ae25c4761e9&pm=s

/**
 * Controller file for users routes
 * Functions return promises
 * which are handled in the routes
 * such that they can then be invoked in the front end with axios
 */

import { User } from '../models/userModel.js';
import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";

dotenv.config({ silent: true });

// encodes a new token for a user object
function tokenForUser(user) {
    // const timestamp = new Date().getTime();
    return jwt.encode({ sub: user._id, iat: Math.round(Date.now() / 1000), exp: Math.round(Date.now() / 1000 + 5 * 60 * 60) }, process.env.AUTH_SECRET);
  }

export const signin = (user) => {
    // WORK: can make this more complex by throwing some error messages if the email doesn't exist/password is incorrect
    // Can also send a message to redirect to sign up page
    return { token: tokenForUser(user), user };
}

export const signup = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('You must provide email and password');
      }
      
      // See if a user with the given email exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // If a user with email does exist, return an error
        throw new Error('Email is in use');
      }
      
      const user = new User();
      user.email = email;
      user.password = password;

      user.firstName = '';
      user.lastName = '';
      user.id = '';
      user.profilePic = 'https://res.cloudinary.com/flexnfriends/image/upload/v1709621931/gfrwquddesnkp2fqtb9x.jpg';
      user.phoneNumber = '';
      user.timeCreated = Date.now() / 1000;
      user.data = {};
      user.workouts = [];
      user.schedule = {};
      user.events = [];
      user.teamWorkouts = [];
      user.groups = [];
      user.settings = {};

      await user.save();
      
      return tokenForUser(user);

}

// export async function createUser(request) {
//     const newUser = {
//         _userId: request.body._userId,
//         fullName: request.body.fullName,
//         bday: request.body.bday,
//     };

//     const user = await User.create(newUser);
//     return user;
// }


// Function to get user
// Inputs: id of the user
// Outputs: the user object
export async function getUser(id) {
    const user = await User.findById(id).lean();
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

// Function to update user
// Inputs: id of the user, the data to update
// Outputs: the user object updated
export async function updateUser(id, userFields) {
    const result = await User.findByIdAndUpdate(id, userFields).lean();
    return result;
}

// Function to delete user
// Inputs: id of the user
// Outputs: a message confirming the deletion (and the user gets deleted)
export async function deleteUser(id) {
    const result = await User.findByIdAndDelete(id).lean();
    return result;
}

// Function to get all users
// Inputs: email
// Outputs: the user object with the associated email
export async function getUserByEmail(email) {
    const result = await User.find( { email: email })
    return result[0]
}

// Function to change password
// Inputs: id of the user, new password
// Outputs: the user object with the updated password
export async function changePassword(id, password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const result = await User.findByIdAndUpdate(id, { password: hash }).lean();
    return result;
}

/**
 * Model file for security schema
 * Models are designed based on spec, then meshed in order to work with front end
 * these are leveraged in the routes in order to ensure that data is being handled correctly
 * and that the database is being interacted with in a consistent manner
 */


import mongoose from 'mongoose';

// Security schema
const securitySchema = new mongoose.Schema({
    // pass in userEmail during signup
    userEmail: { 
        type: String,
        required: true,
    },
    // answer to security question: "What is your mother's maiden name?"
    maiden: { 
        type: String,
        required: true,
    },
    // answer to security question: "What is your favorite teacher's name?"
    teacher: {
        type: String,
        required: true
    }
},
{
    timestamps: true,
});

export const Security = mongoose.model('Security', securitySchema);

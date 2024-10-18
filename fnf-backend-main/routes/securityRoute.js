/**
 * Route file for security
 * File contains functionality for CRUD operations on security
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from 'express';
import * as Security from '../controllers/securityController.js';
import { requireAuth } from '../services/passport.js';

const router = express.Router();

// Security routes

// Base route, just gets all security/posts
router.route('/')
    .get(requireAuth, async (req, res) => {
        // careful, this should never be called by frontend, just for testing
        try {
            const security = await Security.getSecurityAll();
            res.status(200).json(security);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    // should not require Auth since user shouldn't have a token yet
    .post(async (req, res) => {
        try {
            // console.log(req);
            const newSecurity = await Security.createSecurity(req.body);
            console.log(newSecurity);
            res.status(201).json(newSecurity);
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error.message });
        }
    });

// Route to get/put user, takes email
// Note this is the users id
router.route('/:email')
    .get(requireAuth, async (req, res) => {
        // this should also never be called
        try {
            const security = await Security.getSecurity(req.params.email);
            console.log(security)
            res.status(200).json(security);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .put(requireAuth, async (req, res) => {
        try {
            const updatedSecurity = await Security.updateSecurity(req.params.email, req.body)
            res.status(200).json(updatedSecurity);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(requireAuth, async (req, res) => {
        try {
            const result = await Security.deleteSecurity(req.params.email);
            res.status(200).json({ message: result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })

export default router;

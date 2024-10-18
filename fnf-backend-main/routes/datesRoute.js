/**
 * Route file for dates
 * File contains functionality for CRUD operations on security
 * continual testing done on postman, then deployed using railway
 * These routes are leveraged by axios on the front end
 */

import express from 'express';
import { createDate, getDates, updateDate, deleteDate, upsertDate } from '../controllers/dateController.js';
import { Date } from '../models/dateModel.js'

const router = express.Router();

// Route to post a new date
// Leverages the createDate function from the dateController
router.post('/', async (req, res) => {
    try {
        const newDate = await createDate(req.body);
        res.status(201).json(newDate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route to get all dates
// Leverages the getDates function from the dateController
router.get('/:id', async (req, res) => {
    try {
        const dates = await getDates(req.params.id);
        res.status(200).json(dates);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route to get all dates
// Leverages the getDates function from the dateController
router.get("/search/:query", async (request, response) => {
    try {
      const userID = request.params.query;
  
      const dates = await Date.find(
        { user: userID }
      );
  
      if (!dates || dates.length > 1) {
        return response.status(404).json({ message: "An error getting dates occurred" });
      }
  
      return response.status(200).json(dates[0]);
    } catch (error) {
      console.error(error.message);
      response.status(500).send({ message: error.message });
    }
  });

// Route to update a date
// Leverages the updateDate function from the dateController
router.put('/:id', async (req, res) => {
    try {
        const updatedDate = await updateDate(req.params.id, req.body);
        res.status(200).json(updatedDate);
    } catch (error) {    
        res.status(400).json({ message: error.message });
    }
});

// Route to delete a date
// Leverages the deleteDate function from the dateController
router.delete('/:id', async (req, res) => {
    try {
        await deleteDate(req.params.id);
        res.status(200).json({ message: 'Date deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/upsert/:id', async (req, res) => {
    try {
        const updatedOrNewDate = await upsertDate(req.params.id, req.body);
        console.log("Date:", updatedOrNewDate);
        res.status(200).json(updatedOrNewDate);
    } catch (error) {
        console.log("Date error", error)
        res.status(400).json({ message: error });
    }
});

export default router;

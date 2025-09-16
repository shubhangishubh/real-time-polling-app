import express from 'express';
import { createPoll, getPoll, listPolls } from '../controllers/pollController.js';

const router = express.Router();

router.post('/', createPoll);
router.get('/', listPolls);
router.get('/:id', getPoll);

export default router;




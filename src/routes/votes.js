import express from 'express';
import { submitVote } from '../controllers/voteController.js';

const router = express.Router();

router.post('/:pollId/votes', submitVote);

export default router;




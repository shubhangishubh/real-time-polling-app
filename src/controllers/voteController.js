
import prisma from '../db.js';
let io; // will be set from sockets.js

export function setSocketIo(_io) {
  io = _io;
}

/**
 * Submit a vote:
 * POST /polls/:pollId/votes
 * body: { userId, pollOptionId }
 */
export async function submitVote(req, res, next) {
  try {
    const pollId = req.params.pollId;
    const { userId, pollOptionId } = req.body;

    if (!userId || !pollOptionId) {
      return res.status(400).json({ error: 'userId and pollOptionId required' });
    }

    // validate poll exists
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // validate option belongs to poll
    const option = await prisma.pollOption.findUnique({ where: { id: pollOptionId } });
    if (!option || option.pollId !== pollId) {
      return res.status(400).json({ error: 'Poll option not found for this poll' });
    }

    // validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent a user from voting multiple options in the same poll (one vote per poll)
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        pollOption: { pollId }
      }
    });
    if (existingVote) {
      return res.status(400).json({ error: 'User has already voted on this poll' });
    }

    // create the vote
    const vote = await prisma.vote.create({
      data: {
        user: { connect: { id: userId } },
        pollOption: { connect: { id: pollOptionId } },
        poll: { connect: { id: pollId } }
      }
    });

    // compute updated counts per option (efficient and simple)
    const optionsWithCounts = await prisma.pollOption.findMany({
      where: { pollId },
      include: { _count: { select: { votes: true } } }
    });

    const results = optionsWithCounts.map(o => ({
      optionId: o.id,
      text: o.text,
      votes: o._count.votes
    }));

    // Broadcast to connected clients in room for this poll
    if (io) {
      io.to(getPollRoomName(pollId)).emit('pollUpdated', { pollId, results });
    }

    res.status(201).json({ voteId: vote.id, pollId, results });
  } catch (err) {
    next(err);
  }
}

export function getPollRoomName(pollId) {
  return `poll_${pollId}`;
}

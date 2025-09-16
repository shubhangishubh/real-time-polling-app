import prisma from '../db.js';

/**
 * Create a poll with options:
 * POST /polls
 * body: { question, creatorId, options: ["a","b"], isPublished: true }
 */
async function createPoll(req, res, next) {
  try {
    const { question, creatorId, options = [], isPublished = false } = req.body;
    if (!question || !creatorId || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'question, creatorId and at least 2 options required' });
    }

    // validate user exists
    const user = await prisma.user.findUnique({ where: { id: creatorId }});
    if (!user) return res.status(404).json({ error: 'Creator user not found' });

    const poll = await prisma.poll.create({
      data: {
        question,
        isPublished,
        creatorId,
        options: {
      create: options.map(option => ({ text: option.text })) // nested creation
    }
      },
      include: { options: true }
    });
   
    res.status(201).json(poll);
  } catch (err) {
    next(err);
  }
}




/**
 * Get poll with options + vote counts
 * GET /polls/:id
 */
async function getPoll(req, res, next) {
  try {
    const id = req.params.id;
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } }
          }
        },
        creator: { select: { id: true, name: true, email: true } }
      }
    });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    const result = {
      id: poll.id,
      question: poll.question,
      isPublished: poll.isPublished,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      creator: poll.creator,
      options: poll.options.map(o => ({
        id: o.id,
        text: o.text,
        votes: o._count.votes
      }))
    };
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * List polls (simple)
 */
async function listPolls(req, res, next) {
  try {
    const polls = await prisma.poll.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, name: true } } }
    });
    res.json(polls);
  } catch (err) {
    next(err);
  }
}

export { createPoll, getPoll, listPolls };




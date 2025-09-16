import prisma from '../db.js';
import { hashPassword } from '../utils/hash.js';

async function createUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password required' });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });
    const { passwordHash: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === 'P2002') {
      err.status = 409;
      err.message = 'Email already in use';
    }
    next(err);
  }
}

async function getUser(req, res, next) {
  try {

    const id = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}


export { createUser, getUser };

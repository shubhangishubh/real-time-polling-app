import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import usersRoute from './routes/users.js';
import pollsRoute from './routes/polls.js';
import votesRoute from './routes/votes.js';
import errorHandler from './utils/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/users', usersRoute);
app.use('/polls', pollsRoute);
// votes nested under /polls (POST /polls/:pollId/votes)
app.use('/polls', votesRoute);

// health
app.get('/', (req, res) => res.json({ ok: true, timestamp: new Date() }));

// error handler
app.use(errorHandler);

export default app;

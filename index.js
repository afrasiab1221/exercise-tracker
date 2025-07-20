const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const users = [];
const exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST /api/users
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = Date.now().toString(); // fake unique ID
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// GET /api/users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(400).send('User not found');

  const exerciseDate = date ? new Date(date) : new Date();
  const formattedDate = exerciseDate.toDateString();

  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: formattedDate,
    _id: user._id
  };

  exercises.push({ ...exercise, rawDate: exerciseDate }); // rawDate for log filtering
  res.json(exercise);
});

// GET /api/users/:_id/logs
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(400).send('User not found');

  let userLogs = exercises.filter(ex => ex._id === user._id);

  // Optional filters
  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    userLogs = userLogs.filter(ex => ex.rawDate >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userLogs = userLogs.filter(ex => ex.rawDate <= toDate);
  }

  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit));
  }

  const log = userLogs.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

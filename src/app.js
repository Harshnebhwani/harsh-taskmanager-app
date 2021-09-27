const express = require('express');

require('./db/mongoose');

const app = express();

const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

module.exports = app
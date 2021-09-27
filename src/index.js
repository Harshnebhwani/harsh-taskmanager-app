const express = require('express');

require('./db/mongoose');

const app = express();
const port = process.env.PORT;

const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("Server listening on "+ port);
})
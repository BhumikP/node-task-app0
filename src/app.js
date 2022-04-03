const express = require("express");
require("./db/mongoose");
const userRouter = require("./router/user");
const taskRouter = require("./router/task");

const app = express();

//It passes incoming jason as objects so, we can use it in our handlers
app.use(express.json());

app.use("/users", userRouter);
app.use("/tasks", taskRouter);

module.exports = app;

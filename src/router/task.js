const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const router = new express.Router();

router.get("/", auth, async (req, res) => {
  ////GET tasks?Completed:true
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  //GET tasks?sortBy=createdAt:desc
  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // console.log(req.user);
    // const task = await Task.find({});
    // const task = await Task.find({ owner: req.user._id });
    // console.log(task);

    /*************example:- completed=true&limit=1&skip=1 **************/

    //reference documents in other collections.

    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    // const task = Task.findById(id);

    const task = await Task.findOne({ id, owner: req.user._id });
    console.log("task", task);
    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (e) {
    res.status(500).send("There was a problem finding the task.");
  }
});

router.post("/", auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  console.log(task);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(401).send(e);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const allowedUpdates = ["description", "completed"];
  const updatesFromReq = Object.keys(req.body);

  const isValidOperation = updatesFromReq.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    /*It bypass the pre method (Directly perform update in db)*/
    // const task = await Task.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // const task = await Task.findById(id);
    const task = await Task.findById({
      id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }

    updatesFromReq.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const task = await Task.findByIdAndDelete({ id, owner: req.user._id });
    // const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Task = require("../models/Task"); // Assuming you have a Task model
const User = require("../models/User");


// Create a new task
router.post("/tasks", async (req, res) => {
  const { name, description, dueDate, priority, status } = req.body;
  const task = new Task({ name, description, dueDate, priority, status });
  try {
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single task by ID
router.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    res.json(task);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Update a task
router.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, dueDate, priority, status } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { name, description, dueDate, priority, status },
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task
router.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

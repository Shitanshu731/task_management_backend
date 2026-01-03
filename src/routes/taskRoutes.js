const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");
const {
  validateTask,
  validateTaskUpdate,
} = require("../middleware/validation");

router.post("/tasks", validateTask, TaskController.createTask);
router.get("/tasks", TaskController.getAllTasks);
router.patch("/tasks/:id", validateTaskUpdate, TaskController.updateTask);
router.delete("/tasks/:id", TaskController.deleteTask);

module.exports = router;

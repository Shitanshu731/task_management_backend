const Task = require("../models/taskModel");

class TaskController {
  static async createTask(req, res) {
    try {
      const { title, description, status } = req.body;
      const task = await Task.create(title, description, status);

      // Get user info from socket
      const socketId = req.headers["x-socket-id"];
      const user = req.connectedUsers.get(socketId);

      const taskWithUser = {
        ...task,
        created_by: user ? user.username : "Unknown User",
        created_by_color: user ? user.color : "#6366f1",
      };

      // Emit socket event for real-time update
      req.io.emit("task:created", taskWithUser);

      res.status(201).json({
        success: true,
        data: taskWithUser,
      });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create task",
      });
    }
  }

  static async getAllTasks(req, res) {
    try {
      const { status } = req.query;
      const tasks = await Task.findAll(status);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tasks",
      });
    }
  }

  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      const updatedTask = await Task.update(id, updates);

      // Get user info from socket
      const socketId = req.headers["x-socket-id"];
      const user = req.connectedUsers.get(socketId);

      const taskWithUser = {
        ...updatedTask,
        updated_by: user ? user.username : "Unknown User",
        updated_by_color: user ? user.color : "#6366f1",
      };

      // Emit socket event for real-time update
      req.io.emit("task:updated", taskWithUser);

      res.status(200).json({
        success: true,
        data: taskWithUser,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update task",
      });
    }
  }

  static async deleteTask(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.delete(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      // Get user info from socket
      const socketId = req.headers["x-socket-id"];
      const user = req.connectedUsers.get(socketId);

      // Emit socket event for real-time update
      req.io.emit("task:deleted", {
        id: parseInt(id),
        deleted_by: user ? user.username : "Unknown User",
        deleted_by_color: user ? user.color : "#6366f1",
      });

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
        data: task,
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete task",
      });
    }
  }
}

module.exports = TaskController;

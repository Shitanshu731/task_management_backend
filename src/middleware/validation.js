const validateTask = (req, res, next) => {
  const { title, description, status } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (title && title.length > 255) {
    errors.push("Title must not exceed 255 characters");
  }

  if (status && !["pending", "in-progress", "completed"].includes(status)) {
    errors.push("Status must be one of: pending, in-progress, completed");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

const validateTaskUpdate = (req, res, next) => {
  const { title, description, status } = req.body;
  const errors = [];

  if (title !== undefined && title.trim().length === 0) {
    errors.push("Title cannot be empty");
  }

  if (title && title.length > 255) {
    errors.push("Title must not exceed 255 characters");
  }

  if (status && !["pending", "in-progress", "completed"].includes(status)) {
    errors.push("Status must be one of: pending, in-progress, completed");
  }

  if (Object.keys(req.body).length === 0) {
    errors.push("At least one field must be provided for update");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

module.exports = { validateTask, validateTaskUpdate };

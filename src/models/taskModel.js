const pool = require("../config/database");

class Task {
  static async create(title, description, status = "pending") {
    const query = `
      INSERT INTO tasks (title, description, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [title, description, status];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(status = null) {
    let query = "SELECT * FROM tasks";
    const values = [];

    if (status) {
      query += " WHERE status = $1";
      values.push(status);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = "SELECT * FROM tasks WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);
    const query = `
      UPDATE tasks 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM tasks WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Task;

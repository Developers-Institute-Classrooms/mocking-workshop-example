const pool = require("./db");

module.exports = {
  getAllTodos: async () => {
    try {
      const allTodos = await pool.query("SELECT * FROM todo");
      return allTodos.rows;
    } catch (err) {
      console.error(err.message);
    }
  },
  getTodo: async (id) => {
    try {
      const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
        id,
      ]);
      return todo.rows[0];
    } catch (err) {
      console.error(err.message);
    }
  },
  addTodo: async (description) => {
    try {
      const newTodo = await pool.query(
        "INSERT INTO todo (description) VALUES($1) RETURNING *",
        [description]
      );
      return newTodo.rows[0];
    } catch (err) {
      console.error(err.message);
    }
  },
  updateTodo: async (id, description) => {
    try {
      const updateTodo = await pool.query(
        "UPDATE todo SET description = $1 WHERE todo_id = $2 RETURNING todo_id, description",
        [description, id]
      );
      return updateTodo.rows[0];
    } catch (err) {
      console.error(err.message);
    }
  },
  deleteTodo: async (id) => {
    try {
      const deleteTodo = await pool.query(
        "DELETE FROM todo WHERE todo_id = $1 RETURNING todo_id, description",
        [id]
      );

      return deleteTodo.rows[0];
    } catch (err) {
      console.error(err.message);
    }
  },
};

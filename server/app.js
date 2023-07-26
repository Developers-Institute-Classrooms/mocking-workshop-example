require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "./apispec.yaml"), "utf8")
);

//middleware
app.use(cors());
app.use(express.json()); //req.body

//ROUTES//
app.use("/api/spec", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//create a todo

app.post("/api/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo (description) VALUES($1) RETURNING *",
      [description]
    );
    res.status(201).json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//get all todos

app.get("/api/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todo");
    return res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo

app.get("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
      id,
    ]);
    if (todo.rows[0] === undefined) {
      res.sendStatus(404);
    } else {
      res.json(todo.rows[0]);
    }
  } catch (err) {
    console.error(err.message);
  }
});

//update a todo

app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updateTodo = await pool.query(
      "UPDATE todo SET description = $1 WHERE todo_id = $2 RETURNING todo_id, description",
      [description, id]
    );
    if (updateTodo.rows[0] === undefined) {
      return res.sendStatus(404);
    }
    if (description === undefined || typeof description !== "string") {
      res.statusMessage = "Request body does not contain a description";
      return res.status(400).end();
    }
    return res.status(200).json(updateTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//delete a todo

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query(
      "DELETE FROM todo WHERE todo_id = $1 RETURNING todo_id, description",
      [id]
    );
    if (deleteTodo.rows[0] === undefined) {
      res.sendStatus(404);
    } else {
      res.status(200).json("Todo was deleted!");
    }
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = app;

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const repository = require("./repository");
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
    const newTodo = await repository.addTodo(description);
    res.status(201).json(newTodo);
  } catch (err) {
    console.error(err.message);
  }
});

//get all todos

app.get("/api/todos", async (req, res) => {
  try {
    const allTodos = await repository.getAllTodos();
    return res.json(allTodos);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo

app.get("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await repository.getTodo(id);
    if (todo === undefined) {
      res.sendStatus(404);
    } else {
      res.json(todo);
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
    const updateTodo = await repository.updateTodo(id, description);
    if (updateTodo === undefined) {
      return res.sendStatus(404);
    }
    if (description === undefined || typeof description !== "string") {
      res.statusMessage = "Request body does not contain a description";
      return res.status(400).end();
    }
    return res.status(200).json(updateTodo);
  } catch (err) {
    console.error(err.message);
  }
});

//delete a todo

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await repository.deleteTodo(id);
    if (deleteTodo === undefined) {
      res.sendStatus(404);
    } else {
      res.status(200).json("Todo was deleted!");
    }
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = app;

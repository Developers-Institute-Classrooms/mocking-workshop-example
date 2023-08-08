const express = require("express");
const router = express.Router();
const repository = require("./repository");

router.post("/", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await repository.addTodo(description);
    res.status(201).json(newTodo);
  } catch (err) {
    console.error(err.message);
  }
});

//get all todos

router.get("/", async (req, res) => {
  try {
    const allTodos = await repository.getAllTodos();
    return res.json(allTodos);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo

router.get("/:id", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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

module.exports = router;

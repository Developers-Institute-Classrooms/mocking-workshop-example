const request = require("supertest");
const app = require("./app");
const pool = require("./db");
const { getAllTodos } = require("./repository");

jest.mock("./repository");

describe("Todos API", () => {
  afterEach(async () => {
    await pool.query("DELETE from todo");
    jest.restoreAllMocks();
  });

  afterAll(() => {
    pool.end();
  });

  test("GET /todos: WHEN there are todos in the database THEN return status 200 and an array of todos", async () => {
    /* await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (1, 'Start working on my project')  
    `);*/

    const expectedResponseBody = [
      {
        todo_id: 1,
        description: "Start working on my project",
      },
    ];
    getAllTodos.mockImplementation(() => {
      return expectedResponseBody;
    });
    const response = await request(app)
      .get("/api/todos")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("GET /todos: WHEN there are no todos in the database THEN return status 200 and an empty array", async () => {
    const expectedResponseBody = [];
    const response = await request(app)
      .get("/api/todos")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("POST /todos: WHEN the client sends a well-formatted request THEN create a todo and return status 201 and the todo", async () => {
    const requestBody = {
      description: "Start working on my project",
    };
    const response = await request(app).post("/api/todos").send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining(requestBody));
  });

  test("GET /todos/:id: WHEN the client sends a request for an existing todo ID THEN return status 200 and the requested todo", async () => {
    const testId = 1;
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${testId}, 'Start working on my project')`);
    const expectedResponseBody = {
      todo_id: testId,
      description: "Start working on my project",
    };
    const response = await request(app)
      .get(`/api/todos/${testId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("GET /todos/:id: WHEN the client sends a request for a non-existent todo ID THEN return status 404", async () => {
    const testId = 1;
    const testNonExistentId = 2;
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${testId}, 'Start working on my project')`);
    const response = await request(app)
      .get(`/api/todos/${testNonExistentId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
  });

  test("PUT /todos/:id: WHEN the client sends a request to update an existing todo ID AND the request is well-formatted THEN return status 200 and the updated todo", async () => {
    const testId = 1;
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${testId}, 'Start working on my project')`);
    const requestBody = {
      description: "Start working on my dev project",
    };
    const expectedResponseBody = {
      todo_id: testId,
      description: "Start working on my dev project",
    };
    const response = await request(app)
      .put(`/api/todos/${testId}`)
      .set("Accept", "application/json")
      .send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("PUT /todos/:id: WHEN the client sends a request for a non-existent todo ID THEN return status 404", async () => {
    const testId = 1;
    const testNonExistentId = 2;
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${testId}, 'Start working on my project')`);
    const requestBody = {
      description: "Start working on my dev project",
    };
    const response = await request(app)
      .put(`/api/todos/${testNonExistentId}`)
      .send(requestBody)
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
  });

  test("PUT /todos/:id: WHEN  the client sends a request to update an existing todo ID AND the request is NOT well-formatted THEN return status 400 and an error message", async () => {
    const testId = 1;
    const errorMessage = "Request body does not contain a description";
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${testId}, 'Start working on my project')`);
    const requestBody = {};
    const response = await request(app)
      .put(`/api/todos/${testId}`)
      .send(requestBody)
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.res.statusMessage).toEqual(errorMessage);
  });

  test("DELETE /todos/:id: WHEN the client sends a request to delete an existing todo ID THEN delete the todo and return status 200", async () => {
    const testId = 1;
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${testId}, 'Start working on my project')`);
    const expectedResponseBody = "Todo was deleted!";
    const response = await request(app).delete(`/api/todos/${testId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("DELETE /todos/:id: WHEN the client sends a request to delete a non-existing todo ID THEN return status 404", async () => {
    const testId = 1;
    const testNonExistentId = 2;
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${testId}, 'Start working on my project')`);
    const response = await request(app).delete(
      `/api/todos/${testNonExistentId}`
    );

    expect(response.status).toBe(404);
  });
});

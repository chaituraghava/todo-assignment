const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
import { format, compareAsc } from 'date-fns'

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();



const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty=(requestQuery)=>{
    return requestQuery.status!==undefined;
};
const hasCategoryAndStatusProperties=(requestQuery)=>{
    return requestQuery.status!==undefined;
};
const hasCategoryAndPriorityProperties=(requestQuery)=>{
    return requestQuery.status!==undefined;
};






app.get("/todos/",async(request,response)=>{
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status,category,due_date} = request.query;

    switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;

      case hasCategoryProperty(request.query):
          getTodosQuery=`select * from todo where todo like '%${search_q}%'
          and category ='${category}';`;
      break;
      case hasCategoryAndStatusProperties(request.query):
          getTodosQuery=`SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category='%${category}'`;
      break;
      case hasCategoryAndPriorityProperties(request.query):
          getTodosQuery=`SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        priority = '${priority}'
        AND category='%${category}';`;
        break;
     default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});


app.get("/agenda/",async(request,response)=>{
    
    const date=format(new Date(2021, 1, 21), 'yyyy-MM-dd');
    const getQuery=`select * from todo where due_date=${date};`;
    const result=await database.get(getQuery);
    response.send(result);

});


app.post("/todos/",async(request,response)=>{
    const{id,todo,priority,status,category,dueDate}=request.body;
    const postQuery=`INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}','${category}','${dueDate}');`;

    await database.run(postQuery);
    response.send("Todo Successfully Added");
});




app.put("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    let updateColumn="";
    const requestBody=request.body;
     switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category!==undefined:
          updateColumn="Category";
      break;
    case requestBody.dueDate!==undefined:
        updateColumn="Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
     category=previousTodo.category,
     dueDate=previousTodo.dueDate,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);

});

app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const deleteQuery= `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports=app;
